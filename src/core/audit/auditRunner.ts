import axe, { type AxeResults, type ImpactValue, type Result } from 'axe-core';

/**
 * Real, standards-based accessibility audit over a live DOM subtree, powered by axe-core.
 *
 * The simulation profiles show users *what a barrier feels like*; this runner shows
 * *what is actually wrong* against WCAG. It is framework-agnostic (no React, no store)
 * and returns a small, stable shape the UI can render without knowing axe internals.
 *
 * IMPORTANT: run the audit on the *un-simulated* DOM. Simulation profiles inject inline
 * styles/nodes (color-blindness filters, masks, custom cursors) that would pollute the
 * result. Callers revert active profiles before auditing.
 */

/** Severity buckets, ordered most→least severe. Mirrors axe's `ImpactValue`. */
export type AuditImpact = 'critical' | 'serious' | 'moderate' | 'minor';

export const IMPACT_ORDER: readonly AuditImpact[] = [
  'critical',
  'serious',
  'moderate',
  'minor',
];

/** A single element flagged by a violated rule. */
export interface AuditNode {
  /** Outer HTML snippet of the offending element (truncated for display). */
  html: string;
  /** CSS selector(s) axe used to locate the node, joined for display. */
  target: string;
  /** Human-readable reason this node failed. */
  summary: string;
}

/** One violated axe rule, with the nodes that violate it. */
export interface AuditViolation {
  /** axe rule id, e.g. `color-contrast`, `label`, `image-alt`. */
  id: string;
  /** Short imperative help text from axe. */
  help: string;
  /** Deep link to axe's rule documentation. */
  helpUrl: string;
  /** Severity; defaults to `minor` when axe reports none. */
  impact: AuditImpact;
  /** WCAG success-criterion tags derived from the rule's tags (e.g. `1.4.3`). */
  wcag: string[];
  /** Offending elements. */
  nodes: AuditNode[];
}

/** A full audit pass over a root. */
export interface AuditReport {
  /** Total number of violated rules. */
  violationCount: number;
  /** Sum of offending nodes across all violations. */
  nodeCount: number;
  /** Count of violations per impact bucket. */
  byImpact: Record<AuditImpact, number>;
  /** Violations, sorted most→least severe. */
  violations: AuditViolation[];
  /** Number of rules that passed — useful for a before/after "score". */
  passCount: number;
  /** When the audit completed. */
  timestamp: number;
}

const HTML_SNIPPET_MAX = 120;

function normalizeImpact(impact: ImpactValue | undefined): AuditImpact {
  if (impact === 'critical' || impact === 'serious' || impact === 'moderate') {
    return impact;
  }
  return 'minor';
}

/** Extract WCAG success-criterion numbers from axe rule tags (e.g. `wcag143` → `1.4.3`). */
function wcagFromTags(tags: readonly string[]): string[] {
  const criteria: string[] = [];
  for (const tag of tags) {
    const match = /^wcag(\d)(\d)(\d+)$/.exec(tag);
    if (match) {
      criteria.push(`${match[1]}.${match[2]}.${match[3]}`);
    }
  }
  return criteria;
}

function truncate(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  return collapsed.length > max ? `${collapsed.slice(0, max - 1)}…` : collapsed;
}

function toViolation(result: Result): AuditViolation {
  return {
    id: result.id,
    help: result.help,
    helpUrl: result.helpUrl,
    impact: normalizeImpact(result.impact),
    wcag: wcagFromTags(result.tags),
    nodes: result.nodes.map((node) => ({
      html: truncate(node.html, HTML_SNIPPET_MAX),
      target: node.target.map(String).join(', '),
      summary: node.failureSummary
        ? truncate(node.failureSummary, 240)
        : result.help,
    })),
  };
}

function emptyByImpact(): Record<AuditImpact, number> {
  return { critical: 0, serious: 0, moderate: 0, minor: 0 };
}

function toReport(results: AxeResults): AuditReport {
  const violations = results.violations
    .map(toViolation)
    .sort((a, b) => IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact));

  const byImpact = emptyByImpact();
  let nodeCount = 0;
  for (const v of violations) {
    byImpact[v.impact] += 1;
    nodeCount += v.nodes.length;
  }

  return {
    violationCount: violations.length,
    nodeCount,
    byImpact,
    violations,
    passCount: results.passes.length,
    timestamp: Date.now(),
  };
}

/**
 * Run axe-core against `root` and return a normalized report. Restricts to the
 * WCAG 2.0/2.1 A & AA rule set — the standard bar teams are held to — so the demo
 * defects (labels, contrast, alt text, semantics) surface cleanly.
 *
 * Throws only if axe itself fails; callers should treat that as "audit unavailable".
 */
export async function runAudit(root: HTMLElement): Promise<AuditReport> {
  const results = await axe.run(root, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    },
    resultTypes: ['violations', 'passes'],
  });
  return toReport(results);
}
