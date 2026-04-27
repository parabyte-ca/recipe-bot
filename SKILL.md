---
name: recipe-blog
description: >
  Generate complete, SEO-optimised, HCU-safe recipe blog posts for an "elevated weeknight cooking"
  blog targeting busy professionals. Use this skill whenever the user provides a recipe source —
  YouTube link, short video, URL, uploaded file, photo, handwritten card, or describes a dish from
  scratch — and asks to create a blog post, recipe draft, or blog content. Also trigger for tasks
  like refreshing an existing post, generating social content for a recipe, building a Pinterest
  strategy, planning a seasonal content calendar, or generating email/newsletter content. The skill
  produces the full blog draft in Alan's no-fluff Toronto-male voice PLUS the complete SEO and
  social package, and outputs a human-verification checklist that must be completed before publish.
  Always load this skill before writing any recipe content.
---

# Recipe Blog Skill

## Who this is for

**Alan Moote** — Toronto-based, serious home cook, no-fluff voice. Audience: busy professionals who cook with intent. Niche: elevated weeknight cooking — restaurant-quality results with weeknight realism.

---

## Step 1: Ingest the source

Accept any of the following inputs:
- YouTube / TikTok / Instagram / Shorts URL → extract via web_fetch or note limitations
- Recipe page URL → web_fetch full content
- Uploaded file (photo, PDF, docx, image of handwritten card) → use file-reading skill
- User description in chat → treat as raw recipe notes

**On ingredient quantities and cook times:** Extract exactly what is stated in the source. Flag every quantity or time not explicitly confirmed as `⚠️ VERIFY`. Never invent or assume measurements. This is the #1 HCU risk.

---

## Step 2: Generate the full blog post

Produce all sections below in order. Do not skip sections. Flag any section where source material is thin — output `[THIN — expand from your test cook]` rather than padding.

### Post structure (H-level map)

```
H1: [SEO Title — see §SEO package]
[2–3 sentence intro — technique authority first, no personal preamble]
[Jump-to-Recipe button placeholder]
[HERO IMAGE PLACEHOLDER — shoot: [specific shot direction]]

H2: Why this works
H2: What you need  (ingredients + notes on non-obvious choices)
H2: How to make it  (numbered steps, process shot callouts)
H2: Tips from my kitchen
H2: Substitutions & variations
H2: Storage & reheating
H2: Frequently asked questions  (5 Q&As)
[RECIPE CARD — see §Recipe card]
H2: More weeknight recipes  (3–5 internal link placeholders)
```

### Voice rules (encode in every output)

**Structure and rhythm**
- Vary sentence length deliberately. Short punchy sentences next to longer explanatory ones.
- Sentence fragments for emphasis. They work.
- Occasional sentence starting with "And" or "But" is fine.
- Short paragraphs next to longer ones. Never three of similar length in a row.
- Opinions stated as facts: "Cast iron is the right pan here" not "cast iron might be a good option."

**Language to use**
- Active voice throughout.
- Contractions where natural: it's, you'll, don't, that's, I'd.
- Metric first, imperial in parentheses: "200 g (7 oz) pancetta."
- Specific numbers: "5 minutes" not "about 5 minutes."
- Technique-first framing: "Sear hard, rest five minutes, slice against the grain. That's the whole game."
- Canadian English: colour, flavour, centre, recognise.

**Language to never use**
- Em dashes. Replace with a period, comma, or restructure.
- "Here's what you need to know" / "Here's the thing"
- "Let's dive in" / "Let's get started"
- "Game-changer" / "game-changing"
- "Delve" in any form
- "It's worth noting that"
- "Straightforward" / "simple" as reassurance
- "Amazing" / "incredible" / "delicious" / "perfect" / "ultimate" / "best ever"
- "You'll love this"
- "In conclusion" / "To summarise"
- Forced three-item parallel lists that feel contrived
- Rhetorical questions as section openers
- "Additionally," "Furthermore," "Moreover" used more than once per post
- Starting multiple consecutive sentences with the same word
- Passive constructions: "it should be noted," "it can be seen"

**Placeholders**
- Leave `[INSERT: 1 sentence — specific test note, brand, failure]` wherever personal experience belongs.
- Never invent an anecdote. Never fabricate what happened during a cook.

### Intro formula (2–3 sentences max, above hero image)

```
[Single bold technique claim or flavour contrast].
[One sentence on why this solves the weeknight problem — time, pantry, skill].
[INSERT: 1 sentence — your specific test note].
```

