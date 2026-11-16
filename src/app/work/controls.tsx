import { Maximize2, Pause, Play } from "lucide-react";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

/**
 * The classes shared by the round badges that {@link PlaybackBadge}
 * and {@link ExpandButton} place in the corners of a player's media.
 */
const BADGE_CLASS_NAMES =
  "absolute grid size-10 place-items-center rounded-full bg-neutral/85 text-neutral-content shadow-md transition-opacity duration-200 motion-reduce:transition-none";

export type ProgressTrackProps = {
  /**
   * `true` if this {@link ProgressTrack} should be filled according
   * to `--playback-progress`, `false` if it should stay empty.
   */
  active: boolean;

  /**
   * Classes for the container `<span>` of this {@link ProgressTrack}.
   */
  className?: string;
};

/**
 * Renders a thin horizontal track which, while `active`, is filled from the
 * left according to the `--playback-progress` of the player that contains it.
 *
 * Note: This component is hidden from ATs, so its parent is
 * responsible for supplying a label if one is necessary.
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

export type ProgressSegmentsProps = {
  /**
   * The names of the items in the carousel that this
   * {@link ProgressSegments} controls, in the order in which
   * said items are shown. Only exposed to ATs.
   */
  labels: string[];

  /**
   * The index, in `labels`, of the item that the carousel is showing.
   */
  currentIndex: number;

  /**
   * Classes for the container `<ol>` of this {@link ProgressSegments}.
   */
  className?: string;

  /**
   * The callback to be invoked whenever the user selects
   * an item; receives the index, in `labels`, of that item.
   */
  onSelect: (index: number) => void;
};

/**
 * Renders a row of buttons, one per item in a carousel, each of which
 * selects its item and contains a {@link ProgressTrack} that fills while
 * said item is current.
 */
export const ProgressSegments = ({
  labels,
  currentIndex,
  className,
  onSelect,
}: ProgressSegmentsProps) => (
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

export type PlaybackBadgeProps = {
  /**
   * `true` if the player that contains this
   * {@link PlaybackBadge} is paused, `false` otherwise.
   */
  paused: boolean;
};

/**
 * Renders a badge in the bottom right corner of a player's media that shows
 * a play icon for as long as the player is `paused` and a pause icon only
 * while the `group/player` that contains it is hovered or contains focus.
 *
 * Note: This component is hidden from ATs, so its parent is
 * responsible for supplying a label if one is necessary.
 */
export const PlaybackBadge = ({ paused }: PlaybackBadgeProps) => {
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

export type ExpandButtonProps = {
  /**
   * A short description of what this {@link ExpandButton}
   * expands. Only exposed to ATs.
   */
  label: string;

  /**
   * `true` if the player that contains this
   * {@link ExpandButton} is paused, `false` otherwise.
   */
  paused: boolean;

  /**
   * The callback to be invoked whenever
   * the user selects this {@link ExpandButton}.
   */
  onClick: () => void;
};

/**
 * Renders a button in the top right corner of a player's media that resembles
 * a {@link PlaybackBadge} and is likewise visible only while the player is
 * `paused` or the `group/player` that contains it is hovered or contains
 * focus. On touch screens, which can't hover, it is always visible instead.
 */
export const ExpandButton = ({ label, paused, onClick }: ExpandButtonProps) => (
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

export type ControlButtonProps = {
  /**
   * A short description of what this {@link ControlButton}
   * does. Only exposed to ATs.
   */
  label: string;

  /**
   * The callback to be invoked whenever
   * the user selects this {@link ControlButton}.
   */
  onClick: () => void;

  /**
   * The icon in this {@link ControlButton}, which must be hidden from ATs.
   */
  children: ReactNode;
};

/**
 * Renders a small round button that holds the specified icon, as found beside
 * the scrubber of an expanded video and the progress segments of a carousel.
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
