"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
    target: number;
    suffix?: string;
    prefix?: string;
    duration?: number; // ms
}

export default function AnimatedCounter({ target, suffix = "", prefix = "", duration = 1800 }: Props) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const start = performance.now();
                    const step = (now: number) => {
                        const progress = Math.min((now - start) / duration, 1);
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * target));
                        if (progress < 1) requestAnimationFrame(step);
                        else setCount(target);
                    };
                    requestAnimationFrame(step);
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString("en-IN")}{suffix}
        </span>
    );
}
