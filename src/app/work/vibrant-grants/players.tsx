"use client";

import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { twMerge } from "tailwind-merge";
import ExternalLink from "@/components/ExternalLink";
import { Caption } from "./atoms";
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
 * The classes shared by the round badges that {@link PlaybackBadge}
 * and {@link ExpandButton} place in the corners of a player's media.
 */
const BADGE_CLASS_NAMES =
  "absolute grid size-10 place-items-center rounded-full bg-neutral/85 text-neutral-content shadow-md transition-opacity duration-200 motion-reduce:transition-none";

/**
 * The classes shared by the round buttons that sit beside the
 * scrubber of an {@link ExpandedVideo} and the progress segments
 * of a {@link PhotoCarousel}.
 */
const CONTROL_CLASS_NAMES =
  "btn btn-circle bg-base-content/10 btn-ghost btn-sm hover:border-transparent hover:bg-base-content/20";

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
   * `true` if the player should currently be advancing (i.e., iff
   * it is in view, not `paused`, and not suspended), `false` otherwise.
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
 * @param suspended `true` if the player must not advance even if it is in
 *                  view and not paused (e.g., b/c it is covered by its own
 *                  {@link ExpandedVideo}), `false` otherwise (and by default)
 * @returns the state of the player's playback
 */
const usePlayback = (
  ref: RefObject<Element | null>,
  suspended = false,
): Playback => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const inView = useInView(ref);

  // `null` until the user pauses or resumes the player themselves
  const [pausedByUser, setPausedByUser] = useState<boolean | null>(null);
  const paused = pausedByUser ?? prefersReducedMotion;

  return {
    paused,
    playing: inView && !paused && !suspended,
    setPaused: setPausedByUser,
  };
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
      <span className="block size-full origin-left scale-x-(--playback-progress,0) bg-primary" />
    )}
  </span>
);

/**
 * Renders a row of buttons, one per item in a carousel, each of which
 * selects its item and contains a {@link ProgressTrack} that fills while
 * said item is current.
 */
const ProgressSegments = ({
  labels,
  currentIndex,
  className,
  onSelect,
}: {
  labels: string[];
  currentIndex: number;
  className?: string;
  onSelect: (index: number) => void;
}) => (
  <ol className={twMerge("flex gap-1.5", className)}>
    {labels.map((label, i) => (
      <li key={label} className="flex-1">
        {/* Padded so that the tap target is taller than the track */}
        <button
          type="button"
          aria-label={label}
          aria-current={i === currentIndex || undefined}
          className="group/segment block w-full cursor-pointer py-3"
          onClick={() => onSelect(i)}
        >
          <ProgressTrack
            active={i === currentIndex}
            className="transition-colors group-hover/segment:bg-base-content/30 motion-reduce:transition-none"
          />
        </button>
      </li>
    ))}
  </ol>
);

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

/**
 * Renders a badge in the bottom right corner of a player's media that shows
 * a play icon for as long as the player is `paused` and a pause icon only
 * while the `group/player` that contains it is hovered or contains focus.
 */
const PlaybackBadge = ({ paused }: { paused: boolean }) => {
  const Icon = paused ? Play : Pause;
  return (
    <span
      aria-hidden
      className={twMerge(
        BADGE_CLASS_NAMES,
        "right-3 bottom-3",
        !paused &&
          "opacity-0 group-hover/player:opacity-100 group-has-focus-visible/player:opacity-100",
      )}
    >
      <Icon className="size-4 fill-current" />
    </span>
  );
};

/**
 * Renders a button in the top right corner of a player's media that resembles
 * a {@link PlaybackBadge} and is likewise visible only while the player is
 * `paused` or the `group/player` that contains it is hovered or contains
 * focus. On touch screens, which can't hover, it is always visible instead.
 */
