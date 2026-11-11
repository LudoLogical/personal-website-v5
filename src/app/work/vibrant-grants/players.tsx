"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { twMerge } from "tailwind-merge";
import ExternalLink from "@/components/ExternalLink";
import type { Demo, ProjectPhoto } from "./types";

/**
 * The media query that matches iff the user `prefers-reduced-motion`.
 */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * The longest duration, in milliseconds, that `useFrameLoop()` reports for
 * a single frame. Exists to prevent a {@link PhotoCarousel} from skipping
 * ahead when frames resume after a long gap (e.g., a switch between tabs).
 */
const MAX_FRAME_DURATION = 100;

/**
 * The duration, in milliseconds, for which a {@link PhotoCarousel}
 * shows each of its photos before moving on to the next one.
 */
const PHOTO_DWELL_DURATION = 5000;

/**
 * The classes shared by the window frames in which
 * {@link LoopingVideo} and {@link VideoCarousel} place their videos.
 */
const WINDOW_CLASS_NAMES =
  "mockup-window border border-base-content/10 bg-base-200 shadow-lg";

/**
 * Registers the specified callback as a listener for changes
 * to whether {@link REDUCED_MOTION_QUERY} matches.
 * @param onChange the callback to be invoked on each change
 * @returns a function that removes the listener
 */
const subscribeToReducedMotion = (onChange: () => void): (() => void) => {
  const mediaQueryList = matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", onChange);
  return () => mediaQueryList.removeEventListener("change", onChange);
};

/**
 * Tracks whether the user `prefers-reduced-motion`.
 * Updates whenever that preference changes.
 * @returns `true` if the user `prefers-reduced-motion`, `false` otherwise
 *          (and during server rendering)
 */
const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(
    subscribeToReducedMotion,
    () => matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );

/**
 * Tracks whether a meaningful portion of the `Element` assigned to the
 * specified `ref` is visible in the viewport. Updates whenever that
 * `Element` scrolls (or is otherwise brought) into or out of view.
 * @param ref a `RefObject` for the `Element` to be observed
 * @returns `true` if the `Element` is in view, `false` otherwise
 */
const useInView = (ref: RefObject<Element | null>): boolean => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect(); // destroy `observer` on cleanup
  }, [ref]);

  return inView;
};

/**
 * The state of a player's playback, as tracked by `usePlayback()`.
 */
type Playback = {
  /**
   * `true` if the player is paused (whether by the user or because
   * the user `prefers-reduced-motion`), `false` otherwise.
   */
  paused: boolean;

  /**
   * `true` if the player should currently be advancing
   * (i.e., iff it is in view and not `paused`), `false` otherwise.
   */
  playing: boolean;

  /**
   * Pauses or resumes the player on behalf of the user.
   */
  setPaused: (paused: boolean) => void;
};

/**
 * Tracks whether the player whose root `Element` is assigned to the
 * specified `ref` is paused and whether it should currently be advancing.
 * A player starts out paused iff the user `prefers-reduced-motion`
 * and only ever advances while it is in view.
 * @param ref a `RefObject` for the root `Element` of the player
 * @returns the state of the player's playback
 */
const usePlayback = (ref: RefObject<Element | null>): Playback => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const inView = useInView(ref);

  // `null` until the user pauses or resumes the player themselves
  const [pausedByUser, setPausedByUser] = useState<boolean | null>(null);
  const paused = pausedByUser ?? prefersReducedMotion;

  return { paused, playing: inView && !paused, setPaused: setPausedByUser };
};

/**
 * While enabled, invokes the specified callback once per animation frame.
 * @param enabled `true` if `useFrameLoop()` should currently
 *                be requesting frames, `false` otherwise
 * @param onFrame the callback to be invoked on each frame; receives the
 *                duration, in milliseconds, of the frame that just ended
 *                (which never exceeds {@link MAX_FRAME_DURATION})
 */
