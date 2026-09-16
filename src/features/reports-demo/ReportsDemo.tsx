import { useState } from 'react';
import type { DemoComponentProps } from '@/features/demos/types';
import {
  boardTitle,
  boardHint,
  tickets,
  reportFields,
  gallery,
  shotSrc,
  type TicketRow,
} from './reports.data';

/**
 * Reports demo — an internal "team reports" screen with a data grid, a screenshot gallery
 * and a bug-report form. Its broken form is a wall of axe-detectable defects, so the
 * violation count starts high and drops to zero when made accessible.
 *
 * Broken:
 *  - The "table" is a stack of <div>s: no <table>/<th>, so rows/columns have no
 *    programmatic relationship (WCAG 1.3.1).
 *  - Priority/status conveyed only by color chips (WCAG 1.4.1) + low-contrast chip text.
 *  - Form inputs have placeholder-only names (WCAG 1.3.1 / 4.1.2).
 *  - Screenshots are real <img> with no alt (WCAG 1.1.1).
 *  - The submit control is a <div onClick> — no role, no name, not focusable (WCAG 4.1.2).
 *  - An empty "ver más" link with no text (WCAG 2.4.4 / 4.1.2).
 *  - Body/label/meta text at 1.5–2.5:1 contrast (WCAG 1.4.3).
 *
 * Accessible: a real <table> with <th scope>, priority/status as text + color, <label>ed
 * inputs, descriptive alt on every screenshot, a real <button>, a named link, and solid
 * high-contrast colors throughout. Pure content: no store/core/panel imports.
 */
