import type { ComponentType } from 'react';

export type DemoId = 'checkout' | 'feed' | 'reports' | 'dashboard';

export interface DemoDefect {
  what: string;
  revealedBy: string;
  wcag: string;
}

/** A single "what to fix" bullet shown when the user asks to make the page accessible. */
export interface RemediationItem {
  /** Short, plain-language fix, e.g. "Asocia un <label> a cada campo". */
  fix: string;
  /** The WCAG success criterion the fix satisfies. */
  wcag: string;
}

/** Props every demo component receives. */
export interface DemoComponentProps {
  /** When true, render the corrected, fully accessible version of the same page. */
  accessible: boolean;
}

export interface DemoMeta {
  id: DemoId;
  title: string;
  /** One-line pitch shown in the switcher. */
  summary: string;
  /** The action the metrics block times, e.g. "Submit payment". */
  goalLabel: string;
  /** Known defects for teaching + audit cross-check. */
  defects: DemoDefect[];
  /** What the "Hazlo accesible" action fixes, in plain language. */
  remediation: RemediationItem[];
}

export interface DemoDefinition {
  meta: DemoMeta;
  Component: ComponentType<DemoComponentProps>;
}