const useFrameLoop = (
  enabled: boolean,
  onFrame: (frameDuration: number) => void,
) => {
  const onTick = useEffectEvent(onFrame);

  useEffect(() => {
    if (!enabled) return;

    let previousTime = performance.now();
    let pendingFrameRequestID = 0;

    const handleFrame = (time: number) => {
      // The first frame's timestamp can slightly precede `previousTime`
      const frameDuration = Math.max(time - previousTime, 0);
      previousTime = time;
      onTick(Math.min(frameDuration, MAX_FRAME_DURATION));
      pendingFrameRequestID = requestAnimationFrame(handleFrame);
    };

    pendingFrameRequestID = requestAnimationFrame(handleFrame);
    return () => cancelAnimationFrame(pendingFrameRequestID);
  }, [enabled]);
};

/**
 * Exposes the specified `fraction` as the CSS variable `--playback-progress`
 * on the specified root element of a player so that its {@link ProgressTrack}
 * can depict it without re-rendering the player on every frame.
 * @param root the root element of the player, if it is mounted
 * @param fraction the fraction, in [0, 1], of the current
 *                 video or photo's duration that has elapsed
 */
const showProgress = (root: HTMLElement | null, fraction: number) =>
  root?.style.setProperty("--playback-progress", `${fraction}`);

/**
 * Plays the specified video, ignoring the rejection that results
 * from playback being interrupted (e.g., by a pause) before it starts.
 * @param video the video to be played
 */
const play = (video: HTMLVideoElement) => void video.play().catch(() => {});

/**
 * Renders a thin horizontal track which, while `active`, is filled from the
 * left according to the `--playback-progress` of the player that contains it.
 */
const ProgressTrack = ({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) => (
  <span
    aria-hidden
    className={twMerge(
      "block h-1 overflow-hidden rounded-full bg-base-content/15",
      className,
    )}
  >
    {active && (
      <span className="block size-full origin-left scale-x-[var(--playback-progress,0)] bg-primary" />
    )}
  </span>
);

/**
 * Renders a badge in the bottom right corner of a player's media that shows
 * a play icon for as long as the player is `paused` and a pause icon only
 * while the `group/player` that contains it is hovered or focused.
 */
const PlaybackBadge = ({ paused }: { paused: boolean }) => {
  const Icon = paused ? Play : Pause;
  return (
    <span
      aria-hidden
      className={twMerge(
        "absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-neutral/85 text-neutral-content shadow-md transition-opacity duration-200 motion-reduce:transition-none",
        !paused &&
          "opacity-0 group-hover/player:opacity-100 group-focus-visible/player:opacity-100",
      )}
    >
      <Icon className="size-4 fill-current" />
    </span>
  );
};

export type LoopingVideoProps = {
  /**
   * The path (in `public/`) to the video
   * file played by this {@link LoopingVideo}.
   */
  src: string;

  /**
   * A short name for the video in this
   * {@link LoopingVideo}. Only exposed to ATs.
   */
  label: string;
};

/**
 * Renders the specified video in a window frame. The video plays
 * automatically (and silently) while it is in view, restarts from the
 * beginning each time it ends, and can be paused or resumed by clicking on
 * it. A bar beneath the video depicts how much of it has played.
 *
 * Paused by default if the user `prefers-reduced-motion`.
 */
export const LoopingVideo = ({ src, label }: LoopingVideoProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { paused, playing, setPaused } = usePlayback(rootRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playing) return;

    play(video);
    return () => video.pause();
  }, [playing]);

  useFrameLoop(playing, () => {
    const video = videoRef.current;

    // Wait until the video's duration is known
    if (!video || !video.duration) return;

    showProgress(rootRef.current, video.currentTime / video.duration);
  });

  return (
    <div ref={rootRef} className={WINDOW_CLASS_NAMES}>
      <button
        type="button"
        aria-label={`${paused ? "Play" : "Pause"} video: ${label}`}
        className="group/player relative block w-full cursor-pointer"
        onClick={() => setPaused(!paused)}
      >
        <video
          ref={videoRef}
          src={src}
          width={1920}
          height={1200}
          muted
          loop
          playsInline
          preload="metadata"
          className="block h-auto w-full"
        />
        <PlaybackBadge paused={paused} />
      </button>
      <ProgressTrack active className="rounded-none" />
    </div>
  );
};