export function ReportsDemo({ accessible }: DemoComponentProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = () => {
    setSent(true);
    window.setTimeout(() => setSent(false), 1800);
  };

  const ink = accessible ? '#475569' : '#c7cfda';

  return (
    <div className="mx-auto max-w-3xl" data-demo-goal="send-report">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" style={{ fontSize: '18px' }}>🐞</span>
          <span className="text-lg font-bold text-slate-900">{boardTitle}</span>
        </div>
        {/* Broken: hint at ~1.7:1. Accessible: #475569 ~7:1. */}
        <p className="mt-0.5 text-sm" style={{ color: ink }}>{boardHint}</p>
      </div>

      {/* --- Ticket grid --- */}
      {accessible ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', fontSize: '13px' }}>
          <caption style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
            Tickets recientes
          </caption>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              {['ID', 'Título', 'Responsable', 'Prioridad', 'Estado', 'Actualizado'].map((h) => (
                <th key={h} scope="col" style={{ textAlign: 'left', padding: '8px 12px', color: '#334155', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th scope="row" style={{ textAlign: 'left', padding: '8px 12px', fontFamily: 'monospace', color: '#334155', fontWeight: 600 }}>{t.id}</th>
                <td style={{ padding: '8px 12px', color: '#0f172a' }}>{t.title}</td>
                <td style={{ padding: '8px 12px', color: '#334155' }}>{t.owner}</td>
                <td style={{ padding: '8px 12px' }}><PriorityChip priority={t.priority} accessible /></td>
                <td style={{ padding: '8px 12px' }}><StatusChip status={t.status} accessible /></td>
                <td style={{ padding: '8px 12px', color: '#475569' }}>{t.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // A11Y-DEFECT: a "table" built from <div>s — no headers, no row/col relationship. WCAG 1.3.1
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', fontSize: '13px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 90px 90px 90px 90px', background: '#f8fafc', padding: '8px 12px', color: '#c7cfda', fontWeight: 700 }}>
            <span>ID</span><span>Título</span><span>Resp.</span><span>Prio.</span><span>Estado</span><span>Actual.</span>
          </div>
          {tickets.map((t) => (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 90px 90px 90px 90px', alignItems: 'center', padding: '8px 12px', borderTop: '1px solid #f1f5f9', color: '#334155' }}>
              <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{t.id}</span>
              <span style={{ color: '#0f172a' }}>{t.title}</span>
              <span style={{ color: '#c7cfda' }}>{t.owner}</span>
              <PriorityChip priority={t.priority} accessible={false} />
              <StatusChip status={t.status} accessible={false} />
              <span style={{ color: '#c7cfda' }}>{t.updated}</span>
            </div>
          ))}
        </div>
      )}

      {/* "See all" link */}
      <div className="mt-2">
        {accessible ? (
          <a href="#all" style={{ fontSize: '13px', fontWeight: 600, color: '#3730a3' }}>
            Ver todos los tickets
          </a>
        ) : (
          // A11Y-DEFECT: empty link (only an aria-hidden icon, no accessible name — 2.4.4 /
          // 4.1.2) AND its id "all" collides with the first form field → duplicate id (4.1.1)
          <a id="all" href="#all" style={{ fontSize: '13px', color: '#c7cfda' }}>
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>

      {/* --- Screenshot gallery --- */}
      <div className="mt-5">
        {accessible ? (
          <h2 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Capturas adjuntas</h2>
        ) : (
          // A11Y-DEFECT: styled <div> used as a heading (no semantics). WCAG 1.3.1
          <div style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Capturas adjuntas</div>
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          {gallery.map((shot) => (
            <img
              key={shot.id}
              src={shotSrc(shot)}
              // A11Y-DEFECT (broken): no alt → screen reader says "imagen, sin descripción". WCAG 1.1.1
              alt={accessible ? shot.alt : ''}
              width={130}
              height={90}
              style={{ display: 'block', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            />
          ))}
        </div>
      </div>

      {/* --- Bug report form --- */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        {accessible ? (
          <h2 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Nuevo reporte</h2>
        ) : (
          <div style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Nuevo reporte</div>
        )}

        <div style={{ display: 'grid', gap: '12px' }}>
          {reportFields.map((field, i) => (
            <div key={field.id}>
              {accessible && (
                <label htmlFor={`rp-${field.id}`} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                  {field.label}
                </label>
              )}
              <input
                // A11Y-DEFECT (broken): placeholder-only, no <label>/aria-label. WCAG 1.3.1 / 4.1.2
                // Broken also uses a positive tabindex on the first field → scrambled focus
                // order (2.4.3), and a duplicate id shared with the "See all" link.
                id={accessible ? `rp-${field.id}` : i === 0 ? 'all' : undefined}
                tabIndex={!accessible && i === 0 ? 3 : undefined}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                aria-label={accessible ? field.label : undefined}
                value={values[field.id] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                style={
                  accessible
                    ? { height: '42px', width: '100%', padding: '0 12px', border: '1px solid #64748b', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }
                    : { height: '26px', width: '100%', padding: '2px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }
                }
              />
            </div>
          ))}

          {/* Priority selector. Broken: <select> with no associated label/name. WCAG 4.1.2 */}
          <div>
            {accessible && (
              <label htmlFor="rp-priority" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                Prioridad
              </label>
            )}
            <select
              id={accessible ? 'rp-priority' : undefined}
              aria-label={accessible ? 'Prioridad del reporte' : undefined}
              defaultValue="Media"
              style={
                accessible
                  ? { height: '42px', width: '100%', padding: '0 10px', border: '1px solid #64748b', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', background: '#fff' }
                  : { height: '26px', width: '100%', padding: '2px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }
              }
            >
              <option>Crítica</option>
              <option>Alta</option>
              <option>Media</option>
            </select>
          </div>
        </div>

        {accessible && (
          <style>{`.rp-send:focus-visible{outline:3px solid #0f172a;outline-offset:2px}`}</style>
        )}

        {accessible ? (
          <button
            type="button"
            className="rp-send"
            onClick={submit}
            aria-label="Enviar reporte"
            // Solid #3730a3 on white ≈ 8.6:1 so axe verifies the contrast.
            style={{ marginTop: '14px', minHeight: '44px', width: '100%', background: '#3730a3', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
          >
            Enviar reporte
          </button>
        ) : (
          // A11Y-DEFECT: <div onClick> submit — no role, no name, not keyboard focusable. WCAG 4.1.2 / 2.1.1
          // Also near-invisible: white on #c3b9f0 ≈ 1.9:1. WCAG 1.4.3
          <div
            onClick={submit}
            style={{ marginTop: '14px', textAlign: 'center', padding: '8px', background: '#c3b9f0', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Enviar reporte
          </div>
        )}

        {sent && (
          <p role={accessible ? 'status' : undefined} style={{ marginTop: '10px', fontSize: '13px', color: accessible ? '#047857' : '#bbf7d0' }}>
            ✓ Reporte enviado
          </p>
        )}
      </div>
    </div>
  );
}

/** Priority chip. Broken: color-only + low-contrast text. Accessible: text + solid color. */
function PriorityChip({ priority, accessible }: { priority: TicketRow['priority']; accessible: boolean }) {
  const map = {
    Crítica: { bg: '#fee2e2', solid: '#b91c1c' },
    Alta: { bg: '#ffedd5', solid: '#c2410c' },
    Media: { bg: '#e0e7ff', solid: '#3730a3' },
  } as const;
  const c = map[priority];
  if (!accessible) {
    // A11Y-DEFECT: priority as a color dot only, no text — WCAG 1.4.1
    return <span aria-hidden="true" style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '9999px', background: c.solid }} />;
  }
  return (
    <span style={{ fontSize: '12px', fontWeight: 700, color: c.solid, background: c.bg, padding: '2px 8px', borderRadius: '9999px' }}>
      {priority}
    </span>
  );
}

/** Status chip. Broken: pale low-contrast text. Accessible: solid high-contrast text. */
function StatusChip({ status, accessible }: { status: TicketRow['status']; accessible: boolean }) {
  const solid = status === 'Resuelto' ? '#047857' : status === 'En curso' ? '#c2410c' : '#b91c1c';
  if (!accessible) {
    // A11Y-DEFECT: status text at ~2:1 contrast — WCAG 1.4.3
    return <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{status}</span>;
  }
  return <span style={{ fontSize: '12px', fontWeight: 700, color: solid }}>{status}</span>;
}
