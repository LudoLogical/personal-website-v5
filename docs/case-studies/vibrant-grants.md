# Vibrant Grants

An end-to-end grant workflow for community-driven non-profit leaders

> **Visual**: a carousel of `.webm` videos (located in `demos/`) showing off key parts of the workflow. A caption should be displayed alongside each video in the carousel. In order of appearance, the videos and their **captions** are:
> 
> - `search.webm`: Find the perfect grant opportunity
> - `collaboration.webm`: Team up with other like-minded organizations
> - `sources.webm`: Draw from curated and familiar data sources
> - `conversation.webm`: Convert simple conversations into usable impact data
> - `analysis.webm`: Understand relevant data and use it to strengthen grant applications
> - `tracking.webm`: Stay on top of every grant from start to finish

> **Design Note**: The videos in the carousel above should behave like `.gif`s in that they should play automatically and their controls should be hidden from users. When one video finishes playing, the carousel should move on to the next one (or, in the case of the last video, return to the first one) automatically. However, the user should be able to cycle through the videos in the carousel at will. Each video should always play from the very beginning every time it appears, even if the user switched the carousel to show a different video partway through. The carousel should feature an indicator that graphically depicts how much of the current video has played (i.e., as a fraction of its total length). The user should be able to pause (or resume) the current video at any time by clicking on it. The carousel should never automatically switch videos while the current video is paused. However, if the user manually switches the current video, the new current video should begin playing automatically from the beginning as normal.

