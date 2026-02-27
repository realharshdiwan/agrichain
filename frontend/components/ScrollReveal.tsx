"use client";

import { useEffect, useRef, ReactNode } from "react";

interface Props {
    children: ReactNode;
    delay?: number;   // ms
    className?: string;
    direction?: "up" | "left" | "right";
}

export default function ScrollReveal({ children, delay = 0, className = "", direction = "up" }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const initial = {
            up: "translateY(32px)",
            left: "translateX(-32px)",
            right: "translateX(32px)",
        }[direction];

        el.style.opacity = "0";
        el.style.transform = initial;
        el.style.transition = `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.style.opacity = "1";
                    el.style.transform = "translate(0)";
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [delay, direction]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}
