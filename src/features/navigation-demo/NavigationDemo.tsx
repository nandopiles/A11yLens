import { useState } from 'react';
import { primaryNav, dropdownItems, modalCopy } from './navigation.data';

/**
 * Navigation demo — a nav with a non-semantic dropdown and a modal whose focus handling is
 * intentionally broken, plus a scrambled tab order. Pure content: no store/core/panel.
 */
export function NavigationDemo() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl" data-demo-goal="open-menu-item">
      <nav className="flex items-center justify-between rounded border border-slate-200 px-4 py-2">
        <ul className="flex items-center gap-4">
          {primaryNav.map((item) => (
            <li key={item.id}>
              {/*
                A11Y-DEFECT: positive tabindex scrambles keyboard focus order —
                revealed by keyboard nav — WCAG 2.4.3
              */}
              <a
                href={`#${item.id}`}
                tabIndex={item.tabIndex}
                className="text-sm text-slate-700 hover:text-slate-900"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li style={{ position: 'relative' }}>
            {/*
              A11Y-DEFECT: dropdown trigger + items are <div onClick> with no role/name —
              revealed by ScreenReader — WCAG 4.1.2
            */}
            <div
              onClick={() => setDropdownOpen((o) => !o)}
              style={{ cursor: 'pointer', fontSize: '14px', color: '#334155' }}
            >
              Más ▾
            </div>
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  minWidth: '140px',
                  zIndex: 5,
                }}
              >
                {dropdownItems.map((item) => (
                  <div
                    key={item}
                    onClick={() => setDropdownOpen(false)}
                    style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </li>
        </ul>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-700"
        >
          Iniciar sesión
        </button>
      </nav>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
          }}
        >
          {/*
            A11Y-DEFECT: modal has no focus containment (focus escapes to page behind) and
            no role="dialog"/aria-modal — revealed by keyboard / ScreenReader — WCAG 2.4.3 / 2.1.2
          */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '6px',
              padding: '20px',
              width: '320px',
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600 }}>
              {modalCopy.title}
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#475569' }}>
              {modalCopy.body}
            </p>
            <input
              type="email"
              placeholder="Correo electrónico"
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '13px',
                marginBottom: '10px',
              }}
            />
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="w-full rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
            >
              {modalCopy.submit}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
