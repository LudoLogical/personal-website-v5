"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import ExternalLink from "@/components/ExternalLink";
import useFrameLoop from "@/utils/useFrameLoop";
import { Caption } from "./atoms";
import {
  ControlButton,
  ExpandButton,
  PlaybackBadge,
  ProgressSegments,
} from "./controls";
import { play, showProgress, usePlayback } from "./playback";
import type { Demo, ProjectPhoto } from "./types";
import { ExpandedVideo, WINDOW_CLASS_NAMES } from "./videos";

/**
 * The duration, in milliseconds, for which a {@link PhotoCarousel}
 * shows each of its photos before moving on to the next one.
 */
const PHOTO_DWELL_DURATION = 5000;

/**
 * Renders the bar along the bottom of the window frame of a
 * {@link VideoCarousel}, which holds the specified `caption` and `segments`.
 * On wide viewports, the `caption` sits to the left of the `segments`.
 * Otherwise, it sits beneath them, and the gaps that separate the top of the
 * bar, the tracks of the `segments`, the text of the `caption`, and the
 * bottom of the bar are all equal.
 */
const Taskbar = ({
  caption,
  segments,
}: {
  caption: ReactNode;
  segments: ReactNode;
}) => (
  // Each gap is 1rem, i.e., this padding (or `gap-1`) plus the
  // padding that makes the segments' buttons taller than their tracks
  <div className="flex flex-col-reverse gap-1 px-4 pt-1 pb-4 lg:flex-row lg:items-center lg:gap-8 lg:py-2.5 lg:ps-5">
    <div className="grid flex-1 text-center text-sm font-semibold text-balance lg:text-start">
      {caption}
    </div>
    {segments}
  </div>
);

export type VideoCarouselProps = {
  /**
   * The {@link Demo}s through which this {@link VideoCarousel} cycles,
   * in the order in which they are to be played.
   */
  demos: Demo[];
};

/**
 * Renders the specified {@link Demo}s as a carousel that shows one video at
 * a time in a window frame. A bar along the bottom of the frame holds the
 * caption of the current video and a row of segments (one per video).
 *
 * Each video plays automatically (and silently) from its beginning while it
 * is in view, and the carousel moves on to the next video (or back to the
 * first one) when the current one ends. Selecting a segment switches to its
 * video, and clicking on the current video pauses or resumes it. A paused
 * video never ends, so the carousel only moves on from one if the user
 * selects a segment (which also resumes playback). The current video's
 * segment fills to depict how much of that video has played.
 *
 * A button in the top right corner of the current video opens an
 * {@link ExpandedVideo} that picks up where said video left off.
 * The carousel stands still until said dialog is closed.
 *
 * Paused by default if the user `prefers-reduced-motion`.
 */
export const VideoCarousel = ({ demos }: VideoCarouselProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // The time, in seconds, that the current video had reached when
  // it was expanded (`null` unless it is currently expanded)
  const [expansionTime, setExpansionTime] = useState<number | null>(null);
  const { paused, playing, setPaused } = usePlayback(
    rootRef,
    expansionTime !== null,
  );
  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    const video = videoRefs.current[demoIndex];
    if (!video || !playing) return;

    play(video);
    return () => video.pause();
  }, [demoIndex, playing]);

  useFrameLoop(playing, () => {
    const video = videoRefs.current[demoIndex];

    // Wait until the video's duration is known
    if (!video || !video.duration) return;

    showProgress(rootRef.current, video.currentTime / video.duration);
  });

  const showDemo = (nextDemoIndex: number) => {
    // Rewound here (not in an effect) so that every appearance of a video
    // starts from its beginning, even if it is already the current one
    const video = videoRefs.current[nextDemoIndex];
    if (video) video.currentTime = 0;

    showProgress(rootRef.current, 0);
    setDemoIndex(nextDemoIndex);
  };

  const { src: currentSrc, caption: currentCaption } = demos[demoIndex];

  return (
    // The window shrinks to fit the current caption, so it's stacked atop an
    // invisible copy that fits the longest one, which reserves enough room
    // for any caption and thus keeps the page below from shifting
    <div className="grid">
      <div
        ref={rootRef}
        className={twMerge(WINDOW_CLASS_NAMES, "self-start [grid-area:1/1]")}
      >
        <div className="group/player relative">
          <button
            type="button"
            aria-label={`${paused ? "Play" : "Pause"} video: ${currentCaption}`}
            className="block aspect-16/10 w-full cursor-pointer"
            onClick={() => setPaused(!paused)}
          >
            {demos.map(({ src }, i) => (
              <video
                key={src}
                ref={(video) => {
                  videoRefs.current[i] = video;
                }}
                src={src}
                muted
                playsInline
                disablePictureInPicture
                disableRemotePlayback
                // Only the current video and its successor are fetched eagerly
                preload={
                  i === demoIndex || i === (demoIndex + 1) % demos.length
                    ? "auto"
                    : "none"
                }
                className={twMerge(
                  "absolute inset-0 size-full transition-opacity duration-300 motion-reduce:transition-none",
                  i !== demoIndex && "opacity-0",
                )}
                onEnded={() => showDemo((i + 1) % demos.length)}
              />
            ))}
            <PlaybackBadge paused={paused} />
          </button>
          <ExpandButton
            label={`Expand video: ${currentCaption}`}
            paused={paused}
            onClick={() =>
              setExpansionTime(videoRefs.current[demoIndex]?.currentTime ?? 0)
            }
          />
        </div>
        <Taskbar
          caption={
            // Keyed by video so that each new caption fades in
            <p
              key={currentSrc}
              className="transition-opacity duration-300 text-box-trim motion-reduce:transition-none starting:opacity-0"
            >
              {currentCaption}
            </p>
          }
          segments={
            <ProgressSegments
              labels={demos.map(
                ({ caption }, i) =>
                  `Video ${i + 1} of ${demos.length}: ${caption}`,
              )}
              currentIndex={demoIndex}
              className="lg:w-60"
              onSelect={(nextDemoIndex) => {
                showDemo(nextDemoIndex);
                setPaused(false);
              }}
            />
          }
        />

        {expansionTime !== null && (
          <ExpandedVideo
            src={currentSrc}
            label={currentCaption}
            initialTime={expansionTime}
            initiallyPaused={paused}
            onClose={() => setExpansionTime(null)}
          />
        )}
      </div>

      <div
        aria-hidden
        className={twMerge(WINDOW_CLASS_NAMES, "invisible [grid-area:1/1]")}
      >
        <div className="aspect-16/10" />
        <Taskbar
          caption={demos.map(({ src, caption }) => (
            <p key={src} className="[grid-area:1/1] text-box-trim">
              {caption}
            </p>
          ))}
          // As tall as the `ProgressSegments`, whose
          // buttons are 1.5rem taller than their tracks
          segments={<div className="h-7 lg:w-60" />}
        />
      </div>
    </div>
  );
};

