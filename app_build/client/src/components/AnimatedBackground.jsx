// AnimatedBackground.jsx
// Pure vanilla-canvas pixel trail — no three.js, no extra deps needed.

import { useEffect, useRef } from 'react';

const GRID_SIZE = 40;          // px per cell
const TRAIL_RADIUS = 2;        // cells lit around cursor
const FADE_SPEED = 0.04;       // how fast cells fade (0-1 per frame)
const COLOR = '37, 99, 235';   // Professional Blue RGB (#2563eb)

export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const gridRef   = useRef([]);   // 2D array of opacity values 0-1
  const mouseRef  = useRef({ x: -999, y: -999 });
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let cols, rows;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width  / GRID_SIZE);
      rows = Math.ceil(canvas.height / GRID_SIZE);
      // Reinitialise grid
      gridRef.current = Array.from({ length: rows }, () => new Float32Array(cols));
    }

    function onMouseMove(e) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function onTouchMove(e) {
      const t = e.touches[0];
      if (t) mouseRef.current = { x: t.clientX, y: t.clientY };
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x, y } = mouseRef.current;
      const curCol = Math.floor(x / GRID_SIZE);
      const curRow = Math.floor(y / GRID_SIZE);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Light up cells near cursor
          const dist = Math.sqrt((c - curCol) ** 2 + (r - curRow) ** 2);
          if (dist <= TRAIL_RADIUS) {
            gridRef.current[r][c] = Math.min(1, gridRef.current[r][c] + (1 - dist / TRAIL_RADIUS) * 0.35);
          }
          // Fade all cells
          gridRef.current[r][c] = Math.max(0, gridRef.current[r][c] - FADE_SPEED);

          const alpha = gridRef.current[r][c];
          if (alpha < 0.005) continue;

          // Draw dot
          const cx = c * GRID_SIZE + GRID_SIZE / 2;
          const cy = r * GRID_SIZE + GRID_SIZE / 2;
          const radius = 3 * alpha;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${COLOR}, ${alpha * 0.6})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize',    resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize',    resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
      aria-hidden="true"
    />
  );
}
