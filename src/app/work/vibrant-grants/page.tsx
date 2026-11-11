import {
  AppWindow,
  HandCoins,
  Lightbulb,
  Route,
  Sunrise,
  Target,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import ExternalLink from "@/components/ExternalLink";
import PageSection from "@/components/PageSection";
import { Figure, Testimonial } from "./atoms";
import {
  CLIENT,
  CLIENT_EXECUTIVE_DIRECTOR,
  CLIENT_NON_PROFIT_PHOTOS,
  DEMOS,
  EXECUTIVE_DIRECTOR_TESTIMONIAL,
  FEATURE_GROUPS,
  GRANT_OPPORTUNITY_HREF,
  GRANT_OPPORTUNITY_PAGES,
  OTHER_RESEARCH_ACTIVITIES,
  PICTURES,
  RECEIPTS,
  SERVICES,
  STAKEHOLDERS,
  TEAM,
  TESTIMONIALS,
  TIMELINE,
} from "./content";
import { PageFan, PaperReceipt, StakeholderRings } from "./illustrations";
import { LoopingVideo, PhotoCarousel, VideoCarousel } from "./players";

export const metadata: Metadata = {
  title: 'Vibrant Grants | Daniel "Ludo" DeAnda',
  description:
    "An end-to-end grant workflow for community-driven non-profit leaders",
};

/**
 * The `sizes` attribute of every {@link Figure} that fills
 * one of two equally wide columns (except on narrow viewports).
 */
const HALF_WIDTH_SIZES =
  "(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw";

/**
 * Renders a paragraph of body copy in which `<strong>` text stands out.
 */
const Paragraph = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <p
    className={twMerge(
      "text-lg text-base-content/75 [&_strong]:text-base-content",
      className,
    )}
  >
    {children}
  </p>
);

/**
 * Renders the client's logo in a squircle, which lets its white background
 * read as a tile. Hidden from ATs because the name of the client should
 * always be displayed alongside it.
 */
const ClientLogo = ({ className }: { className?: string }) => (
  <Image
    src={CLIENT.logo}
    alt=""
    width={256}
    height={256}
    sizes="96px"
    aria-hidden
    className={twMerge("mask size-10 shrink-0 mask-squircle", className)}
  />
);

/**
 * Renders one labeled entry in the summary of the project.
 */
const Fact = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) => (
  <div className={className}>
    <dt className="mb-3 text-xs font-bold tracking-widest text-base-content/50 uppercase">
      {label}
    </dt>
    <dd>{children}</dd>
  </div>
);

/**
 * Renders one research method as an item in an accordion. Opening an item
 * closes whichever other item is open, but every item can be closed at once.
 */
const Method = ({
  title,
  purpose,
  open = false,
  children,
}: {
  title: string;
  purpose?: ReactNode;
  open?: boolean;
  children: ReactNode;
}) => (
  // Sharing a `name` is what makes the browser close the other items
  <details
    name="research-methods"
    open={open}
    className="collapse-arrow collapse join-item border border-base-content/10 bg-base-200"
  >
    <summary className="collapse-title">
      <h3 className="text-lg leading-snug font-bold">{title}</h3>
      {purpose && (
        // Not `<p>` b/c `<summary>` only permits phrasing content and headings
        <span className="mt-1 block text-base-content/75 [&_strong]:text-base-content">
          Purpose: {purpose}
        </span>
      )}
    </summary>
    <div className="collapse-content">{children}</div>
  </details>
);

/**
 * Renders the statement of something learned from the
 * research above the paragraph that elaborates on it.
 */
const Finding = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-4">
    <h3 className="text-xl leading-snug font-bold sm:text-2xl">{title}</h3>
    <Paragraph>{children}</Paragraph>
  </div>
);

