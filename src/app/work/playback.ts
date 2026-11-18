import { useEffect, useState, type RefObject } from "react";
import useInView from "@/hooks/useInView";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import type { ProgressTrack } from "./controls";

/**
 * Plays the specified video.
 * @param video the video to be played
 */
export const play = (video: HTMLVideoElement) =>
  // If playback is interrupted (e.g., by a pause)
  // before it starts, simply ignore the rejection
  void video.play().catch(() => {});

/**
 * The media player state tracked and returned by {@link usePlaybackState}.
 */
type PlaybackState = {
  /**
   * `true` if the media player is paused, `false` otherwise.
   */
  paused: boolean;

  /**
   * `true` if the media player should currently be playing (i.e., iff
   * it is in view, not `paused`, and not `suspended`), `false` otherwise.
   */
  playing: boolean;

  /**
   * Pauses or resumes the player.
   */
  setPaused: (paused: boolean) => void;
};

/**
 * Tracks whether the media player whose root `Element` is assigned to the
 * specified `ref` is paused and whether it should currently be playing.
 * A media player starts out paused iff the user `prefers-reduced-motion`
 * and only ever advances while it is in view.
 * @param ref a `RefObject` for the root `Element` of the player
 * @param suspended `true` if the media player's playback must be interrupted
 *                  (e.g., because it is covered by a dialog that plays the
 *                  same video), `false` otherwise (and by default)
 * @returns the {@link PlaybackState} state of the media player
 */
export const usePlaybackState = (
  ref: RefObject<Element | null>,
  suspended = false,
): PlaybackState => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const inView = useInView(ref);

  // `null` until initialized by user action
  const [manuallyPaused, setManuallyPaused] = useState<boolean | null>(null);
  const paused = manuallyPaused ?? prefersReducedMotion;

  return {
    paused,
    playing: inView && !paused && !suspended,
    setPaused: setManuallyPaused,
  };
};

/**
 * While `playing`, plays the video whose element is assigned
 * to the specified `ref`, and pauses it whenever `playing` stops.
 * @param ref a `RefObject` for the video to be played
 * @param playing `true` if the video should currently
 *                be playing, `false` otherwise
 */
export const useConditionalPlayback = (
  ref: RefObject<HTMLVideoElement | null>,
  playing: boolean,
) => {
  useEffect(() => {
    const video = ref.current;
    if (!video || !playing) return;

    play(video);
    return () => video.pause();
  }, [ref, playing]);
};

/**
 * Computes the fraction of the specified video's duration that has elapsed.
 * @param video the video whose progress is to be computed
 *              (or `null` if it isn't mounted)
 * @returns the fraction, in [0, 1], of the video's duration that has
 *          elapsed, or `null` if the video isn't mounted or its
 *          duration isn't known yet
 */
export const getProgressFraction = (
  video: HTMLVideoElement | null,
): number | null =>
  // `duration` is `NaN` until the video's metadata has loaded
  video?.duration ? video.currentTime / video.duration : null;

/**
 * Exposes the specified `fraction` as the CSS variable
 * `--playback-progress` on the specified media player root element so that
 * a child {@link ProgressTrack} can depict it without having to re-render
 * the player on every frame.
 * @param root the root element of the media player
 *             (or `null` if it isn't mounted)
 * @param fraction the fraction, in [0, 1], of the current
 *                 playback duration that has elapsed
 */
export const showProgress = (root: HTMLElement | null, fraction: number) =>
  root?.style.setProperty("--playback-progress", `${fraction}`);
