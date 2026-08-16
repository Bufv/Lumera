import { useState, useRef, useEffect } from 'react';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEvent,
  ReactNode,
} from 'react';
import './Tactile.css';

export type TactileTone = 'primary' | 'neutral' | 'amber' | 'green' | 'purple';
export type TactileVariant = 'control' | 'card';

type TactileCommonProps = {
  children: ReactNode;
  className?: string;
  tone?: TactileTone;
  variant?: TactileVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  delayClickMs?: number;
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
    delayClickMs = 120,
    ...elementProps
  } = props;
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

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
        data-pressed={isPressed || undefined}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          if (!onClick) return;
          if (isTest || delayClickMs <= 0) {
            onClick(event);
            return;
          }
          event.preventDefault();
          setIsPressed(true);
          timeoutRef.current = window.setTimeout(() => {
            setIsPressed(false);
            onClick(event);
          }, delayClickMs);
        }}
      >
        {children}
      </a>
    );
  }

  const { type = 'button', onClick, ...buttonProps } = elementProps as Omit<
    TactileButtonProps,
    keyof TactileCommonProps | 'as'
  >;

  return (
    <button
      {...buttonProps}
      className={classes}
      type={type}
      disabled={disabled}
      data-pressed={isPressed || undefined}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        if (!onClick) return;
        if (isTest || delayClickMs <= 0) {
          onClick(event);
          return;
        }
        setIsPressed(true);
        timeoutRef.current = window.setTimeout(() => {
          setIsPressed(false);
          onClick(event);
        }, delayClickMs);
      }}
    >
      {children}
    </button>
  );
}
