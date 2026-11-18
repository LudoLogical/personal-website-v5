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
   * The path (in `public/`) to the video file for this {@link ExpandedVideo}.
   */
  src: string;

  /**
   * A short description of this {@link ExpandedVideo}. Only exposed to ATs.
   */
  label: string;

  /**
   * The time, in seconds, from which the video in
   * this {@link ExpandedVideo} should begin playback.
   */
  initialTime: number;

  /**
   * `true` if the video in this {@link ExpandedVideo}
   * should start out paused, `false` otherwise.
   */
  initiallyPaused: boolean;

  /**
   * The callback to be invoked when this {@link ExpandedVideo} is closed.
   */
  onClose: () => void;
};

/**
 * Renders the specified video in a modal dialog that fills most of the width
 * of the viewport and darkens everything beneath it. Playback begins from the
 * specified `initialTime`, loops when the video ends, and can be paused or
 * resumed by clicking on either the video itself or a dedicated button.
 * The modal dialog also features a scrubber that both depicts the progress
 * of the playback and lets the user seek through the video.
 *
 * The dialog closes (and invokes the specified `onClose` callback) when
 * the user clicks (or taps) on its "X" button, presses Escape, or clicks
 * (or taps) anywhere outside of its frame.
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

    // Guarded b/c this effect gets run twice when in strict mode
    if (!dialog.open) dialog.showModal();
  }, [initialTime]);

  useConditionalPlayback(videoRef, playing);

  // Runs even while `!playing` to support visual feedback when seeking
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
      {/* The `mockup-window` is as wide as the `--expanded-video-margins`
          (which are sized based on the viewport's smaller dimension) allow,
          capped to prevent the sum of its height and those margins from
          exceeding the height of the viewport */}
      {/* Math: the videos are 1920/1200 = 1.6 times as wide as they are tall,
          and the rest of the frame adds 3rem (title bar) + 3rem (control bar)
          + 0.125rem (border) = 6.125rem to its height */}
      <div
        className={twMerge(
          WINDOW_CLASS_NAMES,
          "w-[min(100%-var(--expanded-video-margins),(100dvh-var(--expanded-video-margins)-6.125rem)*1.6)] [--expanded-video-margins:clamp(1rem,5vmin,4rem)] [grid-area:1/1]",
        )}
      >
        {/* Positioned such that it appears vertically
            centered in the title bar of the `mockup-window` */}
        <button
          type="button"
          aria-label="Close expanded video"
          className="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm hover:border-transparent hover:bg-base-content/20"
          onClick={close}
        >
          <X aria-hidden className="size-4" />
        </button>

        {/* Not wrapped in a `<button>` like the other players are
            b/c the `ControlButton` below already makes the playback
            toggle functionality accessible */}
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

        <div className="flex items-center gap-4 py-2 pr-4 pl-4">
          <ControlButton
            label={paused ? "Play video" : "Pause video"}
            onClick={() => setPaused(!paused)}
          >
            <PlaybackIcon aria-hidden className="size-3.5 fill-current" />
          </ControlButton>

          <div className="group/scrubber relative flex h-8 flex-1 items-center">
            <ProgressTrack
              active
              className="w-full transition-colors group-hover/scrubber:bg-base-content/30 motion-reduce:transition-none"
            />
            <span
              aria-hidden
              className="absolute left-[calc(var(--playback-progress,0)*100%)] size-3 -translate-x-1/2 rounded-full bg-primary shadow-md group-has-focus-visible/scrubber:outline-2 group-has-focus-visible/scrubber:outline-offset-2 group-has-focus-visible/scrubber:outline-primary"
            />
            {/* Invisibly handles all of the scrubber's interactions;
                overhangs the `<ProgressTrack>` by half the width of a
                typical native thumb (i.e., drag handle) on each side to
                ensure that the custom thumb (above) can traverse the full
                width of the `<input>`'s track. */}
            <input
              ref={scrubberRef}
              type="range"
              min={0}
              max={100}
              // In Firefox, the arrow keys move the `value` by 1 when
              // `step` is "any", hence the range of [0, 100] above
              step="any"
              defaultValue={0}
              aria-label="Seek"
              // Overhangs the `<ProgressTrack>` by half the width of a
              // typical native thumb (i.e., drag handle) on each side to
              // ensure that the custom thumb (above) can traverse the full
              // width of the `<input>`'s track.
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
   * The path (in `public/`) to the video file for this {@link LoopingVideo}.
   */
  src: string;

  /**
   * A short description of this {@link LoopingVideo}. Only exposed to ATs.
   */
  label: string;
};

/**
 * Renders the specified video in a `mockup-window`. The video plays
 * automatically whenever it is in view and can be paused or resumed
 * by clicking on it. Playback loops when the video ends.
 * A bar beneath the video shows how much of it has played.
 * The video is paused by default if the user `prefers-reduced-motion`.
 *
 * Hovering over the video reveals a button in its top-right corner that,
 * when clicked, opens an {@link ExpandedVideo} version of the video that
 * pauses its progenitor until it is closed and immediately begins playback
 * where the original video left off.
 */
export const LoopingVideo = ({ src, label }: LoopingVideoProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // `null` iff the `ExpandedVideo` is not visible
  const [timeWhenExpanded, setTimeWhenExpanded] = useState<number | null>(null);
  const { paused, playing, setPaused } = usePlaybackState(
    rootRef,
    timeWhenExpanded !== null,
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
          onClick={() =>
            setTimeWhenExpanded(videoRef.current?.currentTime ?? 0)
          }
        />
      </div>
      <ProgressTrack active className="rounded-none" />

      {timeWhenExpanded !== null && (
        <ExpandedVideo
          src={src}
          label={label}
          initialTime={timeWhenExpanded}
          initiallyPaused={paused}
          onClose={() => setTimeWhenExpanded(null)}
        />
      )}
    </div>
  );
};