### H2: Why this works
3–5 short paragraphs. Each one names one technique decision and explains the outcome. Example: *"Dry brine the steak 24 hours out. The salt draws moisture to the surface, then reabsorbs — seasoning the meat through, not just the crust."* No filler.

### H2: What you need
Bullet list. For each non-obvious ingredient: 1-sentence note on role, grade, or substitution. Flag `⚠️ VERIFY quantity` on anything not confirmed in source.

### H2: How to make it
Numbered steps. Each step: one action, one expected result. Process shot callouts: `[PHOTO: pan at medium-high, first side down, crust forming]`. Keep each step ≤ 3 sentences.

### H2: Tips from my kitchen
5–7 bullets. Each one is a specific technique or equipment note. At least one `[INSERT: your specific observation]` placeholder per post.

### H2: Substitutions & variations
3–5 bullet pairs: *"No pancetta → guanciale or thick-cut bacon; flavour profile shifts toward smokier."* Cover: protein swaps, dietary adaptations, equipment alternatives.

### H2: Storage & reheating
Fridge life, freezer life, reheating method. Be specific: temperatures, tools, what degrades if you do it wrong.

### H2: Frequently asked questions
Generate 5 Q&As targeting search intent. Format:
```
**Q: [question as a searcher would type it]**
A: [2–3 sentence direct answer. No fluff.]
```

---

## Step 3: Recipe card

Output a structured card with the following fields. Mark any field sourced from inference (not confirmed in source material) with `⚠️ VERIFY`.

```
RECIPE CARD
───────────────────────────────
Title:
Yield: ⚠️ VERIFY
Prep time: ⚠️ VERIFY  (ISO-8601: PT__M)
Cook time: ⚠️ VERIFY  (ISO-8601: PT__M)
Total time: ⚠️ VERIFY (ISO-8601: PT__M)
Course: [Appetiser / Main / Side / Dessert]
Cuisine: [e.g., Italian, Japanese, Canadian]
Diet flags: [Gluten-free / Dairy-free / etc. if applicable]

INGREDIENTS
- [quantity + unit + ingredient + prep note] ⚠️ VERIFY each quantity

INSTRUCTIONS
1. [Step]
2. [Step]
...

NOTES
[Any sourced notes from the video/URL, plus INSERT placeholders]
───────────────────────────────
Schema note: Time fields must be exact ISO-8601 (PT15M not PT10M-PT15M).
recipeCategory and recipeCuisine are required for 2026 Google rich results.
Hero image must appear in JSON-LD AND as standard HTML img tag.
```

---

## Step 4: SEO package

```
SEO PACKAGE
───────────────────────────────
H1 / Post title:
  [Primary keyword near front. Under 60 characters. No clickbait. No "best" / "ultimate".]

Meta description:
  [Under 155 characters. Technique hook + what reader gets. Include primary keyword.]

URL slug:
  [lowercase-hyphenated, primary keyword, under 60 characters]

Focus keyword:
  [Single phrase. Monthly search volume estimate if known.]

Secondary keywords (3–5):
  [List]

Alt text — hero image:
  ["[dish name] in [vessel] on [surface], [key visual detail]" — describe don't keyword-stuff]

Alt text — process shots (2–3 suggestions):
  ["[action happening] — [detail]"]
───────────────────────────────
```

---

## Step 5: Social & distribution package

```
SOCIAL PACKAGE
───────────────────────────────
Pinterest pin descriptions (3 variants — 150–300 chars each):
  1. [Technique-hook version]
  2. [Time/ease version]
  3. [Flavour/result version]
  Board suggestion: [most relevant board name]

Instagram caption:
  [Hook line (no hashtag). 3–4 sentences max. CTA: "Link in bio for full recipe."]
  Hashtags (10–15): [relevant mix — niche + broad]

TikTok/Reels spoken-keyword suggestion:
  [First 3 seconds script — algorithm transcribes this, treat as SEO]

Email subject line (3 variants):
  1. [Curiosity / technique angle]
  2. [Time/ease angle]
  3. [Flavour/result angle]
  Preview text: [40–90 chars, complements subject]

Substack teaser (2–3 sentences for paid-subscriber preview):
  [Technique insight not in the free post]
───────────────────────────────
```

---

## Step 6: Pre-publish checklist

Output this checklist as a final block. Nothing publishes without it.

