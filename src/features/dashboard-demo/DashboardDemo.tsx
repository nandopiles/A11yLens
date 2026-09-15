import { series, legendColors, periods } from './dashboard.data';

/**
 * Dashboard demo — a grouped bar chart where the only way to tell series apart is color,
 * with a color-only legend and no text alternative for the chart. Pure content: no
 * store/core/panel imports.
 */
export function DashboardDemo() {
  return (
    <div className="mx-auto max-w-2xl" data-demo-goal="read-chart">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-semibold text-slate-900">Revenue by segment</span>
        {/*
          A11Y-DEFECT: legend distinguishes series by color swatch only, no text labels —
          revealed by ColorBlindness — WCAG 1.4.1
        */}
        <div className="flex items-center gap-2">
          {legendColors.map((color, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: '14px',
                height: '14px',
                borderRadius: '3px',
                background: color,
              }}
            />
          ))}
        </div>
      </div>

      {/*
        A11Y-DEFECT: chart is a purely visual region with no text alternative / table —
        revealed by ScreenReader — WCAG 1.1.1
      */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '24px',
          height: '200px',
          padding: '12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
        }}
      >
        {periods.map((period, periodIndex) => (
          <div key={period} style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '160px' }}>
              {series.map((s) => (
                <div
                  key={s.id}
                  style={{
                    flex: 1,
                    height: `${s.values[periodIndex]}%`,
                    background: s.color,
                    borderRadius: '2px 2px 0 0',
                  }}
                />
              ))}
            </div>
            <span style={{ textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
              {period}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