export type VideoCarouselProps = {
  /**
   * The {@link Demo}s through which this {@link VideoCarousel} cycles,
   * in the order in which they are to be played.
   */
  demos: Demo[];
};

/**
 * Renders the specified {@link Demo}s as a carousel that shows one video
 * at a time in a window frame above a numbered list of every caption.
 *
 * Each video plays automatically (and silently) from its beginning while it
 * is in view, and the carousel moves on to the next video (or back to the
 * first one) when the current one ends. Selecting a caption switches to its
 * video, and clicking on the current video pauses or resumes it. A paused
 * video never ends, so the carousel only moves on from one if the user
 * selects a caption (which also resumes playback). A bar above the current
 * video's caption depicts how much of that video has played.
 *
 * Paused by default if the user `prefers-reduced-motion`.
 */
export const VideoCarousel = ({ demos }: VideoCarouselProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const { paused, playing, setPaused } = usePlayback(rootRef);
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

  return (
    <div ref={rootRef} className="flex flex-col gap-6">
      <div className={WINDOW_CLASS_NAMES}>
        <button
          type="button"
          aria-label={`${paused ? "Play" : "Pause"} video: ${demos[demoIndex].caption}`}
          className="group/player relative block aspect-16/10 w-full cursor-pointer"
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
      </div>

      <ol className="grid gap-x-8 gap-y-5 xs:grid-cols-2 md:grid-cols-3">
        {demos.map(({ src, caption }, i) => {
          const isCurrent = i === demoIndex;
          return (
            <li key={src}>
              <button
                type="button"
                aria-current={isCurrent || undefined}
                className={twMerge(
                  "flex w-full cursor-pointer flex-col gap-2.5 text-left transition-colors motion-reduce:transition-none",
                  isCurrent
                    ? "text-base-content"
                    : "text-base-content/55 hover:text-base-content/85",
                )}
                onClick={() => {
                  showDemo(i);
                  setPaused(false);
                }}
              >
                <ProgressTrack active={isCurrent} />
                <span className="flex gap-3">
                  <span
                    aria-hidden
                    className={twMerge(
                      "text-sm leading-6 font-bold tabular-nums",
                      isCurrent && "text-primary",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-6 font-semibold">{caption}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
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

  const { paused, playing, setPaused } = usePlayback(rootRef);
  const [photoIndex, setPhotoIndex] = useState(0);

  // The duration, in milliseconds, for which the current photo has been shown
  const elapsedDuration = useRef(0);

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
        <button
          type="button"
          aria-label="Previous photo"
          className="btn btn-circle btn-soft btn-sm"
          onClick={() => showPhoto(photoIndex - 1)}
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <ol className="flex flex-1 gap-1.5">
          {photos.map(({ src }, i) => (
            <li key={src} className="flex-1">
              {/* Padded so that the tap target is taller than the track */}
              <button
                type="button"
                aria-label={`Photo ${i + 1} of ${photos.length}`}
                aria-current={i === photoIndex || undefined}
                className="block w-full cursor-pointer py-3"
                onClick={() => showPhoto(i)}
              >
                <ProgressTrack active={i === photoIndex} />
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          aria-label="Next photo"
          className="btn btn-circle btn-soft btn-sm"
          onClick={() => showPhoto(photoIndex + 1)}
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          aria-label={paused ? "Resume carousel" : "Pause carousel"}
          className="btn btn-circle btn-soft btn-sm"
          onClick={() => setPaused(!paused)}
        >
          <PlaybackIcon aria-hidden className="size-3.5 fill-current" />
        </button>
      </div>

      <figcaption className="text-sm text-base-content/60">
        <ExternalLink kind="underline" href={href}>
          {caption}
        </ExternalLink>
      </figcaption>
    </figure>
  );
};
