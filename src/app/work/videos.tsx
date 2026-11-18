"use client";

import { Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import useEveryAnimationFrame from "@/hooks/useEveryAnimationFrame";
import {
  ControlButton,
  FloatingExpandButton,
  FloatingPlaybackButton,
  ProgressTrack,
} from "./controls";
import {
  getProgressFraction,
  showProgress,
  useConditionalPlayback,
  usePlaybackState,
} from "./playback";

/**
 * The classes shared by every `mockup-window` in which videos are framed.
 */
export const WINDOW_CLASS_NAMES =
  "mockup-window border border-base-content/10 bg-base-200 shadow-lg";

export type ExpandedVideoProps = {
  /**
   * The path (in `public/`) to the video
   * file played by this {@link ExpandedVideo}.
   */
  src: string;

  /**
   * A short name for the video in this
   * {@link ExpandedVideo}. Only exposed to ATs.
   */
  label: string;

  /**
   * The time, in seconds, from which the video
   * in this {@link ExpandedVideo} starts.
   */
  initialTime: number;

  /**
   * `true` if the video in this {@link ExpandedVideo}
   * should start out paused, `false` otherwise.
   */
  initiallyPaused: boolean;

  /**
   * The callback to be invoked once this {@link ExpandedVideo} has closed.
   */
  onClose: () => void;
};

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
export const ExpandedVideo = ({
  src,
  label,
  initialTime,
  initiallyPaused,
  onClose,
}: ExpandedVideoProps) => {
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

  useConditionalPlayback(videoRef, playing);

  // Runs even while the video stands still so that seeking is depicted too
  useEveryAnimationFrame(true, () => {
    const progressFraction = getProgressFraction(videoRef.current);

    // Wait until the scrubber exists and the video has loaded
    if (!scrubberRef.current || progressFraction === null) return;

    showProgress(dialogRef.current, progressFraction);
    scrubberRef.current.value = `${progressFraction * 100}`;
  });

  const close = () => dialogRef.current?.close();

  const scrubTo = (progressPercent: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return; // wait until the video has loaded
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
          <ControlButton
            label={paused ? "Play video" : "Pause video"}
            onClick={() => setPaused(!paused)}
          >
            <PlaybackIcon aria-hidden className="size-3.5 fill-current" />
          </ControlButton>

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
  const { paused, playing, setPaused } = usePlaybackState(
    rootRef,
    expansionTime !== null,
  );

  useConditionalPlayback(videoRef, playing);

  useEveryAnimationFrame(playing, () => {
    const progressFraction = getProgressFraction(videoRef.current);
    if (progressFraction === null) return; // wait until the video has loaded
    showProgress(rootRef.current, progressFraction);
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
          <FloatingPlaybackButton paused={paused} />
        </button>
        <FloatingExpandButton
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
