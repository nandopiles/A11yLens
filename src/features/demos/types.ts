import type { ComponentType } from 'react';

export type DemoId = 'checkout' | 'feed' | 'navigation' | 'dashboard';

export interface DemoDefect {
  what: string;
  revealedBy: string;
  wcag: string;
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
}

export interface DemoDefinition {
  meta: DemoMeta;
  Component: ComponentType;
}
