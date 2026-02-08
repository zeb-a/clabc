import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const toColorInt = (hex) => {
  if (!hex) return 0x4caf50;
  const cleaned = hex.replace('#', '');
  return parseInt(cleaned.length === 3
    ? cleaned.split('').map(c => c + c).join('')
    : cleaned, 16);
};

export default function PixiBackdrop({ classColor = '#4CAF50', variant = 'dark' }) {
  const hostRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let resizeObserver;

    const setup = async () => {
      const options = {
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      };

      let app;
      if (PIXI.Application && PIXI.Application.prototype && typeof PIXI.Application.prototype.init === 'function') {
        app = new PIXI.Application();
        await app.init(options);
      } else {
        app = new PIXI.Application(options);
      }
      if (disposed) {
        app.destroy(true, { children: true, texture: true, baseTexture: true });
        return;
      }

      appRef.current = app;
      const view = app.canvas || app.view;
      if (view) host.appendChild(view);

      const primary = toColorInt(classColor);

      const draw = () => {
        const rect = host.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        if (app.renderer) app.renderer.resize(width, height);
        app.stage.removeChildren();

        const bg = new PIXI.Graphics();
        const baseColor = variant === 'dark' ? 0x0b1510 : 0xe5e7eb;
        bg.beginFill(baseColor, 1);
        bg.drawRect(0, 0, width, height);
        bg.endFill();
        app.stage.addChild(bg);

        const glowA = new PIXI.Graphics();
        glowA.beginFill(primary, variant === 'dark' ? 0.18 : 0.12);
        glowA.drawCircle(width * 0.2, height * 0.15, Math.min(width, height) * 0.45);
        glowA.endFill();
        app.stage.addChild(glowA);

        const glowB = new PIXI.Graphics();
        glowB.beginFill(0x22c55e, variant === 'dark' ? 0.12 : 0.08);
        glowB.drawCircle(width * 0.85, height * 0.1, Math.min(width, height) * 0.35);
        glowB.endFill();
        app.stage.addChild(glowB);

        const board = new PIXI.Graphics();
        const boardX = width * 0.06;
        const boardY = height * 0.12;
        const boardW = width * 0.88;
        const boardH = height * 0.78;
        board.beginFill(variant === 'dark' ? 0x0f1f16 : 0xf1f1f1, variant === 'dark' ? 0.65 : 0.85);
        board.drawRoundedRect(boardX, boardY, boardW, boardH, 28);
        board.endFill();
        board.lineStyle(2, 0xffffff, variant === 'dark' ? 0.08 : 0.2);
        board.drawRoundedRect(boardX + 6, boardY + 6, boardW - 12, boardH - 12, 24);
        app.stage.addChild(board);

        const dots = new PIXI.Graphics();
        dots.beginFill(variant === 'dark' ? 0xffffff : 0x111827, variant === 'dark' ? 0.05 : 0.03);
        for (let y = boardY + 16; y < boardY + boardH - 16; y += 22) {
          for (let x = boardX + 16; x < boardX + boardW - 16; x += 22) {
            dots.drawCircle(x, y, 1.5);
          }
        }
        dots.endFill();
        app.stage.addChild(dots);
      };

      draw();

      resizeObserver = new ResizeObserver(draw);
      resizeObserver.observe(host);
    };

    setup();

    return () => {
      disposed = true;
      if (resizeObserver) resizeObserver.disconnect();
      const app = appRef.current;
      if (app) {
        const view = app.canvas || app.view;
        if (view && view.parentNode) view.parentNode.removeChild(view);
        app.destroy(true, { children: true, texture: true, baseTexture: true });
      }
    };
  }, [classColor, variant]);

  return (
    <div
      ref={hostRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
}
