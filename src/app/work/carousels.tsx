"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import ExternalLink from "@/components/ExternalLink";
import useEveryAnimationFrame from "@/hooks/useEveryAnimationFrame";
import { Caption } from "./atoms";
import {
  ControlButton,
  FloatingExpandButton,
  FloatingPlaybackButton,
  ProgressTracks,
} from "./controls";
import {
  getProgressFraction,
  play,
  showProgress,
  usePlaybackState,
} from "./playback";
import type { Demo, LinkCaptionedPicture } from "./types";
import { ExpandedVideo, WINDOW_CLASS_NAMES } from "./videos";

/**
 * The duration, in milliseconds, for which a {@link PhotoCarousel}
 * shows each of its photos before moving on to the next one.
 */
const PHOTO_PLAYBACK_DURATION = 5000;

/**
 * Renders the specified `caption` and `segments` in a bar at the bottom
 * of a {@link VideoCarousel}. On wide viewports, the `caption` sits to
 * the left of the `segments`; on narrow ones, it sits beneath them.
 */
const StatusBar = ({
  caption,
  segments,
}: {
  caption: ReactNode;
  segments: ReactNode;
}) => (
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
 * Renders the specified {@link Demo}s in a carousel that shows one video at
 * a time in a `mockup-window`. The caption of the current video and a row of
 * line segments each represent and track the progress of one of the videos
 * are also displayed at the bottom of the `mockup-window`.
 *
 * The current video plays automatically whenever it is in view and can be
 * paused or resumed by clicking on it. The carousel moves on to the next video
 * (or back to the first one) when the current one ends. Clicking (or tapping)
 * on a line segment makes the corresponding video the current one (and resumes
 * playback if it was paused). The line segment corresponding to the current
 * video fills to show how much of that video has played. Playback is paused
 * by default if the user `prefers-reduced-motion`.
 *
 * Hovering over the current video reveals a button in its top-right corner
 * that, when clicked, opens an {@link ExpandedVideo} version of the current
 * video that pauses its progenitor until it is closed and immeditely begins
 * playback where the original left off.
 */
export const VideoCarousel = ({ demos }: VideoCarouselProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // `null` iff the `ExpandedVideo` is not visible
  const [timeWhenExpanded, setTimeWhenExpanded] = useState<number | null>(null);
  const { paused, playing, setPaused } = usePlaybackState(
    rootRef,
    timeWhenExpanded !== null,
  );
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);

  useEffect(() => {
    const video = videoRefs.current[currentDemoIndex];
    if (!video || !playing) return;

    play(video);
    return () => video.pause();
  }, [currentDemoIndex, playing]);

  useEveryAnimationFrame(playing, () => {
    const progressFraction = getProgressFraction(
      videoRefs.current[currentDemoIndex],
    );
    if (progressFraction === null) return; // wait until the video has loaded
    showProgress(rootRef.current, progressFraction);
  });

  const showDemo = (nextDemoIndex: number) => {
    // The rewind happens here (and not in the effect) so that
    // it applies even when `nextDemoIndex === currentDemoIndex`
    const video = videoRefs.current[nextDemoIndex];
    if (video) video.currentTime = 0;
    showProgress(rootRef.current, 0);
    setCurrentDemoIndex(nextDemoIndex);
  };

  const { src: currentSrc, caption: currentCaption } = demos[currentDemoIndex];

  return (
    // The `StatusBar` (and, by extension, the entire `mockup-window`) shrinks
    // to fit the height of the `currentCaption`, which would ordinarily affect
    // the height of the entire page. To prevent this from happening, the real
    // `mockup-window` is stacked on top of an invisible copy that always fits
    // the longest caption in `demos`.
    <div className="grid">
      {/* Real `mockup-window` (see earlier comment) */}
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
                  i === currentDemoIndex ||
                  i === (currentDemoIndex + 1) % demos.length
                    ? "auto"
                    : "none"
                }
                className={twMerge(
                  "absolute inset-0 size-full transition-opacity duration-300 motion-reduce:transition-none",
                  i !== currentDemoIndex && "opacity-0",
                )}
                onEnded={() => showDemo((i + 1) % demos.length)}
              />
            ))}
            <FloatingPlaybackButton paused={paused} />
          </button>
          <FloatingExpandButton
            label={`Expand video: ${currentCaption}`}
            paused={paused}
            onClick={() =>
              setTimeWhenExpanded(
                videoRefs.current[currentDemoIndex]?.currentTime ?? 0,
              )
            }
          />
        </div>
        <StatusBar
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
            <ProgressTracks
              labels={demos.map(
                ({ caption }, i) =>
                  `Video ${i + 1} of ${demos.length}: ${caption}`,
              )}
              currentIndex={currentDemoIndex}
              className="lg:w-60"
              onSelect={(nextDemoIndex) => {
                showDemo(nextDemoIndex);
                setPaused(false);
              }}
            />
          }
        />

        {timeWhenExpanded !== null && (
          <ExpandedVideo
            src={currentSrc}
            label={currentCaption}
            initialTime={timeWhenExpanded}
            initiallyPaused={paused}
            onClose={() => setTimeWhenExpanded(null)}
          />
        )}
      </div>

      {/* Dummy `mockup-window` (see earlier comment) */}
      <div
        aria-hidden
        className={twMerge(WINDOW_CLASS_NAMES, "invisible [grid-area:1/1]")}
      >
        <div className="aspect-16/10" />
        <StatusBar
          caption={demos.map(({ src, caption }) => (
            // `[grid-area:1/1]` makes the container
            // `<div>` as tall as the longest caption
            <p key={src} className="[grid-area:1/1] text-box-trim">
              {caption}
            </p>
          ))}
          // `h-7` matches the height of a real `ProgressTracks`
          segments={<div className="h-7" />}
        />
      </div>
    </div>
  );
};

