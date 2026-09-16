import { useEffect, useRef, useState } from 'react';
import type { DemoComponentProps } from '@/features/demos/types';
import { primaryNav, dropdownItems, modalCopy } from './navigation.data';

/**
 * Navigation demo — a branded product top bar with a dropdown and a login modal.
 *
 * Broken: links use positive tabindex (scrambled focus order), the dropdown is a
 * <div onClick> with no role/name, and the modal has no role="dialog"/aria-modal and never
 * traps focus. Accessible: natural tab order, a real <button> disclosure with aria-expanded,
 * and a modal with role="dialog", aria-modal, initial focus, focus containment and Escape.
 * Pure content: no store/core/panel imports.
 */
export function NavigationDemo({ accessible }: DemoComponentProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!accessible || !modalOpen) return;
    firstFieldRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus();
    };
  }, [accessible, modalOpen]);

  return (
    <div className="mx-auto max-w-3xl" data-demo-goal="open-menu-item">
      <nav
        className="flex items-center justify-between rounded-2xl px-4 py-3"
        style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}
      >
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 font-bold text-white">
            <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>◆</span>
            Northwind
          </span>
          <ul className="hidden items-center gap-5 sm:flex">
            {primaryNav.map((item) => (
              <li key={item.id}>
                {/* Broken: positive tabindex scrambles order. Accessible: natural order. */}
                <a
                  href={`#${item.id}`}
                  tabIndex={accessible ? undefined : item.tabIndex}
                  className="text-sm font-medium text-slate-300 hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li style={{ position: 'relative' }}>
              {accessible ? (
                <button
                  type="button"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="rounded px-1 text-sm font-medium text-slate-300 hover:text-white"
                >
                  Más ▾
                </button>
              ) : (
                // A11Y-DEFECT: <div onClick> with no role/name — WCAG 4.1.2
                <div onClick={() => setDropdownOpen((o) => !o)} style={{ cursor: 'pointer', fontSize: '14px', color: '#cbd5e1' }}>
                  Más ▾
                </div>
              )}

              {dropdownOpen && (
                <div
                  role={accessible ? 'menu' : undefined}
                  style={{ position: 'absolute', top: '160%', left: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', minWidth: '160px', padding: '4px', boxShadow: '0 12px 32px rgba(15,23,42,0.18)', zIndex: 5 }}
                >
                  {dropdownItems.map((item) =>
                    accessible ? (
                      <button
                        key={item}
                        type="button"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: '13px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        {item}
                      </button>
                    ) : (
                      // A11Y-DEFECT: menu items are non-semantic <div onClick> — WCAG 4.1.2
                      <div key={item} onClick={() => setDropdownOpen(false)} style={{ padding: '8px 10px', cursor: 'pointer', fontSize: '13px' }}>
                        {item}
                      </div>
                    ),
                  )}
                </div>
              )}
            </li>
          </ul>
        </div>

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setModalOpen(true)}
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
        >
          Iniciar sesión
        </button>
      </nav>

      {/* Hero-ish body so the screen doesn't look empty */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Tu panel, en un solo sitio</h2>
        <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>
          Abre el menú «Más» o inicia sesión para continuar.
        </p>
      </div>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}
        >
          <div
            ref={dialogRef}
            role={accessible ? 'dialog' : undefined}
            aria-modal={accessible ? true : undefined}
            aria-labelledby={accessible ? 'login-title' : undefined}
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '340px', boxShadow: '0 24px 60px rgba(15,23,42,0.35)' }}
          >
            <h3 id={accessible ? 'login-title' : undefined} style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800 }}>
              {modalCopy.title}
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#475569' }}>{modalCopy.body}</p>

            {accessible && (
              <label htmlFor="login-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                Correo electrónico
              </label>
            )}
            <input
              id={accessible ? 'login-email' : undefined}
              ref={firstFieldRef}
              type="email"
              placeholder="Correo electrónico"
              aria-label={accessible ? 'Correo electrónico' : undefined}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              style={{ width: '100%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
            >
              {modalCopy.submit}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
