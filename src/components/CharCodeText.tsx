import type { ElementType } from "react";
import { twMerge } from "tailwind-merge";

type CharCodeTextProps = {
  text?: string;
  as?: ElementType;
  className?: string;
};

// Hover any letter to lift it and reveal its char code (dec / hex / binary).
// Pure CSS hover — no client JS, works as a Server Component.
export function CharCodeText({
  text = "Software Engineer",
  as: Tag = "h1",
  className,
}: CharCodeTextProps) {
  return (
    <Tag
      aria-label={text}
      className={twMerge("flex whitespace-pre", className)}
    >
      {[...text].map((char, i) => {
        if (char === " ")
          return (
            <span key={i} aria-hidden className="leading-none">
              {" "}
            </span>
          );
        const code = char.charCodeAt(0);
        return (
          <span
            key={i}
            aria-hidden
            // z-10 on hover so the tooltip floats over whatever sits above
            className="tooltip cursor-default leading-none transition-[translate,color] duration-200 ease-out hover:z-10 hover:translate-y-[-0.1em] hover:text-primary"
          >
            <span className="tooltip-content flex flex-col items-center font-mono text-xs leading-normal shadow-lg">
              <span className="font-bold">{code}</span>
              <span className="text-neutral-content/60">
                0x{code.toString(16).toUpperCase()}
              </span>
              <span className="text-neutral-content/60">
                {code.toString(2).padStart(8, "0")}
              </span>
            </span>
            {char}
          </span>
        );
      })}
    </Tag>
  );
}
