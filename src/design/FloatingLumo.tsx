import { useState, useRef, useEffect, useCallback, type PointerEvent } from 'react';
import { Lumo } from './Lumo';
import { Tactile } from './Tactile';
import { Icon } from './Icon';
import './FloatingLumo.css';

interface FloatingLumoProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function FloatingLumo({ message, actionLabel, onAction }: FloatingLumoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const posRef = useRef<{ x: number; y: number }>({ x: 100, y: 100 });
  const animFrameRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
    history: Array<{ x: number; y: number; t: number }>;
  } | null>(null);

  // Set default initial position bottom-right
  useEffect(() => {
    if (typeof window !== 'undefined' && pos === null) {
      const initialPos = {
        x: Math.max(16, window.innerWidth - 88),
        y: Math.max(84, window.innerHeight - 88),
      };
      setPos(initialPos);
      posRef.current = initialPos;
    }
  }, [pos]);

  const stopMomentum = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopMomentum();
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [stopMomentum]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 150);
  }, [isClosing]);

  const startPuckPhysics = useCallback(
    (initVx: number, initVy: number) => {
      stopMomentum();

      let vx = Math.max(-2.5, Math.min(2.5, initVx));
      let vy = Math.max(-2.5, Math.min(2.5, initVy));
      let lastTime = performance.now();

      const puckStep = (now: number) => {
        const dt = Math.min(32, Math.max(1, now - lastTime));
        lastTime = now;

        const maxX = typeof window !== 'undefined' ? window.innerWidth - 76 : 1000;
        const maxY = typeof window !== 'undefined' ? window.innerHeight - 76 : 1000;
        const minX = 16;
        const minY = 84; // Solid barrier below the top navigation header bar

        let nextX = posRef.current.x + vx * dt;
        let nextY = posRef.current.y + vy * dt;

        // Ice Friction Damping (decays smoothly on ice)
        const frictionFactor = Math.pow(0.965, dt / 16.67);
        vx *= frictionFactor;
        vy *= frictionFactor;

        // Elastic Wall Bounces (Ice hockey puck bouncing off rink boards)
        if (nextX <= minX) {
          nextX = minX;
          vx = -vx * 0.85;
        } else if (nextX >= maxX) {
          nextX = maxX;
          vx = -vx * 0.85;
        }

        // Top barrier bounce below navigation header
        if (nextY <= minY) {
          nextY = minY;
          vy = -vy * 0.85;
        } else if (nextY >= maxY) {
          nextY = maxY;
          vy = -vy * 0.85;
        }

        posRef.current = { x: nextX, y: nextY };
        setPos({ x: nextX, y: nextY });

        const speed = Math.hypot(vx, vy);
        if (speed > 0.03) {
          animFrameRef.current = requestAnimationFrame(puckStep);
        } else {
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(puckStep);
    },
    [stopMomentum]
  );

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    stopMomentum();
    if (!pos) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
      history: [{ x: e.clientX, y: e.clientY, t: performance.now() }],
    };
  };

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.moved = true;
      setIsDragging(true);
    }

    if (dragRef.current.moved) {
      const maxX = typeof window !== 'undefined' ? window.innerWidth - 76 : 1000;
      const maxY = typeof window !== 'undefined' ? window.innerHeight - 76 : 1000;
      const minX = 16;
      const minY = 84; // Clamped below top navigation header bar

      const newX = Math.max(minX, Math.min(maxX, dragRef.current.origX + dx));
      const newY = Math.max(minY, Math.min(maxY, dragRef.current.origY + dy));

      posRef.current = { x: newX, y: newY };
      setPos({ x: newX, y: newY });

      // Track drag history for velocity calculation
      const now = performance.now();
      dragRef.current.history.push({ x: e.clientX, y: e.clientY, t: now });
      if (dragRef.current.history.length > 5) {
        dragRef.current.history.shift();
      }
    }
  };

  const handlePointerUp = useCallback(() => {
    if (dragRef.current) {
      if (!dragRef.current.moved) {
        if (isOpen) {
          handleClose();
        } else {
          setIsOpen(true);
        }
      } else {
        // Compute velocity from recent movements
        const hist = dragRef.current.history;
        if (hist.length >= 2) {
          const first = hist[0];
          const last = hist[hist.length - 1];
          if (first && last) {
            const dt = Math.max(1, last.t - first.t);
            const vx = (last.x - first.x) / dt;
            const vy = (last.y - first.y) / dt;

            if (Math.hypot(vx, vy) > 0.08) {
              startPuckPhysics(vx, vy);
            }
          }
        }
      }
      dragRef.current = null;
    }
    setIsDragging(false);
  }, [isOpen, handleClose, startPuckPhysics]);

  const currentPos = pos ?? { x: 100, y: 100 };
  const isNearTop = currentPos.y < 280;
  const isNearLeft = currentPos.x < 310;

  return (
    <div
      className="lumera-floating-lumo-root"
      style={{
        left: `${currentPos.x}px`,
        top: `${currentPos.y}px`,
      }}
    >
      <button
        type="button"
        className="lumera-floating-lumo-btn"
        aria-label="Tanya Lumo, asisten belajar"
        aria-expanded={isOpen}
        data-dragging={isDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <span className="lumera-floating-lumo-btn__art">
          <Lumo size={44} title="Lumo" />
        </span>
        {!isOpen && <span className="lumera-floating-lumo-btn__badge" />}
      </button>

      {(isOpen || isClosing) && (
        <div
          className={`lumera-lumo-popover ${isNearTop ? 'lumera-lumo-popover--top' : ''} ${
            isNearLeft ? 'lumera-lumo-popover--left' : ''
          }`}
          data-closing={isClosing}
          role="dialog"
          aria-label="Saran belajar Lumo"
        >
          <button
            type="button"
            className="lumera-lumo-popover__close"
            aria-label="Tutup rekomendasi"
            onClick={handleClose}
          >
            ×
          </button>

          <p className="lumera-lumo-popover__text">{message}</p>

          <Tactile
            tone="amber"
            fullWidth
            className="lumera-lumo-popover__action"
            onClick={() => {
              handleClose();
              onAction();
            }}
          >
            {actionLabel}
            <Icon name="arrow" width={16} height={16} />
          </Tactile>
        </div>
      )}
    </div>
  );
}
