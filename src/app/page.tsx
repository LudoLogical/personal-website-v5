import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { tips } from "@/components/SpokenTips";
import SpokenTips from "@/components/SpokenTips";
import CharCodeText from "@/components/CharCodeText";
import ConnectingDotsText from "@/components/ConnectingDotsText";
import DiagramAnimation from "@/components/DiagramAnimation";
import HoverOrTapAffordance from "@/components/HoverOrTapAffordance";
import IcebergExplainerText from "@/components/IcebergExplainerText";
import WaveText from "@/components/WaveText";
import { arrows, levels, dotPositions } from "./content";

export default function Home() {
  // Shared by every HoverOrTapAffordance in the hero section
  const affordanceLineClassName = "sm:border-t-3";

  // Applied to everything in the hero section except DiagramAnimation
  const fadeWhileDiagramActive =
    "transition-opacity duration-300 group-has-data-active/hero:opacity-15";

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* Fills the viewport and adds the page's rounded bottom corners
          just out of view; the extra pb accounts for the radius of those
          corners to keep the lockup centered */}
      <section className="flex min-h-[calc(100svh+var(--radius-paper))] items-center justify-center px-6 pt-24 pb-[calc(--spacing(24)+var(--radius-paper))]">
        <div className="group/hero flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-14 lg:gap-16 xl:gap-20">
          <div className="shrink-0">
            <SpokenTips tips={tips}>
              {/* Placed inside SpokenTips so that the affordance swells with
                  the avatar and the speech bubble isn't trapped inside of the
                  HoverOrTapAffordance stacking context; displayed as block so
                  it doesn't get a line box (which would pad its bottom) */}
              {/* Dimmed here because reducing opacity on SpokenTips would
                  create a stacking context on it and thus trap the speech
                  bubble below the z-10 text on the right side */}
              <HoverOrTapAffordance
                shape="circle"
                className={twMerge("block", fadeWhileDiagramActive)}
                affordanceClassName="sm:border-3 -inset-1.5 md:-inset-2 xl:-inset-3"
                fadeInOnTapOutside
              >
                <Image
                  src="/avatar.png"
                  alt='Illustrated portrait of Daniel "Ludo" DeAnda'
                  width={288}
                  height={288}
                  sizes="(min-width: 1152px) 320px, (min-width: 896px) 272px, (min-width: 768px) 240px, (min-width: 640px) 96px, (min-width: 512px) 80px, 64px"
                  preload
                  className="block size-16 rounded-full glow-secondary [--glow-strength:3] xs:size-20 sm:size-24 md:size-60 lg:size-68 xl:size-80"
                />
              </HoverOrTapAffordance>
            </SpokenTips>
          </div>
          <div className="flex flex-col items-start gap-8 md:gap-6 xl:gap-8">
            <div className="flex flex-col gap-2 text-xl leading-none font-bold whitespace-nowrap xxs:text-2xl xs:text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-5xl">
              <p
                className={twMerge(
                  "text-sm font-normal xs:text-base lg:text-lg",
                  fadeWhileDiagramActive,
                )}
              >
                <WaveText
                  text="Hello, my name is"
                  className="sm:[--wave-height:0.15em] lg:[--wave-height:0.2em]"
                />
              </p>
              <div className="my-1 flex flex-col gap-2">
                {/* w-fit so the underline doesn't fill the row */}
                <HoverOrTapAffordance
                  className="w-fit"
                  affordanceClassName={affordanceLineClassName}
                  fadeInOnTapOutside
                >
                  <DiagramAnimation
                    text='Daniel "Ludo" DeAnda.'
                    arrows={arrows}
                    className="w-fit text-primary"
                  />
                </HoverOrTapAffordance>
                <div
                  className={twMerge(
                    "relative z-10 flex flex-col gap-2",
                    fadeWhileDiagramActive,
                  )}
                >
                  <div className="flex flex-nowrap">
                    <span className="opacity-50">I&apos;m a&nbsp;</span>
                    <HoverOrTapAffordance
                      inline
                      affordanceClassName={affordanceLineClassName}
                      fadeInOnTapInside={false}
                      fadeInOnTapOutside
                    >
                      <CharCodeText text="Software Engineer" />
                    </HoverOrTapAffordance>
                    <span className="opacity-50">,</span>
                  </div>
                  <div className="flex flex-nowrap">
                    {/* Raised so that the explainer card appears above
                        the content that follows the IcebergExplainerText */}
                    <HoverOrTapAffordance
                      inline
                      className="z-20"
                      affordanceClassName={affordanceLineClassName}
                      fadeInOnTapInside={false}
                      fadeInOnTapOutside
                    >
                      <IcebergExplainerText
                        text="Systems Thinker"
                        levels={levels}
                        childClassNames={{
                          scrub: "xs:-bottom-1",
                          card: "xs:w-91",
                          panel: "pb-4.75 xs:pb-4.5",
                          text: {
                            depth: "xs:text-xs",
                            question: "xs:text-sm",
                            concepts: "xs:text-sm",
                          },
                        }}
                      />
                    </HoverOrTapAffordance>
                    <span className="opacity-50">, and</span>
                  </div>
                  <div className="flex flex-nowrap">
                    <HoverOrTapAffordance
                      inline
                      // (first dot starts shrinking)
                      // + (last dot starts shrinking)
                      // + (shrinking duration)
                      // + (buffer before text starts fading in)
                      affordanceClassName={affordanceLineClassName}
                      fadeInDelay={0.15 + 0.25 + 0.18 + 0.07}
                      fadeInOnTapOutside
                    >
                      <ConnectingDotsText
                        text="Sense-Maker"
                        dotPositions={dotPositions}
                      />
                    </HoverOrTapAffordance>
                    <span className="opacity-50">.</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Kept separate from the button to preserve both transitions */}
            <div className={fadeWhileDiagramActive}>
              <a
                href="#wonderful"
                className="btn gap-2 rounded-lg glow-primary btn-primary btn-sm [--glow-strength:1] xs:btn-md xl:gap-3 xl:btn-lg"
              >
                Show me something wonderful
                <ArrowDown
                  aria-hidden
                  className="size-3 motion-safe:animate-bob xs:ml-0.5 xs:size-4 xl:size-5"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Future sections go here; the call to action scrolls to this point */}
      <div id="wonderful" />
    </main>
  );
}
