import { useState, type RefObject } from "react";
import useInView from "@/utils/useInView";
import usePrefersReducedMotion from "@/utils/usePrefersReducedMotion";
import type { ProgressTrack } from "./controls";

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
 * @param suspended `true` if the player must not advance even if it is
 *                  in view and not paused (e.g., because it is covered
 *                  by a dialog that plays the same video), `false`
 *                  otherwise (and by default)
 * @returns the state of the player's playback
 */
export const usePlayback = (
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
 * Exposes the specified `fraction` as the CSS variable `--playback-progress`
 * on the specified root element of a player so that its {@link ProgressTrack}
 * can depict it without re-rendering the player on every frame.
 * @param root the root element of the player, if it is mounted
 * @param fraction the fraction, in [0, 1], of the current
 *                 video or photo's duration that has elapsed
 */
export const showProgress = (root: HTMLElement | null, fraction: number) =>
  root?.style.setProperty("--playback-progress", `${fraction}`);

/**
 * Plays the specified video, ignoring the rejection that results
 * from playback being interrupted (e.g., by a pause) before it starts.
 * @param video the video to be played
 */
export const play = (video: HTMLVideoElement) =>
  void video.play().catch(() => {});
