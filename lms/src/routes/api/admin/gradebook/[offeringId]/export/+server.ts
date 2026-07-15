import { getDB } from '$lib/server/d1';

const LETTER_GRADES = [
	{ min: 85, grade: 'A' },
	{ min: 80, grade: 'AB' },
	{ min: 70, grade: 'B' },
	{ min: 65, grade: 'BC' },
	{ min: 55, grade: 'C' },
	{ min: 45, grade: 'D' },
	{ min: 0, grade: 'E' },
];

function calculateLetterGrade(percentage: number): string {
	for (const lg of LETTER_GRADES) {
		if (percentage >= lg.min) return lg.grade;
	}
	return 'E';
}

function escapeHtml(str: string): string {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET({ params, platform }: { params: { offeringId: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		// Get offering
		const offering = await db.prepare('SELECT * FROM course_offerings WHERE id = ?').bind(params.offeringId).first<any>();
		if (!offering) {
			return new Response('Offering not found', { status: 404 });
		}

		// Get active enrollments with user info
		const { results: enrollments } = await db.prepare(
			`SELECT e.*, u.display_name, u.email, u.username
			 FROM enrollments e
			 JOIN users u ON u.id = e.user_id
			 WHERE e.course_offering_id = ? AND e.status = 'active'
			 ORDER BY u.display_name ASC`
		).bind(params.offeringId).all<any>();

		// Get assessments
		const { results: assessments } = await db.prepare(
			'SELECT * FROM assessments WHERE course_offering_id = ? ORDER BY created_at ASC'
		).bind(params.offeringId).all<any>();

		// Get assignments
		const { results: assignments } = await db.prepare(
			'SELECT * FROM assignments WHERE course_offering_id = ? ORDER BY created_at ASC'
		).bind(params.offeringId).all<any>();

		// Get assessment submissions
		const { results: assessmentSubmissions } = await db.prepare(
			`SELECT asub.*, a.type AS assessment_type
			 FROM assessment_submissions asub
			 JOIN assessments a ON a.id = asub.assessment_id
			 JOIN enrollments e ON e.user_id = asub.user_id AND e.course_offering_id = ?
			 WHERE e.status = 'active'`
		).bind(params.offeringId).all<any>();

		// Get assignment submissions
		const { results: assignmentSubmissions } = await db.prepare(
			`SELECT asub.*
			 FROM assignment_submissions asub
			 JOIN enrollments e ON e.user_id = asub.user_id AND e.course_offering_id = ?
			 WHERE e.status = 'active'`
		).bind(params.offeringId).all<any>();

		// Get gradebook summary rows
		const { results: grades } = await db.prepare(
			"SELECT * FROM gradebook WHERE course_offering_id = ? AND assessment_submission_id IS NULL AND assignment_submission_id IS NULL"
		).bind(params.offeringId).all<any>();

		// Parse weight config
		let weightConfig: Record<string, number> = {};
		try {
			weightConfig = offering.grade_weight_config ? JSON.parse(offering.grade_weight_config) : {};
		} catch {
			weightConfig = {};
		}

		const assessmentTypes = [...new Set((assessments || []).map((a: any) => a.type))];
		const hasAssignments = (assignments || []).length > 0;

		if (Object.keys(weightConfig).length === 0) {
			const categories: string[] = [...assessmentTypes];
			if (hasAssignments) categories.push('assignment');
			if (categories.length > 0) {
				const eq = Math.round(100 / categories.length);
				for (const cat of categories) weightConfig[cat] = eq;
				const total = Object.values(weightConfig).reduce((s, v) => s + v, 0);
				if (total < 100 && categories.length > 0) {
					weightConfig[categories[0]] += 100 - total;
				}
			}
		}

		const assessmentTypeMap: Record<string, string> = {};
		for (const a of assessments || []) assessmentTypeMap[a.id] = a.type;

		// Group subs by user
		const userAssessmentSubs: Record<string, any[]> = {};
		const userAssignmentSubs: Record<string, any[]> = {};
		for (const sub of assessmentSubmissions || []) {
			if (!userAssessmentSubs[sub.user_id]) userAssessmentSubs[sub.user_id] = [];
			userAssessmentSubs[sub.user_id].push(sub);
		}
		for (const sub of assignmentSubmissions || []) {
			if (!userAssignmentSubs[sub.user_id]) userAssignmentSubs[sub.user_id] = [];
			userAssignmentSubs[sub.user_id].push(sub);
		}

		// Grade summary map
		const gradeMap: Record<string, { percentage: number | null; letter_grade: string | null }> = {};
		for (const g of grades || []) {
			gradeMap[g.user_id] = { percentage: g.percentage ?? null, letter_grade: g.letter_grade ?? null };
		}

		// Build student rows with rank
		const rows: Array<{
			rank: number;
			userId: string;
			name: string;
			email: string;
			username: string;
			scores: Array<{ score: number | null; max: number }>;
			totalScore: number;
			totalMax: number;
			percentage: number | null;
			letterGrade: string | null;
		}> = [];

		for (const e of enrollments || []) {
			const items: Array<{ id: string; title: string; type: 'assessment' | 'assignment'; maxScore: number }> = [];
			for (const a of assessments || []) items.push({ id: a.id, title: a.title, type: 'assessment', maxScore: a.max_score ?? 100 });
			for (const a of assignments || []) items.push({ id: a.id, title: a.title, type: 'assignment', maxScore: a.max_score ?? 100 });

			const scores: Array<{ score: number | null; max: number }> = [];
			let totalScore = 0;
			let totalMax = 0;

			for (const item of items) {
				let sub: any = null;
				if (item.type === 'assessment') {
					sub = (userAssessmentSubs[e.user_id] || []).find((s: any) => s.assessment_id === item.id) || null;
				} else {
					sub = (userAssignmentSubs[e.user_id] || []).find((s: any) => s.assignment_id === item.id) || null;
				}
				if (sub && sub.score != null) {
					const max = sub.max_score ?? item.maxScore;
					scores.push({ score: sub.score, max });
					totalScore += sub.score;
					totalMax += max;
				} else {
					scores.push({ score: null, max: item.maxScore });
					totalMax += item.maxScore;
				}
			}

			// Use stored grade if available, else compute simple percentage
			let percentage = gradeMap[e.user_id]?.percentage ?? null;
			if (percentage === null && totalMax > 0) {
				// Weighted calculation
				let totalWeightedScore = 0;
				let totalWeightUsed = 0;
				for (const [category, weightPct] of Object.entries(weightConfig)) {
					const weight = weightPct as number;
					if (category === 'assignment') {
						const subs = (userAssignmentSubs[e.user_id] || []).filter((s: any) => s.score != null && s.max_score != null && s.max_score > 0);
						if (subs.length > 0) {
							const avgPct = subs.reduce((sum: number, s: any) => sum + (s.score / s.max_score), 0) / subs.length;
							totalWeightedScore += avgPct * (weight / 100);
							totalWeightUsed += weight;
						}
					} else {
						const subs = (userAssessmentSubs[e.user_id] || []).filter((s: any) => s.assessment_type === category && s.score != null && s.max_score != null && s.max_score > 0);
						if (subs.length > 0) {
							const avgPct = subs.reduce((sum: number, s: any) => sum + (s.score / s.max_score), 0) / subs.length;
							totalWeightedScore += avgPct * (weight / 100);
							totalWeightUsed += weight;
						}
					}
				}
				if (totalWeightUsed > 0) {
					percentage = Math.round((totalWeightedScore / (totalWeightUsed / 100)) * 10) / 10;
				}
			}

			const letterGrade = gradeMap[e.user_id]?.letter_grade ?? (percentage !== null ? calculateLetterGrade(percentage) : null);

			rows.push({
				rank: 0, // assigned after sort
				userId: e.user_id,
				name: e.display_name || e.username || e.email || 'Unknown',
				email: e.email || '',
				username: e.username || '',
				scores,
				totalScore,
				totalMax,
				percentage,
				letterGrade,
			});
		}

		// Sort by percentage descending, then name
		rows.sort((a, b) => {
			const pctA = a.percentage ?? -1;
			const pctB = b.percentage ?? -1;
			if (pctB !== pctA) return pctB - pctA;
			return a.name.localeCompare(b.name);
		});
		rows.forEach((r, i) => { r.rank = i + 1; });

		// Build graded items for table headers
		const gradedItems: Array<{ id: string; title: string; type: string; maxScore: number }> = [];
		for (const a of assessments || []) gradedItems.push({ id: a.id, title: a.title, type: a.type, maxScore: a.max_score ?? 100 });
		for (const a of assignments || []) gradedItems.push({ id: a.id, title: a.title, type: 'assignment', maxScore: a.max_score ?? 100 });

		const now = new Date().toISOString().slice(0, 10);
		const courseName = offering.name || offering.code || 'Course';

		// Build HTML
		const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gradebook — ${escapeHtml(courseName)} — RPL AI LMS</title>
<style>
  :root {
    --bg: #1a1a2e;
    --surface: #16213e;
    --text: #e0e0e0;
    --text-secondary: #a0a0b0;
    --border: #2a2a4a;
    --accent: #4fc3f7;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    padding: 40px;
    line-height: 1.5;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--accent);
  }
  .header h1 {
    font-size: 24px;
    color: var(--accent);
    margin-bottom: 4px;
  }
  .header .meta {
    font-size: 13px;
    color: var(--text-secondary);
  }
  .header .date {
    font-size: 13px;
    color: var(--text-secondary);
    text-align: right;
  }

  .summary {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    font-size: 14px;
  }
  .summary-item {
    background: var(--surface);
    padding: 12px 20px;
    border-radius: 8px;
    border: 1px solid var(--border);
  }
  .summary-item .label {
    font-size: 11px;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.5px;
  }
  .summary-item .value {
    font-size: 20px;
    font-weight: 700;
    color: var(--accent);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }
  th {
    text-align: left;
    padding: 10px 8px;
    border-bottom: 2px solid var(--border);
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    background: var(--surface);
  }
  td {
    padding: 8px;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover { background: rgba(79, 195, 247, 0.05); }

  .rank-col { text-align: center; width: 40px; min-width: 40px; }
  .name-col { min-width: 160px; font-weight: 600; }
  .email-col { font-size: 11px; color: var(--text-secondary); }
  .score-cell { text-align: center; min-width: 50px; }
  .score-null { color: var(--text-secondary); opacity: 0.5; }
  .score-value { font-weight: 600; }
  .total-col { text-align: center; font-weight: 700; min-width: 60px; }
  .pct-col { text-align: center; font-weight: 700; min-width: 50px; }
  .grade-col { text-align: center; font-weight: 700; min-width: 40px; }

  .grade-A, .grade-AB { color: #4caf50; }
  .grade-B, .grade-BC { color: #8bc34a; }
  .grade-C { color: #ffc107; }
  .grade-D { color: #ff9800; }
  .grade-E { color: #f44336; }

  .letter-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
    background: rgba(255,255,255,0.05);
    border: 1px solid currentColor;
  }

  .footer {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    font-size: 12px;
    color: var(--text-secondary);
    text-align: center;
  }

  /* ── Print styles ── */
  @media print {
    @page { size: landscape; margin: 15mm 10mm; }
    body {
      background: white;
      color: #1a1a1a;
      padding: 0;
      font-size: 9px;
    }
    .header { border-bottom-color: #ccc; }
    .header h1 { color: #1a1a1a; }
    .header .meta,
    .header .date { color: #666; }
    .summary-item {
      background: #f5f5f5;
      border-color: #ddd;
    }
    .summary-item .label { color: #666; }
    .summary-item .value { color: #1a1a1a; }
    table {
      background: white;
      border-color: #ccc;
      font-size: 8px;
    }
    th {
      background: #f5f5f5;
      color: #333;
      border-bottom-color: #999;
    }
    td { border-bottom-color: #eee; }
    tr:hover { background: none; }
    .email-col { color: #666; }
    .score-null { color: #999; }
    .grade-A, .grade-AB { color: #2e7d32; }
    .grade-B, .grade-BC { color: #558b2f; }
    .grade-C { color: #f57f17; }
    .grade-D { color: #e65100; }
    .grade-E { color: #c62828; }
    .letter-badge {
      background: #f5f5f5;
      border-color: #999;
    }
    .footer { color: #666; border-top-color: #ccc; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>${escapeHtml(courseName)}</h1>
    <div class="meta">
      ${offering.code ? `<span>${escapeHtml(offering.code)}</span> — ` : ''}
      ${enrollments?.length || 0} students
      ${assessments?.length ? `— ${assessments.length} assessments` : ''}
      ${assignments?.length ? `— ${assignments.length} assignments` : ''}
    </div>
  </div>
  <div class="date">
    Generated: ${now}
  </div>
</div>

<div class="summary">
  <div class="summary-item">
    <div class="label">Students</div>
    <div class="value">${enrollments?.length || 0}</div>
  </div>
  <div class="summary-item">
    <div class="label">Graded Items</div>
    <div class="value">${gradedItems.length}</div>
  </div>
  <div class="summary-item">
    <div class="label">Passing (≥55%)</div>
    <div class="value">${rows.filter(r => (r.percentage ?? 0) >= 55).length}</div>
  </div>
  <div class="summary-item">
    <div class="label">Average</div>
    <div class="value">${rows.length > 0 ? Math.round(rows.reduce((s, r) => s + (r.percentage ?? 0), 0) / rows.length) : 0}%</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th class="rank-col">#</th>
      <th class="name-col">Student</th>
      ${gradedItems.map(item => `<th class="score-cell" title="${escapeHtml(item.title)} (max: ${item.maxScore})">${escapeHtml(item.title)}<br><span style="font-weight:400;font-size:8px">/${item.maxScore}</span></th>`).join('')}
      <th class="total-col">Total</th>
      <th class="pct-col">%</th>
      <th class="grade-col">Grade</th>
    </tr>
  </thead>
  <tbody>
    ${rows.map(r => {
      const pct = r.percentage;
      const gradeClass = r.letterGrade ? `grade-${r.letterGrade}` : '';
      const pctDisplay = pct != null ? `${Math.round(pct)}%` : '-';
      return `<tr>
        <td class="rank-col">${r.rank}</td>
        <td class="name-col">
          ${escapeHtml(r.name)}
          <div class="email-col">${escapeHtml(r.email)}</div>
        </td>
        ${r.scores.map(s => {
          if (s.score != null) {
            return `<td class="score-cell score-value">${s.score}</td>`;
          }
          return `<td class="score-cell score-null">-</td>`;
        }).join('')}
        <td class="total-col">${r.totalScore.toFixed(1)}/${r.totalMax.toFixed(1)}</td>
        <td class="pct-col ${gradeClass}">${pctDisplay}</td>
        <td class="grade-col ${gradeClass}">
          ${r.letterGrade ? `<span class="letter-badge">${r.letterGrade}</span>` : '-'}
        </td>
      </tr>`;
    }).join('')}
  </tbody>
</table>

<div class="footer">
  Generated by RPL AI LMS — ${now}
</div>
</body>
</html>`;

	return new Response(html, {
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Content-Disposition': `inline; filename="gradebook-${offering.code || params.offeringId}-${now}.html"`,
		},
	});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return new Response(`<html><body><h1>Error</h1><p>${escapeHtml(msg)}</p></body></html>`, {
			status: 500,
			headers: { 'Content-Type': 'text/html; charset=utf-8' },
		});
	}
}
