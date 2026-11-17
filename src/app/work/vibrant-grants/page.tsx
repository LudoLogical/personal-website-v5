import { Award } from "lucide-react";
import type { Metadata } from "next";
import {
  Caption,
  ClientLogo,
  Figure,
  Paragraph,
  Testimonial,
} from "@/app/work/atoms";
import { PhotoCarousel, VideoCarousel } from "@/app/work/carousels";
import { TableOfContents } from "@/app/work/menus";
import {
  CaseStudySummary,
  FindingStatement,
  ResearchMethodItem,
  Section,
  Subsection,
} from "@/app/work/sections";
import { LoopingVideo } from "@/app/work/videos";
import ExternalLink from "@/components/ExternalLink";
import {
  CLIENT,
  CLIENT_EXECUTIVE_DIRECTOR,
  CLIENT_NON_PROFIT_PHOTOS,
  DEMOS,
  EXECUTIVE_DIRECTOR_TESTIMONIAL,
  FEATURE_GROUPS,
  FINDINGS,
  GRANT_OPPORTUNITY_CAPTION,
  GRANT_OPPORTUNITY_LABEL,
  GRANT_OPPORTUNITY_PAGES,
  METHODS,
  OTHER_RESEARCH_ACTIVITIES,
  OUTCOME,
  PICTURES,
  RECEIPTS,
  SECTION_HEADINGS,
  SERVICES,
  STAKEHOLDERS,
  SUBTITLE,
  TEAM,
  TESTIMONIALS,
  TIMELINE,
  TITLE,
} from "./content";
import {
  PageFan,
  ReceiptCard,
  SplitPicture,
  StakeholderRings,
} from "./illustrations";

export const metadata: Metadata = {
  title: `${TITLE} | Daniel "Ludo" DeAnda`,
  description: SUBTITLE,
};

/**
 * The `sizes` attribute of every {@link Figure} that fills
 * one of two equally wide columns (except on narrow viewports).
 */
const HALF_WIDTH_SIZES =
  "(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw";

