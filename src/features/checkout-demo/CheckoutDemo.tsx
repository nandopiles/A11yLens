import { useState } from 'react';
import type { DemoComponentProps } from '@/features/demos/types';
import {
  checkoutFields,
  orderItems,
  orderLines,
  orderTotal,
  storeName,
} from './checkout.data';

/**
 * Checkout demo — a branded storefront payment screen. In its broken form it looks polished
 * but carries loud, teachable defects (placeholder-only labels, cramped targets, no focus
 * ring, color-only errors, low-contrast pay button). The `accessible` version is the SAME
 * screen with every defect fixed. Pure content: imports no store/core/panel.
 */
export function CheckoutDemo({ accessible }: DemoComponentProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, boolean> = {};
    checkoutFields.forEach((field) => {
      if (!values[field.id]?.trim()) next[field.id] = true;
    });
    setErrors(next);
  };

  return (
    <form onSubmit={handleSubmit} data-demo-goal="submit-payment" className="mx-auto max-w-3xl">
      {/* Brand bar */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            style={{ display: 'grid', placeItems: 'center', width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 800 }}
          >
            L
          </span>
          <div>
            <div className="text-base font-bold text-slate-900">{storeName}</div>
            <div className="font-mono text-[11px] text-slate-400">Pago seguro · Paso 3 de 3</div>
          </div>
        </div>
        <span
          style={{ fontSize: '11px', fontWeight: 700, color: '#4338ca', background: '#eef2ff', padding: '4px 10px', borderRadius: '9999px' }}
        >
          🔒 Cifrado
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.1fr_0.9fr]">
        {/* Payment fields */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <fieldset className="space-y-3 border-0 p-0">
            <legend className="mb-2 text-sm font-semibold text-slate-800">Datos de pago</legend>

            {checkoutFields.map((field) => {
              const hasError = !!errors[field.id];
              return (
                <div key={field.id}>
                  {accessible && (
                    <label
                      htmlFor={`co-${field.id}`}
                      style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}
                    >
                      {field.label}
                    </label>
                  )}

                  <input
                    id={accessible ? `co-${field.id}` : undefined}
                    type="text"
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    maxLength={field.maxLength}
                    // Accessible: an explicit name so the screen reader never says
                    // "campo, sin etiqueta" (the visible <label> is paired via htmlFor too).
                    aria-label={accessible ? field.label : undefined}
                    aria-invalid={accessible && hasError ? true : undefined}
                    aria-describedby={accessible && hasError ? `co-${field.id}-err` : undefined}
                    value={values[field.id] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    className={accessible ? 'a11y-input' : undefined}
                    style={
                      accessible
                        ? { height: '44px', width: '100%', padding: '0 12px', border: `1px solid ${hasError ? '#b91c1c' : '#64748b'}`, borderRadius: '10px', fontSize: '15px', boxSizing: 'border-box' }
                        : { height: '24px', width: '100%', padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: '4px', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }
                    }
                  />

                  {hasError &&
                    (accessible ? (
                      <p
                        id={`co-${field.id}-err`}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 0', fontSize: '13px', color: '#b91c1c' }}
                      >
                        <span aria-hidden="true">⚠</span> Este campo es obligatorio
                      </p>
                    ) : (
                      // A11Y-DEFECT: error signalled by a red bar only, no text/icon — WCAG 1.4.1
                      <div style={{ height: '3px', background: '#ef4444', marginTop: '2px', borderRadius: '2px' }} />
                    ))}
                </div>
              );
            })}
          </fieldset>
        </div>

        {/* Order summary with product thumbnails */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Tu pedido</h3>

          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '10px' }}>
            {orderItems.map((item) => (
              <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  aria-hidden="true"
                  style={{ display: 'grid', placeItems: 'center', width: '44px', height: '44px', borderRadius: '12px', background: item.swatch, fontSize: '22px', flex: 'none' }}
                >
                  {item.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="text-sm font-medium text-slate-900">{item.name}</div>
                  <div className="font-mono text-[11px] text-slate-400">{item.variant}</div>
                </div>
                <span className="text-sm font-semibold text-slate-900">{item.price}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1.5 border-t border-slate-200 pt-3 text-sm">
            {orderLines.map((line) => (
              <div key={line.label} className="flex justify-between text-slate-500">
                <dt>{line.label}</dt>
                <dd className="font-medium text-slate-700">{line.value}</dd>
              </div>
            ))}
            <div className="flex justify-between pt-1 text-base font-bold text-slate-900">
              <dt>{orderTotal.label}</dt>
              <dd>{orderTotal.value}</dd>
            </div>
          </dl>

          {accessible && (
            <style>{`.a11y-input:focus-visible{outline:3px solid #6366f1;outline-offset:2px}.a11y-pay:focus-visible{outline:3px solid #0f172a;outline-offset:2px}`}</style>
          )}

          <button
            type="submit"
            aria-label={accessible ? `Confirmar y pagar ${orderTotal.value}` : undefined}
            className={accessible ? 'a11y-pay' : undefined}
            style={
              accessible
                ? { marginTop: '16px', width: '100%', minHeight: '48px', padding: '12px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }
                : { marginTop: '16px', width: '100%', padding: '8px 12px', background: '#93b4f5', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }
            }
          >
            Confirmar y pagar · {orderTotal.value.replace(' EUR', '')}
          </button>
        </div>
      </div>
    </form>
  );
}
