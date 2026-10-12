import { twMerge } from "tailwind-merge";
import ExternalLink, {
  type ExternalLinkProps,
} from "@/components/ExternalLink";

export type InlineExternalLinkProps = Omit<ExternalLinkProps, "children"> & {
  /**
   * The text of the link.
   */
  children: string;
};

/**
 * Renders an ExternalLink that wraps along with the text around it (rather
 * than as one inline-flex box), so that its outbound-arrow icon always follows
 * its last word. Shared by every link within the resume's text so that they
 * all match.
 */
const InlineExternalLink = ({
  children,
  className,
  iconClassName,
  ...props
}: InlineExternalLinkProps) => {
  const lastWordStart = children.lastIndexOf(" ") + 1;
  return (
    // A line can always break before the icon (an atomic inline) unless the
    // nearest common ancestor of the icon and the character before it is
    // nowrap, so only the text before the last word is allowed to wrap
    <ExternalLink
      {...props}
      className={twMerge("inline link whitespace-nowrap link-hover", className)}
      iconClassName={twMerge("ms-[0.2em] inline align-baseline", iconClassName)}
    >
      <span className="whitespace-normal">
        {children.slice(0, lastWordStart)}
      </span>
      {children.slice(lastWordStart)}
    </ExternalLink>
  );
};

export default InlineExternalLink;
