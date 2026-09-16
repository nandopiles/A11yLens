import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Icon } from '@/components/primitives/Icon';
import { Badge } from '@/components/primitives/Badge';
import {
  IMPACT_ORDER,
  type AuditImpact,
  type AuditReport,
} from '@/core/audit/auditRunner';

/** Spanish labels + tone per severity bucket. */
const IMPACT_META: Record<AuditImpact, { label: string; tone: 'danger' | 'warning' | 'info' | 'neutral' }> = {
  critical: { label: 'Crítico', tone: 'danger' },
  serious: { label: 'Grave', tone: 'danger' },
  moderate: { label: 'Moderado', tone: 'warning' },
  minor: { label: 'Leve', tone: 'info' },
};

interface AuditOverlayProps {
  /** The current audit report, or null before the first run. */
  report: AuditReport | null;
  /** True while an audit is in flight. */
  running: boolean;
  /**
   * Violation count from the previous run (e.g. the broken page), used to show the
   * before→after delta when the count drops. Null hides the delta.
   */
  previousCount: number | null;
}

/**
 * Real accessibility audit panel powered by axe-core. Surfaces the true violation
 * count, a severity breakdown, and the individual violated rules with their WCAG
 * criteria — the "what is actually wrong" companion to the simulation's "what it
 * feels like". When the count drops (e.g. after making the page accessible), it
 * animates the before→after delta and celebrates reaching zero.
 */
export function AuditOverlay({ report, running, previousCount }: AuditOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  const count = report?.violationCount ?? null;
  const isZero = count === 0;
  const dropped =
    previousCount !== null && count !== null && count < previousCount ? previousCount - count : 0;

  return (
    <section
      aria-label="Auditoría de accesibilidad"
      className="mb-4 rounded-xl border border-hairline bg-canvas p-4 shadow-overlay"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={[
              'flex h-9 w-9 items-center justify-center rounded-lg text-white',
              isZero ? 'bg-emerald-600' : 'bg-ink',
            ].join(' ')}
          >
            <Icon name={isZero ? 'check' : 'bug'} />
          </span>
          <div>
            <h2 className="text-headline-sm text-ink">Auditoría real</h2>
            <p className="font-mono text-label-badge uppercase tracking-wider text-ink-muted">
              axe-core · WCAG 2.1 AA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* The headline counter. */}
          <div aria-live="polite" className="flex items-baseline gap-2">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={count ?? 'none'}
                initial={reduceMotion ? false : { y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduceMotion ? undefined : { y: 8, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.25 }}
                className={[
                  'font-mono text-headline-lg tabular-nums',
                  isZero ? 'text-emerald-600' : count && count > 0 ? 'text-rose-600' : 'text-ink-muted',
                ].join(' ')}
              >
                {count ?? '—'}
              </motion.span>
            </AnimatePresence>
            <span className="text-body-sm text-ink-soft">
              {count === 1 ? 'violación' : 'violaciones'}
            </span>
          </div>

          {running && (
            <span className="inline-flex items-center gap-2 text-body-sm font-medium text-ink-soft">
              <span className="animate-spin">
                <Icon name="bolt" />
              </span>
              Analizando…
            </span>
          )}
        </div>
      </div>

      {/* before→after delta and zero celebration */}
      {dropped > 0 && (
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className={[
            'mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-body-sm font-medium',
            isZero
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-primary/40 bg-primary/5 text-ink',
          ].join(' ')}
        >
          <span aria-hidden="true" className="text-emerald-600">
            <Icon name="check" />
          </span>
          {isZero
            ? `Cero violaciones. Se corrigieron las ${previousCount} detectadas.`
            : `${dropped} ${dropped === 1 ? 'violación resuelta' : 'violaciones resueltas'} (${previousCount} → ${count}).`}
        </motion.p>
      )}

      {/* severity breakdown */}
      {report && report.violationCount > 0 && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {IMPACT_ORDER.filter((impact) => report.byImpact[impact] > 0).map((impact) => (
              <Badge key={impact} tone={IMPACT_META[impact].tone}>
                {report.byImpact[impact]} {IMPACT_META[impact].label.toLowerCase()}
              </Badge>
            ))}
            <span className="font-mono text-label-badge text-ink-muted">
              {report.nodeCount} {report.nodeCount === 1 ? 'elemento' : 'elementos'} afectados
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="mt-3 inline-flex items-center gap-1.5 text-body-sm font-medium text-primary hover:underline"
          >
            {expanded ? 'Ocultar detalle' : 'Ver detalle de violaciones'}
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.ul
                initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {report.violations.map((v) => (
                  <li
                    key={v.id}
                    className="rounded-lg border border-hairline bg-panel p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge tone={IMPACT_META[v.impact].tone}>{IMPACT_META[v.impact].label}</Badge>
                        <span className="font-mono text-body-sm text-ink">{v.id}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {v.wcag.map((wc) => (
                          <Badge key={wc} tone="neutral">
                            WCAG {wc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="mt-1.5 text-body-sm text-ink-soft">{v.help}</p>
                    <div className="mt-2 space-y-1">
                      {v.nodes.map((node, i) => (
                        <code
                          key={`${v.id}-${i}`}
                          className="block truncate rounded bg-canvas px-2 py-1 font-mono text-label-badge text-ink-muted"
                          title={node.target}
                        >
                          {node.html}
                        </code>
                      ))}
                    </div>
                    <a
                      href={v.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-body-sm font-medium text-primary hover:underline"
                    >
                      Documentación de la regla
                      <Icon name="arrow-right" />
                    </a>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </>
      )}

      {report === null && !running && (
        <p className="mt-3 text-body-sm text-ink-soft">
          Ejecuta un análisis para ver las violaciones reales de accesibilidad de esta página.
        </p>
      )}
    </section>
  );
}
