import { useEffect, useRef } from "react";

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let mouseMoved = false;
    let animationId: number;

    const pointer = {
      x: 0.5 * window.innerWidth,
      y: 0.5 * window.innerHeight,
    };

    const params = {
      pointsNumber: 40,
      widthFactor: 0.3,
      spring: 0.4,
      friction: 0.5,
    };

    const trail: Array<{ x: number; y: number; dx: number; dy: number }> = [];
    for (let i = 0; i < params.pointsNumber; i++) {
      trail.push({
        x: pointer.x,
        y: pointer.y,
        dx: 0,
        dy: 0,
      });
    }

    const updateMousePosition = (eX: number, eY: number) => {
      pointer.x = eX;
      pointer.y = eY;
    };

    const handleClick = (e: MouseEvent) => {
      updateMousePosition(e.pageX, e.pageY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseMoved = true;
      updateMousePosition(e.pageX, e.pageY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      mouseMoved = true;
      updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
    };

    const setupCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const update = (t: number) => {
      if (!mouseMoved) {
        pointer.x = (0.5 + 0.3 * Math.cos(0.002 * t) * Math.sin(0.005 * t)) * window.innerWidth;
        pointer.y = (0.5 + 0.2 * Math.cos(0.005 * t) + 0.1 * Math.cos(0.01 * t)) * window.innerHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      trail.forEach((p, pIdx) => {
        const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
        const spring = pIdx === 0 ? 0.4 * params.spring : params.spring;
        p.dx += (prev.x - p.x) * spring;
        p.dy += (prev.y - p.y) * spring;
        p.dx *= params.friction;
        p.dy *= params.friction;
        p.x += p.dx;
        p.y += p.dy;
      });

      ctx.lineCap = "round";

      for (let i = 1; i < trail.length - 1; i++) {
        const progress = i / (trail.length - 1);
        const hue = 262 + progress * (35 - 262 + 360);
        const saturation = 65 + progress * (95 - 65);
        const lightness = 65 + progress * (55 - 65);
        ctx.strokeStyle = `hsl(${hue % 360} ${saturation}% ${lightness}%)`;
        
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        const xc = 0.5 * (trail[i].x + trail[i + 1].x);
        const yc = 0.5 * (trail[i].y + trail[i + 1].y);
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
        ctx.stroke();
      }
      
      const lastProgress = 1;
      ctx.strokeStyle = `hsl(35 95% 55%)`;
      ctx.beginPath();
      ctx.moveTo(trail[trail.length - 2].x, trail[trail.length - 2].y);
      ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
      ctx.lineWidth = params.widthFactor;
      ctx.stroke();

      animationId = window.requestAnimationFrame(update);
    };

    setupCanvas();
    update(0);

    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("resize", setupCanvas);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", setupCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
}
