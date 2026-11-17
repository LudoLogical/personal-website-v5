import { useState, type RefObject } from "react";
import useInView from "@/hooks/useInView";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import type { ProgressTrack } from "./controls";

/**
 * The player state tracked and returned by {@link usePlayback}.
 */
type Playback = {
  /**
   * `true` if the player is paused, `false` otherwise.
   */
  paused: boolean;

  /**
   * `true` if the player should currently be playing (i.e., iff
   * it is in view, not `paused`, and not `suspended`), `false` otherwise.
   */
  playing: boolean;

  /**
   * Pauses or resumes the player.
   */
  setPaused: (paused: boolean) => void;
};

/**
 * Tracks whether the player whose root `Element` is assigned to the
 * specified `ref` is paused and whether it should currently be playing.
 * A player starts out paused iff the user `prefers-reduced-motion`
 * and only ever advances while it is in view.
 * @param ref a `RefObject` for the root `Element` of the player
 * @param suspended `true` if the player's playback must be interrupted
 *                  (e.g., because it is covered by a dialog that plays
 *                  the same video), `false` otherwise (and by default)
 * @returns the {@link Playback} state of the player
 */
export const usePlayback = (
  ref: RefObject<Element | null>,
  suspended = false,
): Playback => {
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
 * Exposes the specified `fraction` as the CSS variable `--playback-progress`
 * on the specified player root element so that a child {@link ProgressTrack}
 * can depict it without having to re-render the player on every frame.
 * @param root the root element of the player (or `null` if it isn't mounted)
 * @param fraction the fraction, in [0, 1], of the current
 *                 playback duration that has elapsed
 */
export const showProgress = (root: HTMLElement | null, fraction: number) =>
  root?.style.setProperty("--playback-progress", `${fraction}`);

/**
 * Plays the specified video.
 * @param video the video to be played
 */
export const play = (video: HTMLVideoElement) =>
  // If playback is interrupted (e.g., by a pause)
  // before it starts, simply ignore the rejection
  void video.play().catch(() => {});