const ExpandButton = ({
  label,
  paused,
  onClick,
}: {
  label: string;
  paused: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    className={twMerge(
      BADGE_CLASS_NAMES,
      "top-3 right-3 cursor-pointer",
      !paused &&
        "opacity-0 group-hover/player:opacity-100 group-has-focus-visible/player:opacity-100 pointer-coarse:opacity-100",
    )}
    onClick={onClick}
  >
    <Maximize2 aria-hidden className="size-4" />
  </button>
);

/**
 * Renders the specified video in a modal dialog whose window frame fills most
 * of the viewport and beneath which the rest of the page appears darkened.
 * The video starts (silently) from the specified `initialTime`, restarts from
 * the beginning each time it ends, and can be paused or resumed by clicking
 * on it or on the button below it. A scrubber beside said button depicts how
 * much of the video has played and lets the user seek through it, during
 * which the video stands still.
 *
 * The dialog closes, invoking `onClose`, when the user selects its close
 * button, presses Escape, or clicks or taps anywhere outside of its frame.
 */
const ExpandedVideo = ({
  src,
  label,
  initialTime,
  initiallyPaused,
  onClose,
}: {
  src: string;
  label: string;
  initialTime: number;
  initiallyPaused: boolean;
  onClose: () => void;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubberRef = useRef<HTMLInputElement>(null);

  const [paused, setPaused] = useState(initiallyPaused);
  const [scrubbing, setScrubbing] = useState(false);
  const playing = !paused && !scrubbing;

  useEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    if (!dialog || !video) return;

    video.currentTime = initialTime;

    // Already open when Strict Mode runs this effect a second time
    if (!dialog.open) dialog.showModal();
  }, [initialTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playing) return;

    play(video);
    return () => video.pause();
  }, [playing]);

  // Runs even while the video stands still so that seeking is depicted too
  useFrameLoop(true, () => {
    const video = videoRef.current;
    const scrubber = scrubberRef.current;

    // Wait until the video's duration is known
    if (!video || !scrubber || !video.duration) return;

    const progressFraction = video.currentTime / video.duration;
    showProgress(dialogRef.current, progressFraction);
    scrubber.value = `${progressFraction * 100}`;
  });

  const close = () => dialogRef.current?.close();

  const scrubTo = (progressPercent: number) => {
    const video = videoRef.current;

    // Wait until the video's duration is known
    if (!video || !video.duration) return;

    video.currentTime = (progressPercent / 100) * video.duration;
  };

  const PlaybackIcon = paused ? Play : Pause;

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Expanded video: ${label}`}
      className="modal motion-reduce:transition-none"
      onClose={onClose}
    >
      {/* As wide as the dialog's margins (whose combined size per axis grows
          w/ the viewport's shorter side) allow, unless that would make it
          too tall to fit between them: the video is 1.6 times as wide as
          it is tall, and the rest of the frame adds 6.125rem to its height */}
      <div
        className={twMerge(
          WINDOW_CLASS_NAMES,
          "w-[min(100%-var(--expanded-video-margins),(100dvh-var(--expanded-video-margins)-6.125rem)*1.6)] [--expanded-video-margins:clamp(1rem,5vmin,4rem)] [grid-area:1/1]",
        )}
      >
        {/* Centered vertically in the title bar of the window frame */}
        <button
          type="button"
          aria-label="Close expanded video"
          className="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm hover:border-transparent hover:bg-base-content/20"
          onClick={close}
        >
          <X aria-hidden className="size-4" />
        </button>

        {/* Not a `<button>` (unlike in the other players)
            b/c the controls below already hold one for ATs */}
        <video
          ref={videoRef}
          src={src}
          width={1920}
          height={1200}
          muted
          loop
          playsInline
          preload="auto"
          className="block h-auto w-full cursor-pointer"
          onClick={() => setPaused(!paused)}
        />

        {/* Controls */}
        <div className="flex items-center gap-4 py-2 pr-4 pl-4">
          <button
            type="button"
            aria-label={paused ? "Play video" : "Pause video"}
            className={CONTROL_CLASS_NAMES}
            onClick={() => setPaused(!paused)}
          >
            <PlaybackIcon aria-hidden className="size-3.5 fill-current" />
          </button>

          {/* Scrubber */}
          <div className="group/scrubber relative flex h-8 flex-1 items-center">
            <ProgressTrack
              active
              className="w-full transition-colors group-hover/scrubber:bg-base-content/30 motion-reduce:transition-none"
            />
            <span
              aria-hidden
              className="absolute left-[calc(var(--playback-progress,0)*100%)] size-3 -translate-x-1/2 rounded-full bg-primary shadow-md group-has-focus-visible/scrubber:outline-2 group-has-focus-visible/scrubber:outline-offset-2 group-has-focus-visible/scrubber:outline-primary"
            />
            {/* Invisible, but handles all of the scrubber's interactions.
                Overhangs the track by half the width of a native thumb on
                each side b/c that is how far said thumb's center stays from
                each end, which lets the dot above travel the entire track */}
            <input
              ref={scrubberRef}
              type="range"
              min={0}
              max={100}
              // Arrow keys move the value by 1 in Firefox when the
              // step is "any", hence the range of [0, 100] above
              step="any"
              defaultValue={0}
              aria-label="Seek"
              className="absolute -left-2 h-full w-[calc(100%+(--spacing(4)))] cursor-pointer opacity-0"
              onChange={(e) => scrubTo(e.target.valueAsNumber)}
              onPointerDown={(e) => {
                // Captured so that the release is reported
                // even if it happens away from the scrubber
                e.currentTarget.setPointerCapture(e.pointerId);
                setScrubbing(true);
              }}
              onLostPointerCapture={() => setScrubbing(false)}
            />
          </div>
        </div>
      </div>

      <div aria-hidden className="modal-backdrop" onClick={close} />
    </dialog>
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
 * A button in the top right corner of the video opens an
 * {@link ExpandedVideo} that picks up where the video left off.
 * The video itself stands still until said dialog is closed.
 *
 * Paused by default if the user `prefers-reduced-motion`.
 */
export const LoopingVideo = ({ src, label }: LoopingVideoProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // The time, in seconds, that the video had reached when
  // it was expanded (`null` unless it is currently expanded)
  const [expansionTime, setExpansionTime] = useState<number | null>(null);
  const { paused, playing, setPaused } = usePlayback(
    rootRef,
    expansionTime !== null,
  );

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
      <div className="group/player relative">
        <button
          type="button"
          aria-label={`${paused ? "Play" : "Pause"} video: ${label}`}
          className="block w-full cursor-pointer"
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
            disablePictureInPicture
            disableRemotePlayback
            preload="metadata"
            className="block h-auto w-full"
          />
          <PlaybackBadge paused={paused} />
        </button>
        <ExpandButton
          label={`Expand video: ${label}`}
          paused={paused}
          onClick={() => setExpansionTime(videoRef.current?.currentTime ?? 0)}
        />
      </div>
      <ProgressTrack active className="rounded-none" />

      {expansionTime !== null && (
        <ExpandedVideo
          src={src}
          label={label}
          initialTime={expansionTime}
          initiallyPaused={paused}
          onClose={() => setExpansionTime(null)}
        />
      )}
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
          className={CONTROL_CLASS_NAMES}
          onClick={() => showPhoto(photoIndex - 1)}
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <ProgressSegments
          labels={photos.map((_, i) => `Photo ${i + 1} of ${photos.length}`)}
          currentIndex={photoIndex}
          className="flex-1"
          onSelect={showPhoto}
        />
        <button
          type="button"
          aria-label="Next photo"
          className={CONTROL_CLASS_NAMES}
          onClick={() => showPhoto(photoIndex + 1)}
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          aria-label={paused ? "Resume carousel" : "Pause carousel"}
          className={CONTROL_CLASS_NAMES}
          onClick={() => setPaused(!paused)}
        >
          <PlaybackIcon aria-hidden className="size-3.5 fill-current" />
        </button>
      </div>

      <Caption>
        <ExternalLink kind="underline" href={href}>
          {caption}
        </ExternalLink>
      </Caption>
    </figure>
  );
};