```
PRE-PUBLISH CHECKLIST — complete before scheduling
───────────────────────────────
COOK & VERIFY
[ ] Recipe tested in your kitchen (note: what stove, pan, oven)
[ ] All ⚠️ VERIFY quantities confirmed against your test cook
[ ] ISO-8601 times confirmed (PT15M format, not ranges)
[ ] Yield confirmed

PHOTOGRAPHY
[ ] Hero image shot (dish in context, not on white background)
[ ] Process shots: [list 3 key moments flagged in post]
[ ] Hero image appears as both JSON-LD and HTML <img> tag

E-E-A-T INJECTION
[ ] All [INSERT] placeholders replaced with real test notes
[ ] At least 1 specific sensory detail per major step
[ ] Author byline visible with credentials

TECHNICAL
[ ] Recipe schema validated in Google Rich Results Test
[ ] recipeCategory and recipeCuisine populated
[ ] Meta description under 155 chars
[ ] Slug confirmed, no stop words
[ ] Internal links (3–5) pointing to related pillar posts
[ ] Jump-to-Recipe button above fold

SEO / DISTRIBUTION
[ ] Pinterest: 3 pin descriptions scheduled (publish 30–60 days before peak if seasonal)
[ ] Email scheduled for Saturday evening or Sunday morning
[ ] Instagram caption + hashtags ready
[ ] TikTok/Reels script ready if shooting video
───────────────────────────────
```

---

## Seasonal calendar reference

Publish deadlines (go live by these dates for seasonal content):

| Holiday / Event | Go-live deadline | Pinterest pins start |
|---|---|---|
| US Thanksgiving | Early October | Early September |
| Christmas / Holiday | Early November | Early October |
| Super Bowl | Early January | Mid-December |
| Valentine's Day | Late January | Early January |
| Easter | Mid-February | Late January |
| Mother's Day | Late March | Early March |
| Summer grilling | Mid-April | Late March |
| Back-to-school | Early-to-mid July | Mid-June |
| Canadian Thanksgiving | Mid-September | Late August |
| Halloween | Late September | Early September |

**Traffic pattern:** Sundays are peak traffic. Q4 RPMs run 2–3× Q1. Plan for January trough.

---

## Content pipeline modes

### Mode A — Source ingestion (video/URL/file)
Use when: user drops a link, video, or file.
Output: Full post draft + recipe card + SEO package + social package + checklist.

### Mode B — From scratch
Use when: user describes a dish without a source.
Output: Same as Mode A, but all recipe card fields are `⚠️ USER-SUPPLIED — verify your cook`.

### Mode C — Post refresh
Use when: user provides an existing post to update.
- Identify: thin E-E-A-T sections, missing schema fields, outdated seasonal references, stock/missing photos.
- Rewrite intro and "Why this works" with technique authority.
- Expand FAQ to 5 Q&As if missing.
- Add `[INSERT]` placeholders where personal detail is absent.
- Update meta description and slug if sub-optimal.
- Output: revised post + updated checklist.

### Mode D — Seasonal content calendar
Use when: user asks for a content plan, calendar, or "what should I post next."
- Pull from seasonal calendar above.
- Suggest 8–12 post titles with target keywords and publish deadlines for the next 90 days.
- Flag 2–3 existing posts to refresh rather than create new.
- Format as a table: Title | Primary keyword | Target publish date | Pinterest start date | Post type (new/refresh).

### Mode E — Social-only
Use when: user has an existing post and wants social assets only.
Output: Pinterest pins (3) + IG caption + TikTok script + email subject lines + Substack teaser.

---

## Monetisation hooks (embed naturally, not as a block)

Per post, identify 1–3 natural affiliate opportunities:
- **Cookware:** Made In, Our Place, Caraway, Le Creuset, KitchenAid, Williams Sonoma (8–10% commissions via Impact/CJ/Partnerize)
- **Pantry/specialty:** Thrive Market ($30 bounty), ButcherBox ($20 bounty, 30-day cookie)
- **Books:** Bookshop.org (10–15%) over Amazon (4.5%) — for cookbook technique references
- **Amazon:** Use Geniuslink for dual .com/.ca links; Kitchen category pays 4.5%

Embed links in context: *"I use a [cast iron skillet](affiliate-link) for this — the heat retention is the whole point."* Never block-list products. Never recommend something you haven't used.

---

## What this skill never does

- Fabricates ingredient quantities or cook times. All unconfirmed values get ⚠️ VERIFY.
- Writes personal anecdotes. All personal moments get `[INSERT]` placeholders.
- Uses AI-generated food photography.
- Publishes without the pre-publish checklist being complete.
- Writes daily — pipeline produces drafts; human publishes 2–3×/week.
- Writes "ultimate," "best ever," "amazing," "you'll love this."
- Ignores seasonal timing. Always check the calendar before scheduling.
