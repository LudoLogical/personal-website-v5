import type { ElementType } from "react";

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
  className = "",
}: CharCodeTextProps) {
  return (
    <Tag
      aria-label={text}
      className={`flex text-5xl leading-none font-semibold whitespace-pre text-[#1b1a19] ${className}`}
    >
      {[...text].map((char, i) => {
        if (char === " ")
          return (
            <span key={i} aria-hidden>
              {" "}
            </span>
          );
        const code = char.charCodeAt(0);
        return (
          <span
            key={i}
            aria-hidden
            className="group relative inline-block cursor-default transition-[transform,color] duration-200 ease-out hover:-translate-y-1 hover:text-[oklch(0.58_0.17_35)]"
          >
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 flex -translate-x-1/2 flex-col items-center font-mono text-[11px] leading-normal text-[#1b1a19] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <span className="font-bold">{code}</span>
              <span className="text-[#8a867f]">
                0x{code.toString(16).toUpperCase()}
              </span>
              <span className="text-[#8a867f]">
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
