import { describe, it, expect } from 'vitest';
import * as ui from '../src/lib/components/ui';

describe('UI Component Library System', () => {
	it('exports core interactive components', () => {
		expect(ui.Button).toBeDefined();
		expect(ui.Card).toBeDefined();
		expect(ui.Badge).toBeDefined();
		expect(ui.Input).toBeDefined();
		expect(ui.Select).toBeDefined();
		expect(ui.Textarea).toBeDefined();
		expect(ui.Table).toBeDefined();
		expect(ui.DataTable).toBeDefined();
	});

	it('exports new standardized components (Tabs, Pagination, ConfirmDialog, FilterBar, Switch)', () => {
		expect(ui.Tabs).toBeDefined();
		expect(ui.Pagination).toBeDefined();
		expect(ui.ConfirmDialog).toBeDefined();
		expect(ui.FilterBar).toBeDefined();
		expect(ui.Switch).toBeDefined();
		expect(ui.Toggle).toBeDefined();
		expect(ui.Switch).toBe(ui.Toggle);
	});
});
