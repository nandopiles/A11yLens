import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'dark';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'text-primary-on bg-primary border border-primary hover:bg-primary-strong',
  secondary:
    'text-ink bg-canvas border border-hairline hover:bg-panel hover:border-hairline-strong',
  dark: 'text-white bg-ink border border-ink hover:bg-ink-muted',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

/**
 * Design-system button. Always renders a real <button> with a visible focus
 * ring (handled globally) and comfortable target size.
 */
export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2',
        'text-body-md font-medium transition-colors',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
