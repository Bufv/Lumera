import { useEffect, useRef, useState } from 'react';
import {
  Alignment,
  Fit,
  Layout,
  Rive,
  RuntimeLoader,
  type StateMachineInput,
} from '@rive-app/canvas-lite';
import riveWasmUrl from '@rive-app/canvas-lite/rive.wasm?url';
import { Icon } from './Icon';
import type { RiveNodeStatus } from './RiveGameboardNode.types';
import './RiveGameboardNode.css';

const RIVE_SRC = '/assets/koji-gameboard.riv';
const ARTBOARD = 'Gameboard Node';
const STATE_MACHINE = 'node_all';
const REQUIRED_INPUTS = ['padlock', 'level', 'completed', 'color'] as const;

RuntimeLoader.setWasmUrl(riveWasmUrl);
RuntimeLoader.setWasmFallbackUrl(null);

const COLOR_BY_STATUS: Record<RiveNodeStatus, number> = {
  selesai: 0,
  berjalan: 5,
  terkunci: 6,
  rencana: 6,
};

function setInput(
  inputs: StateMachineInput[],
  name: string,
  value: boolean | number,
): void {
  const input = inputs.find((candidate) => candidate.name === name);
  if (input) input.value = value;
}

function syncInputs(
  rive: Rive,
  status: RiveNodeStatus,
  selected: boolean,
  hovered: boolean,
): boolean {
  const inputs = rive.stateMachineInputs(STATE_MACHINE);
  if (!inputs || inputs.length === 0) return false;

  const availableInputs = new Set(inputs.map((input) => input.name));
  if (REQUIRED_INPUTS.some((name) => !availableInputs.has(name))) return false;

  const locked = status === 'terkunci' || status === 'rencana';

  setInput(inputs, 'dark-mode', false);
  setInput(inputs, 'padlock', locked);
  setInput(inputs, 'level', status === 'berjalan');
  setInput(inputs, 'premium_node', false);
  setInput(inputs, 'select', selected);
  setInput(inputs, 'completed', status === 'selesai');
  setInput(inputs, 'start_idle', status === 'berjalan');
  setInput(inputs, 'hover', hovered);
  setInput(inputs, 'meter_locked', locked);
  setInput(inputs, 'color', COLOR_BY_STATUS[status]);

  return true;
}

export function RiveGameboardNode({
  status,
  selected = false,
}: {
  status: RiveNodeStatus;
  selected?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const riveRef = useRef<Rive | null>(null);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState(false);
  const configRef = useRef({ status, selected, hovered });

  configRef.current = { status, selected, hovered };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return;

    const rive = new Rive({
      src: RIVE_SRC,
      canvas,
      artboard: ARTBOARD,
      stateMachines: STATE_MACHINE,
      autoplay: true,
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      onLoad: () => {
        rive.resizeDrawingSurfaceToCanvas();
        const config = configRef.current;
        setReady(syncInputs(rive, config.status, config.selected, config.hovered));
      },
      onLoadError: () => setReady(false),
    });

    riveRef.current = rive;
    return () => {
      rive.cleanup();
      riveRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!riveRef.current) return;
    setReady(syncInputs(riveRef.current, status, selected, hovered));
  }, [hovered, selected, status]);

  return (
    <span
      className="course-node__rive"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className={`course-node__rive-canvas${ready ? '' : ' is-hidden'}`} />
      <span className={`course-node__rive-fallback${ready ? ' is-hidden' : ''}`}>
        <span className="course-node__bayang" />
        <span className="course-node__sisi" />
        <span className="course-node__muka" />
        <span className="course-node__cincin" />
        <span className="course-node__tanda">
          <Icon
            name={status === 'selesai' ? 'check' : status === 'berjalan' ? 'play' : 'lock'}
            width={26}
            height={26}
          />
        </span>
      </span>
    </span>
  );
}
