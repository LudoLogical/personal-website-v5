import Expandable, { type ExpandableProps } from "@/components/Expandable";

export type LabeledExpandableProps = Omit<ExpandableProps, "labels"> & {
  /**
   * The number of `data-extra` items in this {@link LabeledExpandable}.
   */
  numExtras: number;

  /**
   * The noun for a single item in this {@link LabeledExpandable}.
   */
  singleItemName: string;

  /**
   * The plural form of the noun for a single
   * item in this {@link LabeledExpandable}.
   */
  pluralItemName: string;
};

/**
 * Renders an {@link Expandable} whose toggle button is automatically
 * labeled based on the number of `data-extra` items it contains.
 * (The toggle button is omitted if there are no extra items.)
 */
const LabeledExpandable = ({
  numExtras,
  singleItemName,
  pluralItemName,
  className,
  children,
}: LabeledExpandableProps) => {
  const resolvedItemName = numExtras === 1 ? singleItemName : pluralItemName;
  return (
    <Expandable
      labels={
        numExtras > 0
          ? {
              expand: `Show ${numExtras} more ${resolvedItemName}`,
              collapse: `Show fewer ${pluralItemName}`,
            }
          : undefined
      }
      className={className}
    >
      {children}
    </Expandable>
  );
};

export default LabeledExpandable;
