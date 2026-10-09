"use client";

import IcebergExplainerText, {
  type IcebergExplainerTextProps,
} from "@/components/IcebergExplainerText";
import { resolveResponsive, type Responsive } from "@/utils/breakpoints";
import { useBreakpoint } from "@/utils/useBreakpoint";

type Options = NonNullable<IcebergExplainerTextProps["options"]>;
type Appearance = NonNullable<Options["appearance"]>;

/**
 * The same as IcebergExplainerTextProps, except that the cardWidth
 * and cardHeight settings may vary by breakpoint.
 */
export type ResponsiveIcebergExplainerTextProps = Omit<
  IcebergExplainerTextProps,
  "options"
> & {
  options?: Omit<Options, "appearance"> & {
    appearance?: Omit<Appearance, "cardWidth" | "cardHeight"> & {
      cardWidth?: Responsive<number>;
      cardHeight?: Responsive<number>;
    };
  };
};

/**
 * Renders an IcebergExplainerText whose explainer card can be sized according
 * to this site's breakpoints, which IcebergExplainerText itself deliberately
 * knows nothing about. All other props and options are passed through as-is.
 */
const ResponsiveIcebergExplainerText = ({
  options,
  ...props
}: ResponsiveIcebergExplainerTextProps) => {
  const breakpoint = useBreakpoint();
  return (
    <IcebergExplainerText
      {...props}
      options={{
        ...options,
        appearance: {
          ...options?.appearance,
          // Unset sizes resolve to undefined and are dropped, so the
          // IcebergExplainerText defaults still apply
          cardWidth: resolveResponsive(
            options?.appearance?.cardWidth,
            breakpoint,
          ),
          cardHeight: resolveResponsive(
            options?.appearance?.cardHeight,
            breakpoint,
          ),
        },
      }}
    />
  );
};

export default ResponsiveIcebergExplainerText;
