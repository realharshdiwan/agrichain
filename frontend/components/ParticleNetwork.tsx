"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    radius: number; opacity: number;
}

export default function ParticleNetwork() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId: number;
        const particles: Particle[] = [];
        const MAX_DIST = 130;
        const COUNT = 55;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        const spawn = () => {
            particles.length = 0;
            for (let i = 0; i < COUNT; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    radius: Math.random() * 2 + 1.5,
                    opacity: Math.random() * 0.5 + 0.3,
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update positions
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            }

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MAX_DIST) {
                        const alpha = (1 - dist / MAX_DIST) * 0.25;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(74, 222, 128, ${p.opacity})`;
                ctx.fill();

                // Inner glow dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.6})`;
                ctx.fill();
            }

            animId = requestAnimationFrame(draw);
        };

        resize();
        spawn();
        draw();

        const ro = new ResizeObserver(() => { resize(); spawn(); });
        ro.observe(canvas);

        return () => {
            cancelAnimationFrame(animId);
            ro.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: 0.6 }}
        />
    );
}
