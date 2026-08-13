import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEvent,
  ReactNode,
} from 'react';
import './Tactile.css';

export type TactileTone = 'primary' | 'neutral' | 'amber';
export type TactileVariant = 'control' | 'card';

type TactileCommonProps = {
  children: ReactNode;
  className?: string;
  tone?: TactileTone;
  variant?: TactileVariant;
  fullWidth?: boolean;
  disabled?: boolean;
};

type TactileButtonProps = TactileCommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'disabled'> & {
    as?: 'button';
  };

type TactileAnchorProps = TactileCommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> & {
    as: 'a';
  };

export type TactileProps = TactileButtonProps | TactileAnchorProps;

/**
 * A semantic contained action with Lumera's reserved keycap movement.
 * Use variant="card" for larger, left-aligned navigation choices.
 */
export function Tactile(props: TactileProps) {
  const {
    as = 'button',
    children,
    className,
    tone,
    variant = 'control',
    fullWidth = false,
    disabled = false,
    ...elementProps
  } = props;
  const resolvedTone = tone ?? (variant === 'card' ? 'neutral' : 'primary');
  const classes = [
    'lumera-tactile',
    `lumera-tactile--${variant}`,
    `lumera-tactile--${resolvedTone}`,
    fullWidth && 'lumera-tactile--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (as === 'a') {
    const { href, onClick, tabIndex, ...anchorProps } = elementProps as Omit<
      TactileAnchorProps,
      keyof TactileCommonProps | 'as'
    >;

    return (
      <a
        {...anchorProps}
        className={classes}
        href={disabled ? undefined : href}
        role={disabled ? 'link' : anchorProps.role}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : tabIndex}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
      >
        {children}
      </a>
    );
  }

  const { type = 'button', ...buttonProps } = elementProps as Omit<
    TactileButtonProps,
    keyof TactileCommonProps | 'as'
  >;

  return (
    <button {...buttonProps} className={classes} type={type} disabled={disabled}>
      {children}
    </button>
  );
}