const VibrantGrants = () => (
  // Clears the navigation bar, which floats above the top of the page
  <main className="mx-auto w-full max-w-5xl flex-1 px-6 pt-36 pb-12">
    <header className="flex flex-col gap-12 pb-12">
      <div>
        <p className="mb-3 text-sm font-bold tracking-widest text-primary uppercase">
          Case Study
        </p>
        <h1 className="text-3xl leading-tight font-bold xs:text-4xl sm:text-5xl">
          Vibrant Grants
        </h1>
        <p className="mt-3 text-lg text-base-content/70 sm:text-xl">
          An end-to-end grant workflow for community-driven non-profit leaders
        </p>
      </div>

      <VideoCarousel demos={DEMOS} />

      {/* The last row absorbs the height left over by the team, which
          keeps the facts beside it packed together at the top */}
      <dl className="grid gap-x-10 gap-y-8 md:grid-cols-2 md:grid-rows-[auto_auto_1fr]">
        <Fact label="Team" className="md:row-span-3">
          <ul className="flex flex-col gap-4">
            {TEAM.map(({ name, href, role, portrait, highlighted }) => (
              <li
                key={href}
                className={twMerge(
                  "flex items-center gap-4",
                  highlighted && "font-bold",
                )}
              >
                <div className="avatar">
                  <div className="mask size-12 mask-squircle">
                    <Image src={portrait} alt="" width={48} height={48} />
                  </div>
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span>
                    <ExternalLink kind="underline" href={href}>
                      {name}
                    </ExternalLink>
                  </span>
                  <span
                    className={twMerge(
                      "text-sm",
                      !highlighted && "text-base-content/70",
                    )}
                  >
                    {role}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Fact>
        <Fact label="Client">
          <div className="flex items-center gap-3">
            <ClientLogo />
            <ExternalLink kind="underline" href={CLIENT.href}>
              {CLIENT.name}
            </ExternalLink>
          </div>
        </Fact>
        <Fact label="Timeline">
          <span className="tabular-nums">
            <time dateTime={TIMELINE.start}>{TIMELINE.start}</time> to{" "}
            <time dateTime={TIMELINE.end}>{TIMELINE.end}</time>
          </span>
        </Fact>
        <Fact label="Outcome">
          Endorsed for full implementation and integration by Executive Director{" "}
          <ExternalLink kind="underline" href={CLIENT_EXECUTIVE_DIRECTOR.href}>
            {CLIENT_EXECUTIVE_DIRECTOR.name}
          </ExternalLink>
        </Fact>
      </dl>
    </header>

    <PageSection id="client" title="The Client" icon={Sunrise}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-start gap-5 xs:flex-row xs:items-center">
          <ClientLogo className="size-20 sm:size-24" />
          <Paragraph>
            Meet <strong>New Sun Rising, a non-profit incubator</strong> serving
            Greater Pittsburgh. Think of it as a Y-Combinator for public benefit
            initiatives.
          </Paragraph>
        </div>
        <Figure picture={PICTURES.nsrTeam} />
        <div className="flex flex-col gap-4">
          <Paragraph>NSR delivers on this mission in three key ways:</Paragraph>
          <ul className="grid gap-4 sm:grid-cols-3">
            {SERVICES.map(({ name, description, icon: Icon }) => (
              <li
                key={name}
                className="card border border-base-content/10 bg-base-200"
              >
                <div className="card-body gap-2 p-5">
                  <Icon aria-hidden className="mb-1 size-6 text-primary" />
                  <h3 className="leading-snug font-bold">{name}</h3>
                  <p className="text-sm text-base-content/70">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageSection>

    <PageSection id="opportunity" title="The Opportunity" icon={Target}>
      <div className="flex flex-col gap-8">
        <Paragraph>
          NSR and its clients were{" "}
          <strong>struggling to secure grant funding</strong>. Its digital
          service ecosystem had the potential to help with that, but it had
          grown into a bit of a mess. We were challenged to tackle this problem.
        </Paragraph>
        <Figure
          picture={PICTURES.dataFlowModel}
          caption="Modeling how data flowed through NSR revealed a disorganized and unnecessarily complex status quo."
        />
      </div>
    </PageSection>

    <PageSection id="strategy" title="Our Strategy" icon={Route}>
      <div className="flex flex-col gap-10">
        <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_20rem]">
          <Paragraph>
            <strong>
              This design challenge implicated many different stakeholders
            </strong>
            . We took care to ensure that our work would benefit them all by
            routinely seeking input from each one throughout the project.
          </Paragraph>
          <StakeholderRings
            stakeholders={STAKEHOLDERS}
            className="mx-auto max-w-80"
          />
        </div>

        <div className="join join-vertical">
          <Method
            title="Participatory System Mapping"
            purpose={
              <>
                Learn how NSR&apos;s many services <strong>fit together</strong>
              </>
            }
            open
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Figure
                picture={PICTURES.systemMappingFigurines}
                caption="We made a custom set of figurines and pre-labeled some based on our initial research."
                sizes={HALF_WIDTH_SIZES}
              />
              <Figure
                picture={PICTURES.systemMappingInProgress}
                caption="NSR staff helped us make a model out of our miniatures in an on-site workshop."
                sizes={HALF_WIDTH_SIZES}
              />
            </div>
          </Method>

          <Method
            title="Field Work and Semi-Structured Interviews"
            purpose={
              <>
                Appreciate the{" "}
                <strong>experiences, processes, and pain points</strong> of
                non-profit leaders
              </>
            }
          >
            <PhotoCarousel
              photos={CLIENT_NON_PROFIT_PHOTOS}
              className="mx-auto max-w-xl"
            />
          </Method>

          <Method
            title="Card Sorting and Usability Testing"
            purpose={
              <>
                Assess how non-profit leaders intuit the{" "}
                <strong>organization and structure</strong> of NSR&apos;s
                digital services
              </>
            }
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Figure
                picture={PICTURES.dendrogram}
                caption={
                  <>
                    This diagram (known as a &ldquo;
                    <ExternalLink
                      kind="underline"
                      href="https://en.wikipedia.org/wiki/Dendrogram"
                    >
                      dendrogram
                    </ExternalLink>
                    &rdquo;) shows how often{" "}
                    <ExternalLink
                      kind="underline"
                      href="https://www.nngroup.com/articles/card-sorting-definition/"
                    >
                      card sorting
                    </ExternalLink>{" "}
                    participants grouped the concepts and content we gave them.
                    Consensus decreases from left to right, so the leftmost
                    merges represent the most common groupings.
                  </>
                }
                sizes={HALF_WIDTH_SIZES}
              />
              <Figure
                picture={PICTURES.usabilityTesting}
                caption="We were particularly interested in NSR's Vibrancy Index because our initial research suggested that it was underutilized. Our testing revealed that few people knew when, why, or even how to use it."
                sizes={HALF_WIDTH_SIZES}
              />
            </div>
          </Method>

          <Method title="Other Research Activities">
            <ul className="flex flex-wrap gap-2">
              {OTHER_RESEARCH_ACTIVITIES.map(({ label, href }) => (
                <li key={href}>
                  <ExternalLink kind="button" href={href}>
                    {label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </Method>
        </div>
      </div>
    </PageSection>

    <PageSection id="learnings" title="What We Learned" icon={Lightbulb}>
      <div className="flex flex-col gap-16">
        <article className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_16rem]">
          <Finding title="Non-profit leaders are community-oriented, not business-minded or data-driven.">
            They excel at qualitative thinking and delivering impact, but
            struggle with the admin work that keeps their orgs up and running.
            In their eyes, that extra work gets in the way of doing good.
          </Finding>
          <Figure
            picture={PICTURES.nonProfitLeaders}
            sizes="(min-width: 640px) 256px, 100vw"
          />
        </article>

        <article className="flex flex-col gap-8">
          <Finding title="Finding relevant grant opportunities can be overwhelming and time-consuming.">
            The world of grants has no central database and no standardization.
            Plus, many listings take ages to read. Helping non-profit leaders
            surface relevant grants can save them a lot of time.
          </Finding>
          <figure className="flex flex-col gap-3">
            <PageFan
              pages={GRANT_OPPORTUNITY_PAGES}
              label={`The ${GRANT_OPPORTUNITY_PAGES.length} pages of a notice of funding opportunity, fanned out like a hand of playing cards.`}
            />
            <figcaption className="text-sm text-base-content/60">
              An early, {GRANT_OPPORTUNITY_PAGES.length}-page(!) outline of a
              single grant opportunity published on{" "}
              <time dateTime="2026-05-04">2026-05-04</time> (
              <ExternalLink kind="underline" href={GRANT_OPPORTUNITY_HREF}>
                source
              </ExternalLink>
              ).
            </figcaption>
          </figure>
        </article>

        <article className="flex flex-col gap-8">
          <Finding title="Non-profits avoid experimenting with new tools to manage risk.">
            When both time and money are hard to come by and existing tools are
            &ldquo;good enough,&rdquo; searching for the perfect solution just
            isn&apos;t worth it. To overcome this obstacle, tools targeting
            non-profit leaders must be able to deliver significant value with
            minimal setup.
          </Finding>
          <div className="flex flex-col items-center gap-8 py-2 sm:flex-row sm:items-start sm:justify-center sm:gap-10">
            {RECEIPTS.map((receipt, i) => (
              <PaperReceipt
                key={receipt.title}
                receipt={receipt}
                // Scattered a little, as if the receipts were left on a desk
                className={i % 2 ? "rotate-1 sm:mt-10" : "-rotate-2"}
              />
            ))}
          </div>
        </article>
      </div>
    </PageSection>

    <PageSection id="solution" title="Our Solution" icon={AppWindow}>
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-8">
          <Paragraph>
            <strong>Vibrant Grants</strong> empowers non-profit leaders at every
            step of the way through every grant lifecycle that they encounter.
          </Paragraph>
          <nav aria-label="Stages of the grant lifecycle">
            <ol className="steps steps-vertical w-full font-semibold sm:steps-horizontal">
              {FEATURE_GROUPS.map(({ id, title }) => (
                <li key={id} className="step step-primary">
                  <a href={`#${id}`} className="link link-hover">
                    {title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {FEATURE_GROUPS.map(({ id, title, features }, i) => (
          <section
            key={id}
            id={id}
            aria-labelledby={`${id}-heading`}
            className="flex scroll-mt-32 flex-col gap-10 border-t border-base-content/10 pt-12"
          >
            <h3
              id={`${id}-heading`}
              className="flex items-center gap-3 text-xl leading-snug font-bold sm:text-2xl"
            >
              {/* Matches the marker of this stage in the `steps` above */}
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-base font-normal text-primary-content">
                {i + 1}
              </span>
              {title}
            </h3>
            {features.map(({ title, description, media }) => (
              <article
                key={title}
                className={twMerge(
                  "flex flex-col gap-4",
                  // A diagram sits beside the text that explains it
                  media.kind === "picture" &&
                    "sm:grid sm:grid-cols-[minmax(0,1fr)_20rem] sm:items-center sm:gap-6",
                )}
              >
                <div className="flex flex-col gap-4">
                  <h4 className="text-lg leading-snug font-bold">{title}</h4>
                  <Paragraph>{description}</Paragraph>
                </div>
                {media.kind === "video" ? (
                  <LoopingVideo src={media.src} label={title} />
                ) : (
                  <Figure
                    picture={media.picture}
                    sizes="(min-width: 640px) 480px, 150vw"
                    // Enlarged to trim the wide transparent margins that
                    // surround the diagram in its file
                    className="overflow-hidden"
                    imageClassName="scale-150"
                  />
                )}
              </article>
            ))}
          </section>
        ))}
      </div>
    </PageSection>

    <PageSection id="impact" title="Our Impact" icon={TrendingUp}>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <Paragraph>
            NSR and its clients <strong>overwhelmingly endorsed</strong> Vibrant
            Grants as useful, usable, and a powerful time saver.
          </Paragraph>
          <figure>
            {/* Margins (not `gap-y-*`) b/c columns can't space their rows */}
            <ul className="columns-1 gap-4 sm:columns-2">
              {TESTIMONIALS.map((quote) => (
                <li key={quote} className="mb-4 break-inside-avoid">
                  <Testimonial quote={quote} />
                </li>
              ))}
            </ul>
            <figcaption className="text-sm text-base-content/60">
              NSR staff and acceptance testing participants
            </figcaption>
          </figure>
        </div>

        <div className="flex flex-col gap-6">
          <Paragraph>
            NSR staff also praised our design work as setting a new standard for
            their organization and have since made plans to{" "}
            <strong>
              fully integrate Vibrant Grants into their digital service
              ecosystem
            </strong>
            .
          </Paragraph>
          <Testimonial quote={EXECUTIVE_DIRECTOR_TESTIMONIAL} featured>
            <div className="flex items-center gap-3">
              <ClientLogo />
              <div className="flex flex-col text-sm text-base-content/70">
                <span className="text-base font-bold text-base-content">
                  <ExternalLink
                    kind="underline"
                    href={CLIENT_EXECUTIVE_DIRECTOR.href}
                  >
                    {CLIENT_EXECUTIVE_DIRECTOR.name}
                  </ExternalLink>
                </span>
                <span>Executive Director, {CLIENT.name}</span>
              </div>
            </div>
          </Testimonial>
          {/* TODO: ask Scott about the exact amount he had secured back then
              and for a status update on the funding and/or integration */}
          <div className="card border border-base-content/10 bg-base-200">
            <div className="card-body flex-row items-center gap-5 p-5 sm:p-6">
              <HandCoins aria-hidden className="size-8 shrink-0 text-primary" />
              <Paragraph>
                Scott had already <strong>secured partial funding</strong> less
                than two weeks after our initial presentation of the near-final
                concept.
              </Paragraph>
            </div>
          </div>
        </div>

        <Paragraph className="sm:text-xl">
          Thanks to Vibrant Grants, NSR and its clients will soon be able to
          spend significantly less time on grant work and submit stronger,
          data-rich applications. Instead of being slowed and drained by a
          never-ending struggle for funding,{" "}
          <strong>
            non-profit leaders can focus on doing what they do best: actually
            supporting and improving their communities.
          </strong>
        </Paragraph>
      </div>
    </PageSection>
  </main>
);

export default VibrantGrants;
