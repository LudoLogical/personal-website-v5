import type { ComponentType, ReactNode } from "react";
import type PrimaryNav from "@/components/PrimaryNav";

export type PageSectionProps = {
  /**
   * The `id` of the `<section>` rendered by this {@link PageSection}.
   * Also used to derive the `id` of its heading.
   */
  id: string;

  /**
   * The text of the heading of this {@link PageSection}.
   */
  title: string;

  /**
   * The icon that should appear on the left
   * side of the heading of this {@link PageSection}.
   */
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

  /**
   * The content of this {@link PageSection}.
   */
  children: ReactNode;
};

/**
 * Renders a top-level section of a page. On wide viewports, its heading is
 * located in a column to the left of its content and sticks to the top of
 * the viewport (but respects the {@link PrimaryNav}).
 */
const PageSection = ({ id, title, icon: Icon, children }: PageSectionProps) => (
  <section
    id={id}
    aria-labelledby={`${id}-heading`}
    className="scroll-mt-32 border-t border-base-content/10 py-12 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-10"
  >
    <h2
      id={`${id}-heading`}
      className="mb-8 flex items-center gap-3 text-2xl font-bold motion-reduce:transition-none lg:sticky lg:top-[calc(var(--primary-nav-inset,0px)+(--spacing(12)))] lg:mb-0 lg:self-start lg:transition-[top] lg:duration-300 lg:ease-out"
    >
      <Icon aria-hidden className="size-6 shrink-0 text-secondary" />
      {title}
    </h2>
    <div className="min-w-0">{children}</div>
  </section>
);

export default PageSection;