- Team:
	- **[Daniel "Ludo" DeAnda](https://www.linkedin.com/in/danielchristiandeanda/): Lead Engineer**
	- [Soyon Kim](https://www.linkedin.com/in/soyon-kim/): Co-Lead Researcher and Designer
	- [Anissa Patel](https://www.linkedin.com/in/anissa-patel/): Project Manager and Data Engineer
	- [Priyal Shrivastava](https://www.linkedin.com/in/priyalshri/): Co-Lead Researcher and AI Strategist
	- [Cameron Thompson](https://www.linkedin.com/in/cameron-jaede-thompson/): Co-Lead Designer
- Client: [New Sun Rising](https://www.newsunrising.org)
- Timeline: 2026-01 to 2026-07
- Outcome: Endorsed for full implementation and integration by Executive Director [Scott Wolovich](https://www.linkedin.com/in/scott-wolovich-91141033b/)

> **Visuals** (for each person in "Team" above): `team/*.png`
> **Captions**: (None)

## The Client

Meet **New Sun Rising, a non-profit incubator** serving Greater Pittsburgh. Think of it as a Y-Combinator for public benefit initiatives.

> **Visual**: `photos/new-sun-rising-team.jpg`
> **Caption**: (None)

NSR delivers on this mission in three key ways:

> **Visual**: the following breakdown of NSR's services into categories:
> 
> - Capacity Building: Getting from an idea to a fully developed organization
> - Accessible Funding: Raising the capital necessary to deliver impact
> - Data and Advocacy: Helping orgs leverage data to communicate their impact and value
> 
> **Caption**: (None)

## The Opportunity

NSR and its clients were **struggling to secure grant funding**. Its digital service ecosystem had the potential to help with that, but it had grown into a bit of a mess. We were challenged to tackle this problem.

> **Visual**: `diagrams/data-flow-model-simplified.png`
> **Caption**: Modeling how data flowed through NSR revealed a disorganized and unnecessarily complex status quo.

## Our Strategy

**This design challenge implicated many different stakeholders**. We took care to ensure that our work would benefit them all by routinely seeking input from each one throughout the project.

> **Visual**: a modified version of nsr-stakeholder-diagram.png, replicated in HTML (i.e., do NOT use an image element). For each concentric circle, find the default Tailwind shade of orange (e.g., `orange-500`) that aligns most closely with its background color, then use the shade of yellow with the same weight (e.g., `yellow-500`) as the actual background color. (All four background colors must be distinct.) Add solid borders around the innermost and third-innermost circles; also add a dashed one around the second-innermost circle. Swap out "Non profit client" for "Client non-profits" and "Non profit landscape" for "All non-profits".
> **Caption**: (None)

> **Design Note**: the subsections that follow should be rendered as an accordion. The first subsection should be expanded by default. No more than one subsection should be expanded at any given time. However, zero subsections may be expanded if the user simply collapses whichever subsection is expanded at the time.

### Participatory System Mapping

Purpose: Learn how NSR's many services **fit together**

> **Visuals** and corresponding **captions**:
> 
> - `photos/system-mapping-figurines.jpg`: We made a custom set of figurines and pre-labeled some based on our initial research.
> - `photos/system-mapping-in-progress.jpg`: NSR staff helped us make a model out of our miniatures in an on-site workshop.

### Field Work and Semi-Structured Interviews

Purpose: Appreciate the **experiences, processes, and pain points** of non-profit leaders

> **Visuals** and corresponding **captions** (which should appear in a carousel):
> **Visual**: a carousel of photographs (located in `photos/`) showing off the impact that several NSR client non-profits have on their communities. A caption should be displayed alongside each image in the carousel. In order of appearance, the photos and their **captions** are:
> 
> - `photos/client-non-profits-001.png`: [Art in the Garden](https://www.newsunrising.org/project/art-in-the-garden/)
> - `photos/client-non-profits-002.jpg`: [Millvale Food + Energy Hub](https://www.newsunrising.org/project/millvale-food-and-energy-hub/)
> - `photos/client-non-profits-003.jpg`: [Millvale Food + Energy Hub](https://www.newsunrising.org/project/millvale-food-and-energy-hub/)
> - `photos/client-non-profits-004.jpg`: [Building Bridges Day](https://www.newsunrising.org/project/building-bridges-day/)
> - `photos/client-non-profits-005.jpg`: [Arts Excursions Unlimited](https://www.newsunrising.org/project/arts-excursions-unlimited/)

> **Design Note**: Similar to the video carousel described earlier, this carousel should cycle through the photos that comprise it automatically. Each photo should be shown for the same fixed amount of time before the carousel moves on to the next one (or, in the case of the last image, returns to the first one). However, the user should be able to cycle through the photos in the carousel at will. The carousel should feature an indicator that graphically depicts the fraction of the fixed duration that has elapsed.

### Card Sorting and Usability Testing

Purpose: Assess how non-profit leaders intuit the **organization and structure** of NSR's digital services

> **Visuals** and corresponding **captions**:
> 
> - `diagrams/dendrogram-mini.png`: This diagram (known as a "[dendrogram](https://en.wikipedia.org/wiki/Dendrogram)") shows how often [card sorting](https://www.nngroup.com/articles/card-sorting-definition/) participants grouped the concepts and content we gave them. Consensus decreases from left to right, so the leftmost merges represent the most common groupings.
> - `diagrams/usability-testing.png`: We were particularly interested in NSR's Vibrancy Index because our initial research suggested that it was underutilized. Our testing revealed that few people knew when, why, or even how to use it.

### Other Research Activities

- [Directed storytelling](https://www.youtube.com/watch?v=x8OJd4tpMoM)
- [MoSCoW analysis](https://en.wikipedia.org/wiki/MoSCoW_method)
- [Mixed-methods](https://www.nngroup.com/articles/mixed-methods-research/) survey
- [Speed dating](https://www.designreference.xyz/ux-methods/ideation/speed-dating)
- [Co-design](https://ixdf.org/literature/topics/codesign)
- [Concept testing](https://maze.co/guides/concept-testing/)

## What We Learned

### Non-profit leaders are community-oriented, not business-minded or data-driven.

They excel at qualitative thinking and delivering impact, but struggle with the admin work that keeps their orgs up and running. In their eyes, that extra work gets in the way of doing good.

> **Visual**: `photos/non-profit-leaders.jpg`
> **Caption**: (None)

### Finding relevant grant opportunities can be overwhelming and time-consuming.

The world of grants has no central database and no standardization. Plus, many listings take ages to read. Helping non-profit leaders surface relevant grants can save them a lot of time.

> **Visual**: Illustrate the sheer length of many grant opportunities using the following real-world example: https://files.simpler.grants.gov/opportunities/bd1b6f4b-400a-451b-9af9-14b572457e6f/attachments/74d8d55a-fa3d-4df4-98f4-83f258c2dbcc/PAR-24-251_Animal_and_Veterinary_Innovation_Centers_Full_Notice_of_Funding_Opportunity_Announcement.pdf. Treat each page as an image and fan them out like the playing cards in this image: https://media.istockphoto.com/id/2162952555/vector/royal-flush-hearts-playing-cards-hand-vector.jpg?s=612x612&w=0&k=20&c=V15-Hy_gCUpNs0RwdaT995X2u_SLaaX3UYG65girtbQ= (where the top card corresponds to the first page and appears on the left side of the fan instead of the right side).
> **Caption**: An early, 16-page(!) outline of a single grant opportunity published on 2026-05-04 ([source](https://simpler.grants.gov/opportunity/bd1b6f4b-400a-451b-9af9-14b572457e6f)).

### Non-profits avoid experimenting with new tools to manage risk.

When both time and money are hard to come by and existing tools are "good enough," searching for the perfect solution just isn't worth it. To overcome this obstacle, tools targeting non-profit leaders must be able to deliver significant value with minimal setup.

> **Visual**: Illustrate the process of a non-profit leader deciding that a new, specialized tool isn't worth looking into and that an old, general-purpose one is "good enough" using a pair of receipts as a metaphor. The core conceit is that the receipts use hours of a non-profit leader's time as the currency instead of money, revealing the extra, hidden "cost" of switching. The first receipt, which represents a "free trial" for the new, specialized tool, should contain the following:
> 
> - Read comparison articles: 0.75 hrs
> - Compare pricing options: 0.25 hrs
> - Watch tutorial videos: 1.00 hrs
> - Import and organize data: 1.50 hrs
> - Migrate workflows: 2.00 hrs
> - Re-train volunteers: 2.00 hrs
> 
> Amount due: 7.50 hrs
> 
> The second receipt, which represents the existing tool, should contain the following:
> 
> - Click to open: 0.00 hrs
> 
> Amount due: 0.00 hrs
> 
> Both receipts should be designed, formatted, and rendered such that their appearances match that of actual receipts.
> 
> **Caption**: (None)

## Our Solution

**Vibrant Grants** empowers non-profit leaders at every step of the way through every grant lifecycle that they encounter.

> **Design Note**: Like the video carousel described earlier, the videos in the subsections that follow should play automatically and their controls should be hidden from users. When a video finishes playing, it should restart automatically from the beginning. However, the user should be able to pause (or resume) a video at any time by clicking on it. Each video should feature an indicator that graphically depicts how much of it has played (i.e., as a fraction of its total length).

### Find Relevant Grants

#### Multi-Modal Ingestion

Despite how unstructured the grant ecosystem often is, Vibrant Grants can **source grant opportunities automatically** thanks to a novel ingestion mechanism that leverages both a deterministic web scraper and an asynchronous, AI-powered data extraction workload.

> **Visual**: `diagrams/ingestion-mechanism-flowchart.png`
> **Caption**: (None)

#### Holistic Relevance Assessments

Vibrant Grants **ranks search results by relevance** using a specially designed formula that accounts for 13 heuristic factors and features 21 fine-tunable hyperparameters.

> **Visual**: `search.webm`
> **Caption**: (None)

### Weave Data into Applications

#### Leverage Existing Sources

Vibrant Grants **intelligently surfaces relevant data** from NSR's existing digital services and any additional sources that users supply to it.

> **Visual**: `sources.webm`
> **Caption**: (None)

#### Generate Step-by-Step Guidance

Vibrant Grants leverages AI to **help qualitative thinkers like non-profit leaders understand quantitative data**, contextualize it, and apply it to prove their potential as grantees.

> **Visual**: `analysis.webm`
> **Caption**: (None)

#### Leave the Writing to the Experts

People who are as community-driven as non-profit leaders are exceptional storytellers. Generating grant applications for them would worsen the quality of the writing, make mistakes more likely, and increase operating costs, so **we deliberately chose not to**.

> **Visual**: `no-writing.webm`
> **Caption**: (None)

### Prove Impact in Reports

#### Conversational Data Gathering

As qualitative thinkers, non-profit leaders may not always recognize when or what quantitative data might be useful. Vibrant Grants helps by **converting that analytical question into an AI-driven conversational interaction** that better aligns with how non-profit leaders actually think.

> **Visual**: `conversation.webm`
> **Caption**: (None)

## Our Impact

NSR and its clients **overwhelmingly endorsed** Vibrant Grants as useful, usable, and a powerful time saver.

> **Visual**: Callouts with quotes from NSR staff and acceptance testing participants:
> 
> - "\[The interface is\] not too much for my brain and not overwhelming."
> - "The plain\[-\]language \[analysis\] is great! This is where we see a lot of people struggle."
> - "Everything seems practical and educational."
> - "This makes me really excited!"
> - "This is all amazing! Who would’ve thought grants could be exciting\[?\]"
> - "This is awesome! I can already see the increase in grant apps going out!"
> 
> **Caption**: (None)

NSR staff also praised our design work as setting a new standard for their organization and have since made plans to **fully integrate Vibrant Grants into their digital service ecosystem**.

> **Visual**: Callout with the following quote from Scott: "The UI here can help us set more modern, more accessible, cleaner ways for the information to be presented on the portal."
> **Caption**: (None)

> **Visual**: Callout mentioning the fact that Scott had already secured partial funding less than two weeks after our initial presentation of the near-final concept. TODO: ask Scott about the exact amount he had secured back then and for a status update on the funding and/or integration.
> **Caption**: (None)

Thanks to Vibrant Grants, NSR and its clients will soon be able to spend significantly less time on grant work and submit stronger, data-rich applications. Instead of being slowed and drained by a never-ending struggle for funding, **non-profit leaders can focus on doing what they do best: actually supporting and improving their communities.**