const VibrantGrants = () => (
  // Clears the navigation bar, which floats above the top of the page
  <main className="mx-auto w-full max-w-5xl flex-1 px-6 pt-36 pb-12">
    <header className="flex flex-col gap-12 pt-4 pb-12">
      <div>
        <p className="mb-3 text-sm font-bold tracking-widest text-primary uppercase">
          Case Study
        </p>
        <h1 className="text-3xl leading-tight font-bold xs:text-4xl sm:text-5xl">
          {TITLE}
        </h1>
        <p className="mt-3 text-lg text-base-content/70 sm:text-xl">
          {SUBTITLE}
        </p>
      </div>

      <VideoCarousel demos={DEMOS} />

      <CaseStudySummary
        team={TEAM}
        client={CLIENT}
        timeline={TIMELINE}
        outcome={OUTCOME}
        className="mt-4"
      />
    </header>

    <div className="border-t border-base-content/10 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-10">
      {/* Stretched to the full height of the sections beside it, within
          which the table of contents can thus stick to the viewport */}
      <div className="hidden pt-12 lg:block">
        <TableOfContents
          headings={Object.values(SECTION_HEADINGS)}
          className="sticky top-[calc(var(--primary-nav-inset,0px)+(--spacing(12)))] transition-[top] duration-300 ease-out motion-reduce:transition-none"
        />
      </div>

      <div className="min-w-0">
        <Section heading={SECTION_HEADINGS.client}>
          <div className="flex flex-col gap-8">
            <Paragraph>
              Meet <strong>New Sun Rising, a non-profit incubator</strong>{" "}
              serving Greater Pittsburgh. Think of it as a Y-Combinator for
              public benefit initiatives.
            </Paragraph>
            <Figure picture={PICTURES.nsrTeam} />
            <div className="flex flex-col gap-4">
              <Paragraph>
                NSR delivers on this mission in three key ways:
              </Paragraph>
              <ul className="grid gap-4 sm:grid-cols-3">
                {SERVICES.map(({ name, description, icon: Icon }) => (
                  <li
                    key={name}
                    className="card border border-base-content/10 bg-base-200"
                  >
                    <div className="card-body gap-2 p-5">
                      <Icon aria-hidden className="mb-1 size-6 text-primary" />
                      <h3 className="leading-snug font-bold">{name}</h3>
                      <p className="text-sm text-base-content/70">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section heading={SECTION_HEADINGS.opportunity}>
          <div className="flex flex-col gap-8">
            <Paragraph>
              NSR and its clients were{" "}
              <strong>struggling to secure grant funding</strong>. Its digital
              service ecosystem had the potential to help with that, but it had
              grown into a bit of a mess. We were challenged to tackle this
              problem.
            </Paragraph>
            <Figure
              picture={PICTURES.dataFlowModel}
              sizes="(min-width: 640px) 448px, 100vw"
              className="mx-auto max-w-md"
            />
          </div>
        </Section>

        <Section heading={SECTION_HEADINGS.strategy}>
          <div className="flex flex-col gap-10">
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

            <div className="join join-vertical">
              <ResearchMethodItem method={METHODS.systemMapping} open>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Figure
                    picture={PICTURES.systemMappingFigurines}
                    sizes={HALF_WIDTH_SIZES}
                  />
                  <Figure
                    picture={PICTURES.systemMappingInProgress}
                    sizes={HALF_WIDTH_SIZES}
                  />
                </div>
              </ResearchMethodItem>

              <ResearchMethodItem method={METHODS.fieldWorkAndSSIs}>
                <PhotoCarousel
                  photos={CLIENT_NON_PROFIT_PHOTOS}
                  className="mx-auto w-full max-w-xl"
                />
              </ResearchMethodItem>

              <ResearchMethodItem
                method={METHODS.cardSortingAndUsabilityTesting}
              >
                {/* Each figure spans two shared rows (one for the images and
                    one for the captions) so that its caption lines up with
                    the other's even though the images' heights differ */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <Figure
                    picture={PICTURES.dendrogram}
                    sizes={HALF_WIDTH_SIZES}
                    className="row-span-2 grid grid-rows-subgrid"
                    imageClassName="self-end"
                  />
                  <Figure
                    picture={PICTURES.usabilityTesting}
                    sizes={HALF_WIDTH_SIZES}
                    className="row-span-2 grid grid-rows-subgrid"
                    imageClassName="self-end"
                  />
                </div>
              </ResearchMethodItem>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold tracking-widest text-base-content/50 uppercase">
                Other Research Activities
              </h3>
              <ul className="flex flex-wrap gap-2">
                {OTHER_RESEARCH_ACTIVITIES.map(({ label, href }) => (
                  <li key={href}>
                    <ExternalLink kind="button" href={href}>
                      {label}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section heading={SECTION_HEADINGS.learnings}>
          <div className="flex flex-col gap-10">
            <article className="flex flex-col gap-8">
              <FindingStatement finding={FINDINGS.communityOriented} />
              <SplitPicture
                left={PICTURES.communityOriented}
                right={PICTURES.dataDriven}
              />
            </article>

            <article className="flex flex-col gap-8">
              <FindingStatement finding={FINDINGS.grantDiscovery} />
              <figure className="flex flex-col gap-4">
                <PageFan
                  pages={GRANT_OPPORTUNITY_PAGES}
                  label={GRANT_OPPORTUNITY_LABEL}
                />
                <Caption>{GRANT_OPPORTUNITY_CAPTION}</Caption>
              </figure>
            </article>

            <article className="flex flex-col gap-8">
              <FindingStatement finding={FINDINGS.riskAversion} />
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
                {RECEIPTS.map((receipt) => (
                  <ReceiptCard key={receipt.title} receipt={receipt} />
                ))}
              </div>
            </article>
          </div>
        </Section>

        <Section heading={SECTION_HEADINGS.solution}>
          <div className="flex flex-col gap-10">
            <Paragraph>
              <strong>Vibrant Grants</strong> empowers non-profit leaders at
              every step of the way through every grant lifecycle that they
              encounter.
            </Paragraph>

            <div className="flex flex-col gap-12">
              {FEATURE_GROUPS.map(({ id, label: title, features }) => (
                <Subsection key={id} heading={{ id, label: title }}>
                  {features.map(({ title, description, media }) => (
                    <article key={title} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3">
                        <h4 className="text-lg leading-snug font-semibold">
                          {title}
                        </h4>
                        <Paragraph>{description}</Paragraph>
                      </div>
                      {media.kind === "video" ? (
                        <LoopingVideo src={media.src} label={title} />
                      ) : (
                        <Figure
                          picture={media.picture}
                          sizes="(min-width: 400px) 320px, 100vw"
                          className="mx-auto max-w-xs"
                        />
                      )}
                    </article>
                  ))}
                </Subsection>
              ))}
            </div>
          </div>
        </Section>

        <Section heading={SECTION_HEADINGS.impact}>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <Paragraph>
                NSR and its clients <strong>overwhelmingly endorsed</strong>{" "}
                Vibrant Grants as useful, usable, and a powerful time saver.
              </Paragraph>
              {/* Margins (not `gap-y-*`) b/c columns can't space their rows */}
              <ul className="columns-1 gap-4 sm:columns-2">
                {TESTIMONIALS.map((quote) => (
                  <li key={quote} className="mb-4 break-inside-avoid last:mb-0">
                    <Testimonial quote={quote} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <Paragraph>
                NSR staff also praised our design work as setting a new standard
                for their organization and have since made plans to{" "}
                <strong>
                  fully integrate Vibrant Grants into their digital service
                  ecosystem
                </strong>
                .
              </Paragraph>
              <Testimonial quote={EXECUTIVE_DIRECTOR_TESTIMONIAL} featured>
                <div className="flex items-center gap-3">
                  <ClientLogo client={CLIENT} />
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
              {/* TODO: ask Scott about the exact amount he had secured back
                  then and for a status update on the funding/integration */}
              <div className="card border border-base-content/10 bg-base-200">
                <div className="card-body flex-row items-center gap-5 p-5 text-base sm:p-6">
                  <Award aria-hidden className="size-8 shrink-0 text-primary" />
                  <Paragraph>
                    NSR had already <strong>secured partial funding</strong>{" "}
                    less than two weeks after our initial presentation of the
                    near-final concept.
                  </Paragraph>
                </div>
              </div>
            </div>

            <Paragraph>
              Thanks to Vibrant Grants, NSR and its clients will soon be able to
              spend significantly less time on grant work and submit stronger,
              data-rich applications. Instead of being slowed and drained by a
              never-ending struggle for funding,{" "}
              <strong>
                non-profit leaders can focus on doing what they do best:
                actually supporting and improving their communities.
              </strong>
            </Paragraph>
          </div>
        </Section>
      </div>
    </div>
  </main>
);

export default VibrantGrants;
