# PRD-005: Non-Functional Requirements

**Document ID:** PRD-005  
**Version:** 1.0

---

| ID | Requirement | Target | Measure |
|---|---|---|---|
| NFR-001 | Page load time | <1s (p95) | Lighthouse / web-vitals |
| NFR-002 | API response time | <200ms (p95) | Server timing headers |
| NFR-003 | DB query time | <50ms | D1 timing |
| NFR-004 | Uptime | 99.9% | CF Pages SLA |
| NFR-005 | Concurrent users | 500 per tenant | Load test |
| NFR-006 | Concurrent try out | 200 students | WebSocket-less polling |
| NFR-007 | Rapor generation | <3s per student | SS: 30 students = <90s |
| NFR-008 | CSV import | 500 students <5s | Batch insert |
| NFR-009 | Mobile responsive | All screens ≥320px | Breakpoint tests |
| NFR-010 | Accessibility | WCAG 2.1 AA | Axe audit |
| NFR-011 | i18n ready | EN + ID translatable | i18n key system |
| NFR-012 | Dark mode | Consistent Linear design | Visual regression |
| NFR-013 | Offline capability | Rapor data cached | Future |
| NFR-014 | Security | No SQL injection | Parameterized queries (Drizzle) |
| NFR-015 | Security | No XSS | Svelte auto-escape |
| NFR-016 | Security | CSRF protection | SvelteKit built-in |
