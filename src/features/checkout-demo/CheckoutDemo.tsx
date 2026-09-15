import { useState } from 'react';
import {
  checkoutFields,
  orderLines,
  orderTotal,
  storeName,
} from './checkout.data';

/**
 * Checkout demo — a payment/review form that looks finished but carries intentional,
 * teachable accessibility defects. Pure content: imports no store/core/panel. The defects
 * live locally (raw elements, inline styles) so the shared design system stays correct.
 */
export function CheckoutDemo() {
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
    <form
      onSubmit={handleSubmit}
      data-demo-goal="submit-payment"
      className="mx-auto max-w-2xl"
    >
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
        <span className="text-base font-semibold text-slate-900">{storeName}</span>
        <span className="font-mono text-xs text-slate-500">Step 3 of 3 · Review</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-medium text-slate-700">Payment</legend>
          {checkoutFields.map((field) => (
            <div key={field.id}>
              {/*
                A11Y-DEFECT: input labeled by placeholder only, no associated <label> —
                revealed by ScreenReader — WCAG 1.3.1 / 4.1.2
              */}
              <input
                type="text"
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                maxLength={field.maxLength}
                value={values[field.id] ?? ''}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                }
                // A11Y-DEFECT: cramped 24px targets + no visible focus style —
                // revealed by Tremor / keyboard — WCAG 2.4.7 / 2.5.8
                style={{
                  height: '24px',
                  width: '100%',
                  padding: '2px 6px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  outline: 'none',
                  fontSize: '13px',
                }}
              />
              {errors[field.id] && (
                // A11Y-DEFECT: error signalled by red color only, no text/icon —
                // revealed by ColorBlindness — WCAG 1.4.1
                <div style={{ height: '3px', background: '#ef4444', marginTop: '2px' }} />
              )}
            </div>
          ))}
        </fieldset>

        <div className="flex flex-col justify-between rounded border border-slate-200 p-4">
          <dl className="space-y-2 text-sm">
            {orderLines.map((line) => (
              <div key={line.label} className="flex justify-between text-slate-600">
                <dt>{line.label}</dt>
                <dd className="font-medium text-slate-900">{line.value}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-semibold text-slate-900">
              <dt>{orderTotal.label}</dt>
              <dd>{orderTotal.value}</dd>
            </div>
          </dl>

          {/*
            A11Y-DEFECT: primary button contrast ~2.5:1 (light blue on white) —
            revealed by LowVision / ColorBlindness — WCAG 1.4.3
          */}
          <button
            type="submit"
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '8px 12px',
              background: '#93b4f5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Confirm and pay
          </button>
        </div>
      </div>
    </form>
  );
}