export type PhotoCarouselProps = {
  /**
   * The {@link LinkCaptionedPicture}s through which this {@link PhotoCarousel}
   * cycles, in the order in which they are to be shown.
   */
  photos: LinkCaptionedPicture[];

  /**
   * Classes for the container `<figure>` of this {@link PhotoCarousel}.
   */
  className?: string;
};

/**
 * Renders the specified {@link LinkCaptionedPicture}s in a carousel that
 * shows one photo at a time above its caption and a row of controls.
 *
 * While it is in view, the carousel shows each photo for the same fixed
 * duration before moving on to the next one (or back to the first one).
 * The controls let the user switch photos at will and pause or resume the
 * carousel. They include a row of line segments that each represent one of
 * the photos; the one that corresponds to the current photo fills to show
 * how much of the fixed display duration has elapsed.
 *
 * The carousel is paused by default if the user `prefers-reduced-motion`.
 */
export const PhotoCarousel = ({ photos, className }: PhotoCarouselProps) => {
  const rootRef = useRef<HTMLElement>(null);

  // The duration, in milliseconds, for which the current photo has been shown
  const elapsedDuration = useRef(0);

  const { paused, playing, setPaused } = usePlaybackState(rootRef);
  const [photoIndex, setPhotoIndex] = useState(0);

  const showPhoto = (nextPhotoIndex: number) => {
    elapsedDuration.current = 0;
    showProgress(rootRef.current, 0);
    // Adding `photos.length` accounts for the case where `nextPhotoIndex` is -1
    setPhotoIndex((nextPhotoIndex + photos.length) % photos.length);
  };

  useEveryAnimationFrame(playing, (frameDuration) => {
    elapsedDuration.current += frameDuration;
    if (elapsedDuration.current >= PHOTO_PLAYBACK_DURATION) {
      showPhoto(photoIndex + 1);
      return;
    }

    showProgress(
      rootRef.current,
      elapsedDuration.current / PHOTO_PLAYBACK_DURATION,
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
        <ProgressTracks
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
