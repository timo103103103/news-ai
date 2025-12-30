import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const slides = [
  {
    key: "news",
    src: "/images/news.png", // Assume optimized with ?quality=80
    title: "Raw news input",
  },
  {
    key: "analysis-1",
    src: "/images/analysis-1.png",
    title: "Narrative framing & incentive mapping",
  },
  {
    key: "analysis-2",
    src: "/images/analysis-2.png",
    title: "Market impact & strategic implications",
  },
];

export default function HeroStackPreview() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = () => {
    stop();
    intervalRef.current = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 8000); // Reduced to 8s
  };

  useEffect(() => {
    start();
    return stop;
  }, []);

  return (
    <div
      className="relative w-[760px] h-[520px] select-none"
      onMouseEnter={() => setTimeout(stop, 300)} // Hover delay
      onMouseLeave={start}
      role="region"
      aria-label="Hero preview carousel"
    >
      {/* Slides */}
      {slides.map((slide, i) => {
        const offset = (i - active + slides.length) % slides.length;

        let style = "";
        if (offset === 0) {
          style = "z-30 opacity-100 translate-x-0 translate-y-0 scale-100";
        } else if (offset === 1) {
          style = "z-20 opacity-60 -translate-x-3 translate-y-3 scale-[0.97]";
        } else {
          style = "z-10 opacity-20 -translate-x-6 translate-y-6 scale-[0.94]";
        }

        return (
          <div
            key={slide.key}
            className={`absolute inset-0 transition-all duration-[1200ms] ease-out ${style} ${shouldReduceMotion ? 'transition-none' : ''}`} // Reduced motion
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.35)]">
              {/* Image */}
              <img
                src={slide.src}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading="lazy" // Optimization
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent dark:from-slate-900/60 pointer-events-none" />

              {/* Caption */}
              {offset === 0 && (
                <div className="absolute bottom-4 left-4">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/70 backdrop-blur rounded px-3 py-1">
                    {slide.title}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Dots */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-3" role="tablist" aria-label="Carousel controls">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => {
              setActive(i);
              start();
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200
              ${
                i === active
                  ? "bg-slate-600 dark:bg-slate-300 scale-125"
                  : "bg-slate-300 dark:bg-slate-600 hover:scale-110"
              }
            `}
            role="tab"
            aria-selected={i === active}
          />
        ))}
      </div>
    </div>
  );
}