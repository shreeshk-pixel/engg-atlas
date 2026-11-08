import { useEffect, useRef, useState } from 'react';
import markup from './markup.html?raw';
import css from './wavelume.css?raw';
import { startWavelume } from './engine.js';
import { startWavelumeTimer } from './timer.js';

type Host = HTMLDivElement & { __resume?: () => void };
type Viz = { stopAll?: () => void };

export function WavelumeStage({ active, onClose }: { active: boolean; onClose: () => void }) {
  const host = useRef<Host>(null);
  const started = useRef(false);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (active) setBooted(true);
  }, [active]);

  useEffect(() => {
    const el = host.current;
    if (!booted || !el || started.current) return;
    started.current = true;
    const shadow = el.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = css;
    shadow.appendChild(style);
    const wrap = document.createElement('div');
    wrap.innerHTML = markup;
    while (wrap.firstChild) shadow.appendChild(wrap.firstChild);
    startWavelume(el);
    startWavelumeTimer(el);
  }, [booted]);

  useEffect(() => {
    const el = host.current;
    if (!el || !started.current) return;
    el.dataset.paused = active ? '0' : '1';
    if (!active) {
      (window as unknown as { VIZ?: Viz }).VIZ?.stopAll?.();
      return;
    }
    el.__resume?.();
  }, [active]);

  if (!booted) return null;

  return (
    <div className={active ? 'fixed inset-0 z-[80] bg-black' : 'hidden'} aria-hidden={!active}>
      <button
        type="button"
        onClick={onClose}
        className="fixed left-3 top-3 z-[100] border border-[#1f252e] bg-[#0a0c10]/90 px-3 py-2 text-[11px] tracking-[2px] text-[#00d4ff]"
      >
        BACK TO ATLAS
      </button>
      <div ref={host} className="h-full w-full" />
    </div>
  );
}
