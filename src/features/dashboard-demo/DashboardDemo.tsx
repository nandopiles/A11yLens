import type { DemoComponentProps } from '@/features/demos/types';
import { services, boardTitle, boardHint } from './dashboard.data';

const MAX_LATENCY = 80; // for scaling the latency bars

/**
 * Dashboard demo — a vivid operations "service status" board with a latency bar chart and a
 * status indicator per row. The task: one service is DOWN — spot it.
 *
 * Broken: health is encoded ONLY by the color of the status dot (green up / red down) — so
 * under protanopia/deuteranopia the task is impossible. Accessible: the same board pairs
 * color with a distinct shape + a text status chip, so the failing service is unmistakable.
 * Pure content: no store/core/panel imports.
 */
export function DashboardDemo({ accessible }: DemoComponentProps) {
  const upCount = services.filter((s) => s.status === 'up').length;

  return (
    <div className="mx-auto max-w-2xl" data-demo-goal="find-down-service">
      {/* Header with summary + legend */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" style={{ fontSize: '18px' }}>📡</span>
            <span className="text-lg font-bold text-slate-900">{boardTitle}</span>
          </div>
          {/* Broken: #c2cad6 hint ~1.9:1. Accessible: #475569 ~7:1. WCAG 1.4.3 */}
          <p className="mt-0.5 text-sm" style={{ color: accessible ? '#475569' : '#c2cad6' }}>{boardHint}</p>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: accessible ? '#334155' : '#c2cad6' }}>
          <span className="inline-flex items-center gap-1.5">
            <StatusMark status="up" accessible={accessible} />
            Operativo
          </span>
          <span className="inline-flex items-center gap-1.5">
            <StatusMark status="down" accessible={accessible} />
            Caído
          </span>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <SummaryTile label="Servicios" value={`${services.length}`} tint="#eef2ff" ink="#3730a3" accessible={accessible} />
        <SummaryTile label="Operativos" value={`${upCount}`} tint="#ecfdf5" ink="#047857" accessible={accessible} />
        <SummaryTile label="Incidencias" value={`${services.length - upCount}`} tint="#fef2f2" ink="#b91c1c" accessible={accessible} />
      </div>

      <ul
        style={{ listStyle: 'none', margin: 0, padding: 0, border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', background: '#fff' }}
      >
        {services.map((service, index) => {
          const isDown = service.status === 'down';
          const pct = Math.min(100, Math.round((service.latencyMs / MAX_LATENCY) * 100));
          return (
            <li
              key={service.id}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderTop: index === 0 ? 'none' : '1px solid #f1f5f9' }}
            >
              <StatusMark status={service.status} accessible={accessible} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{service.name}</span>
                  {/* Broken: #cbd5e1 region ~1.5:1. Accessible: #475569 ~7:1. */}
                  <span className="font-mono text-[11px]" style={{ color: accessible ? '#475569' : '#cbd5e1' }}>{service.region}</span>
                </div>
                {/* Latency bar chart (visual richness; not the status signal). */}
                <div style={{ marginTop: '6px', height: '6px', width: '100%', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    aria-hidden="true"
                    style={{ height: '100%', width: `${isDown ? 100 : pct}%`, background: isDown ? '#dc2626' : '#6366f1', borderRadius: '9999px' }}
                  />
                </div>
              </div>

              {/* Fixed: status as a TEXT chip. Broken: no per-row status text. */}
              {accessible && (
                <span
                  style={{ flex: 'none', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', color: isDown ? '#b91c1c' : '#047857', background: isDown ? '#fef2f2' : '#ecfdf5' }}
                >
                  {isDown ? 'Caído' : 'Operativo'}
                </span>
              )}

              <span className="font-mono text-xs" style={{ width: '52px', textAlign: 'right', flex: 'none', color: accessible ? '#334155' : '#c2cad6' }}>
                {service.latencyMs > 0 ? `${service.latencyMs} ms` : '—'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SummaryTile({ label, value, tint, ink, accessible }: { label: string; value: string; tint: string; ink: string; accessible: boolean }) {
  return (
    <div style={{ borderRadius: '12px', background: tint, padding: '12px 14px' }}>
      <div style={{ fontSize: '22px', fontWeight: 800, color: ink }}>{value}</div>
      {/* Broken: #b9c1cd label ~2.2:1 over the pale tile. Accessible: #334155. WCAG 1.4.3 */}
      <div style={{ fontSize: '12px', color: accessible ? '#334155' : '#b9c1cd' }}>{label}</div>
    </div>
  );
}

/**
 * Status indicator. Broken = a bare colored dot (color is the only signal). Accessible = the
 * dot gains a distinct SHAPE (● up / ■ down) + an accessible name, so color is redundant.
 */
function StatusMark({ status, accessible }: { status: 'up' | 'down'; accessible: boolean }) {
  const isDown = status === 'down';
  const color = isDown ? '#dc2626' : '#16a34a';

  if (!accessible) {
    // A11Y-DEFECT: status conveyed ONLY by color of this dot — WCAG 1.4.1
    return (
      <span
        aria-hidden="true"
        style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '9999px', flex: 'none', background: color }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={isDown ? 'Caído' : 'Operativo'}
      style={{ display: 'inline-block', width: '14px', height: '14px', flex: 'none', background: color, borderRadius: isDown ? '3px' : '9999px' }}
    />
  );
}
