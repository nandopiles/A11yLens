import { describe, it, expect, afterEach } from 'vitest';
import { runAudit, IMPACT_ORDER } from './auditRunner';

function makeRoot(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('runAudit', () => {
  it('reports zero violations for accessible markup', async () => {
    const root = makeRoot(`
      <main>
        <h1>Título</h1>
        <img src="cat.png" alt="Un gato dormido" />
        <label for="name">Nombre</label>
        <input id="name" type="text" />
      </main>
    `);

    const report = await runAudit(root);

    expect(report.violationCount).toBe(0);
    expect(report.violations).toEqual([]);
    expect(report.byImpact).toEqual({ critical: 0, serious: 0, moderate: 0, minor: 0 });
    expect(report.passCount).toBeGreaterThan(0);
  });

  it('surfaces real violations for inaccessible markup with WCAG criteria parsed', async () => {
    const root = makeRoot(`
      <img src="cat.png" />
      <input type="text" placeholder="Nombre" />
    `);

    const report = await runAudit(root);

    expect(report.violationCount).toBeGreaterThan(0);
    expect(report.nodeCount).toBeGreaterThanOrEqual(report.violationCount);

    // The missing-alt rule must be present, with a WCAG 1.1.1 tag parsed from `wcag111`.
    const imageAlt = report.violations.find((v) => v.id === 'image-alt');
    expect(imageAlt).toBeDefined();
    expect(imageAlt?.wcag).toContain('1.1.1');
    expect(imageAlt?.helpUrl).toMatch(/^https?:\/\//);
    expect(imageAlt?.nodes.length).toBeGreaterThan(0);
  });

  it('sorts violations by descending severity', async () => {
    const root = makeRoot(`
      <img src="cat.png" />
      <input type="text" placeholder="Nombre" />
      <a href="#"></a>
    `);

    const report = await runAudit(root);
    const ranks = report.violations.map((v) => IMPACT_ORDER.indexOf(v.impact));
    const sorted = [...ranks].sort((a, b) => a - b);
    expect(ranks).toEqual(sorted);
  });
});