export type PhotoCarouselProps = {
  /**
   * The {@link ProjectPhoto}s through which this {@link PhotoCarousel}
   * cycles, in the order in which they are to be shown.
   */
  photos: ProjectPhoto[];

  /**
   * Classes for the container `<figure>` of this {@link PhotoCarousel}.
   */
  className?: string;
};

/**
 * Renders the specified {@link ProjectPhoto}s as a carousel that
 * shows one photo at a time above its caption and a row of controls.
 *
 * While it is in view, the carousel shows each photo for the same fixed
 * duration before moving on to the next one (or back to the first one).
 * The controls let the user switch photos at will and pause or resume the
 * carousel, and the bar that corresponds to the current photo depicts the
 * fraction of said duration that has elapsed.
 *
 * Paused by default if the user `prefers-reduced-motion`.
 */
export const PhotoCarousel = ({ photos, className }: PhotoCarouselProps) => {
  const rootRef = useRef<HTMLElement>(null);

  // The duration, in milliseconds, for which the current photo has been shown
  const elapsedDuration = useRef(0);

  const { paused, playing, setPaused } = usePlayback(rootRef);
  const [photoIndex, setPhotoIndex] = useState(0);

  const showPhoto = (nextPhotoIndex: number) => {
    elapsedDuration.current = 0;
    showProgress(rootRef.current, 0);
    // Wraps around in both directions
    setPhotoIndex((nextPhotoIndex + photos.length) % photos.length);
  };

  useFrameLoop(playing, (frameDuration) => {
    elapsedDuration.current += frameDuration;
    if (elapsedDuration.current >= PHOTO_DWELL_DURATION) {
      showPhoto(photoIndex + 1);
      return;
    }

    showProgress(
      rootRef.current,
      elapsedDuration.current / PHOTO_DWELL_DURATION,
    );
  });

  const { caption, href } = photos[photoIndex];
  const PlaybackIcon = paused ? Play : Pause;

  return (
    <figure ref={rootRef} className={twMerge("flex flex-col gap-4", className)}>
      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-base-300">
        {photos.map(({ src, alt }, i) => (
          <Image
            key={src}
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 640px) 576px, 100vw"
            aria-hidden={i !== photoIndex || undefined}
            className={twMerge(
              "object-cover transition-opacity duration-500 motion-reduce:transition-none",
              i !== photoIndex && "opacity-0",
            )}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <ControlButton
          label="Previous photo"
          onClick={() => showPhoto(photoIndex - 1)}
        >
          <ChevronLeft aria-hidden className="size-4" />
        </ControlButton>
        <ProgressSegments
          labels={photos.map((_, i) => `Photo ${i + 1} of ${photos.length}`)}
          currentIndex={photoIndex}
          className="flex-1"
          onSelect={showPhoto}
        />
        <ControlButton
          label="Next photo"
          onClick={() => showPhoto(photoIndex + 1)}
        >
          <ChevronRight aria-hidden className="size-4" />
        </ControlButton>
        <ControlButton
          label={paused ? "Resume carousel" : "Pause carousel"}
          onClick={() => setPaused(!paused)}
        >
          <PlaybackIcon aria-hidden className="size-3.5 fill-current" />
        </ControlButton>
      </div>

      <Caption>
        <ExternalLink kind="underline" href={href}>
          {caption}
        </ExternalLink>
      </Caption>
    </figure>
  );
};
