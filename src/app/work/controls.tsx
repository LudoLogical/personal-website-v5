import { Maximize2, Pause, Play } from "lucide-react";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export type ControlButtonProps = {
  /**
   * A short description of what this {@link ControlButton} does.
   * Only exposed to ATs.
   */
  label: string;

  /**
   * The callback to be invoked whenever the user
   * clicks (or taps) on this {@link ControlButton}.
   */
  onClick: () => void;

  /**
   * The icon in this {@link ControlButton}. Should be hidden from ATs.
   */
  children: ReactNode;
};

/**
 * Renders a small, round button containing the specified icon. Used to
 * affect media player behavior, but should never be overlaid on one.
 */
export const ControlButton = ({
  label,
  onClick,
  children,
}: ControlButtonProps) => (
  <button
    type="button"
    aria-label={label}
    className="btn btn-circle bg-base-content/10 btn-ghost btn-sm hover:border-transparent hover:bg-base-content/20"
    onClick={onClick}
  >
    {children}
  </button>
);

/**
 * The classes shared by the round buttons
 * that appear in the corners of a media player.
 */
const FLOATING_BUTTON_CLASS_NAMES =
  "absolute grid size-10 place-items-center rounded-full bg-neutral/85 text-neutral-content shadow-md transition-opacity duration-200 motion-reduce:transition-none";

export type FloatingPlaybackButtonProps = {
  /**
   * `true` if the media player that contains this
   * {@link FloatingPlaybackButton} is paused, `false` otherwise.
   */
  paused: boolean;
};

/**
 * Renders a button in the bottom-right corner of a media player that shows
 * a "play" icon whenever playback is `paused` and a "pause" icon whenever
 * playback is not `paused`. While playback is not `paused`, the button is
 * hidden unless its parent `group/player` is hovered or has focus.
 *
 * Note: This component is hidden from ATs, so its parent is
 * responsible for supplying an `aria-label` if one is necessary.
 */
export const FloatingPlaybackButton = ({
  paused,
}: FloatingPlaybackButtonProps) => {
  const Icon = paused ? Play : Pause;
  return (
    <span
      aria-hidden
      className={twMerge(
        FLOATING_BUTTON_CLASS_NAMES,
        "right-3 bottom-3",
        !paused &&
          "opacity-0 group-hover/player:opacity-100 group-has-focus-visible/player:opacity-100",
      )}
    >
      <Icon className="size-4 fill-current" />
    </span>
  );
};

export type FloatingExpandButtonProps = {
  /**
   * A short description of what this {@link FloatingExpandButton} does.
   * Only exposed to ATs.
   */
  label: string;

  /**
   * `true` if the media player that contains this
   * {@link FloatingExpandButton} is paused, `false` otherwise.
   */
  paused: boolean;

  /**
   * The callback to be invoked whenever the user
   * clicks (or taps) on this {@link FloatingExpandButton}.
   */
  onClick: () => void;
};

/**
 * Renders a button in the top-right corner of a media player that shows
 * a "maximize" icon. While playback is not `paused`, the button is hidden
 * unless its parent `group/player` is hovered or has focus.
 */
export const FloatingExpandButton = ({
  label,
  paused,
  onClick,
}: FloatingExpandButtonProps) => (
  <button
    type="button"
    aria-label={label}
    className={twMerge(
      FLOATING_BUTTON_CLASS_NAMES,
      "top-3 right-3 cursor-pointer",
      !paused &&
        "opacity-0 group-hover/player:opacity-100 group-has-focus-visible/player:opacity-100",
    )}
    onClick={onClick}
  >
    <Maximize2 aria-hidden className="size-4" />
  </button>
);

export type ProgressTrackProps = {
  /**
   * `true` if this {@link ProgressTrack} should depict the current value
   * of `--playback-progress`, `false` if it should be empty instead.
   */
  active: boolean;

  /**
   * Classes for the container `<span>` of this {@link ProgressTrack}.
   */
  className?: string;
};

/**
 * Renders a thin horizontal track which, while `active`, is filled from left
 * to right according to the `--playback-progress` of the media player that
 * contains it.
 *
 * Note: This component is hidden from ATs, so its parent is
 * responsible for supplying an `aria-label` if one is necessary.
 */
export const ProgressTrack = ({ active, className }: ProgressTrackProps) => (
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

export type ProgressTracksProps = {
  /**
   * The names of the items to which the {@link ProgressTrack}s in this
   * {@link ProgressTracks} correspond, in the order in which those items
   * are shown. Only exposed to ATs.
   */
  labels: string[];

  /**
   * The index (in `labels`) of the item that
   * corresponds to the active {@link ProgressTrack}.
   */
  currentIndex: number;

  /**
   * Classes for the container `<ol>` of this {@link ProgressTracks}.
   */
  className?: string;

  /**
   * The callback to be invoked whenever the user clicks (or taps) on one of the
   * {@link ProgressTrack}s in this {@link ProgressTracks}; receives the index
   * (in `labels`) of the item which corresponds to that {@link ProgressTrack}.
   */
  onSelect: (index: number) => void;
};

/**
 * Renders a row of selectable {@link ProgressTrack}s, each of which corresponds
 * to an item in a carousel and exactly one of which must be `active` at a time.
 */
export const ProgressTracks = ({
  labels,
  currentIndex,
  className,
  onSelect,
}: ProgressTracksProps) => (
  <ol className={twMerge("flex gap-1.5", className)}>
    {labels.map((label, i) => (
      <li key={label} className="flex-1">
        {/* Padded to enlarge the tap target */}
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
