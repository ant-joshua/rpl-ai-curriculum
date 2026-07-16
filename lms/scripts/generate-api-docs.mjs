#!/usr/bin/env node
/**
 * Generate OpenAPI 3.0 spec from API route file structure.
 * Outputs to static/api/openapi.json for serving.
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesDir = path.resolve(__dirname, '../src/routes/api');
const outDir = path.resolve(__dirname, '../static/api');
const outFile = path.join(outDir, 'openapi.json');

const spec = {
	openapi: '3.0.3',
	info: {
		title: 'LMS API',
		description: 'REST API for RPL AI Curriculum Learning Management System',
		version: '1.0.0',
	},
	servers: [
		{ url: 'https://lms-syllabus.ant-joshua.my.id', description: 'Production' },
	],
	security: [{ BearerAuth: [] }],
	components: {
		securitySchemes: {
			BearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description: 'Paste your admin/instructor token',
			},
		},
		schemas: {
			Error: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: false },
					error: { type: 'string', example: 'Not found' },
				},
			},
			Success: {
				type: 'object',
				properties: {
					success: { type: 'boolean', example: true },
					data: { type: 'object' },
				},
			},
		},
	},
	paths: {},
};

function param(name, type, location, required, desc) {
	return {
		name,
		in: location || 'query',
		schema: { type: type || 'string' },
		required: !!required,
		description: desc || '',
	};
}

function collectRoutes(dir, basePath = '') {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			// Convert [param] to {param} for OpenAPI path templating
			const seg = entry.name.replace(/\[([^\]]+)\]/g, '{$1}');
			collectRoutes(full, `${basePath}/${seg}`);
		} else if (entry.name.startsWith('+server.ts') || entry.name.startsWith('+server.js')) {
			// Extract HTTP methods from file exports
			const content = fs.readFileSync(full, 'utf-8');
			const apath = basePath || '/';
			if (!spec.paths[apath]) spec.paths[apath] = {};

			for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) {
				if (content.includes(`export async function ${method}`) || content.includes(`export const ${method}`)) {
					// Determine tags from path segments
					const segs = apath.split('/').filter(Boolean);
					const tag = segs.length > 0 ? (segs[0] === 'api' ? segs[1] || 'general' : segs[0]) : 'general';

					const op = {
						tags: [tag],
						summary: `${method} ${apath}`,
						description: describeEndpoint(apath, method),
						parameters: [
							param('Authorization', 'string', 'header', true,
								'Bearer token — login via /api/auth/login or admin token from session'),
						],
						responses: {
							'200': { description: 'Successful response' },
							'400': { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
							'401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
							'403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
							'500': { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
						},
					};

					// Add path parameters
					const pathParams = [...apath.matchAll(/\{(\w+)\}/g)].map(m => m[1]);
					if (pathParams.length > 0) {
						for (const p of pathParams) {
							op.parameters.push(param(p, 'string', 'path', true, `${p} ID`));
						}
					}

					// Check for request body
					if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
						op.requestBody = {
							content: {
								'application/json': {
									schema: {
										type: 'object',
										description: `${method} request payload. See server.ts for exact schema.`,
									},
								},
							},
						};
					}

					spec.paths[apath][method.toLowerCase()] = op;
				}
			}
		}
	}
}

function describeEndpoint(p, method) {
	const map = {
		users: 'User management',
		tenants: 'Tenant management',
		classes: 'Class management',
		subjects: 'Subject/Mata Pelajaran management',
		'class_subjects': 'Class-subject assignments',
		enrollments: 'Student enrollment management',
		attendance: 'Attendance tracking',
		'payment-gateway': 'Payment gateway integration',
		notifications: 'Notification system',
		survey: 'Survey management',
		'report-cards': 'Report card generation',
		'parent-portal': 'Parent portal management',
		'activity-logs': 'Activity logs',
		'exam-scheduler': 'Exam scheduling',
	};
	for (const [key, desc] of Object.entries(map)) {
		if (p.includes(key)) return desc;
	}
	return `${method} endpoint for ${p}`;
}

// Scan API routes
if (!fs.existsSync(routesDir)) {
	console.error('Routes directory not found:', routesDir);
	process.exit(1);
}
collectRoutes(routesDir);

// Reorder paths alphabetically
spec.paths = Object.fromEntries(Object.entries(spec.paths).sort(([a], [b]) => a.localeCompare(b)));

// Write output
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(spec, null, 2));
console.log(`✅ OpenAPI spec written: ${outFile} (${Object.keys(spec.paths).length} paths)`);
