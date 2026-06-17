---
name: writer:execute
description: Generate content following the plan, applying selected framework, brand voice, and platform conventions
---

# /writer:execute — Generate Content

@~/.claude/skills/shared-context.md

## Objective

Write the content. Every structural and strategic decision was made in discuss and plan. This phase is execution — follow the plan, apply the voice, produce the draft.

## Step 1: Load all state

Load from memory:
- `[Content Writer] Current Project - Plan` — outline, SEO, proof points, CTA placement
- `[Content Writer] Current Project - Discussion` — platform, framework, audience, goal
- Writer profile: voice adjectives, avoid list, voice notes

If plan state is missing: "No plan found. Run `/writer:plan` first."

## Step 2: Load platform conventions

From the plan state, identify the platform conventions file and load it:

| Platform | File |
|----------|------|
| Blog / web pages / landing pages | `references/web-content-conventions.md` |
| Email (newsletters, campaigns, sequences) | `references/email-content-conventions.md` |
| LinkedIn | `references/content-frameworks.md` (LinkedIn section) |
| Twitter / X | `references/twitter-conventions.md` |
| Facebook | `references/facebook-conventions.md` |
| Instagram | `references/instagram-conventions.md` |
| Sales pages, case studies, testimonials | `references/sales-content-conventions.md` |
| SEO metadata | `references/seo-meta-conventions.md` |

Load only the file(s) needed. Do not load all files.

## Step 3: Write section by section

Follow the outline exactly. For each section:

1. Write the section's core point first — one clear statement
2. Add the proof: specific number, named case study, concrete scenario
3. Expand with supporting detail if the section has word count to fill
4. Transition to the next section naturally — no "In the next section" throat-clearing

**Core writing principles:**
- Active voice throughout
- Specific over vague: "saved $40K in Q1" not "saved money"
- Show don't tell: scenario > summary
- Vary sentence length: short punchy sentences alongside longer explanatory ones
- Mirror the audience's language: use the phrases from research, not marketing polish
- Every CTA is first-person: "Start my project" not "Start your project"

## Step 4: Apply anti-AI discipline while writing

These patterns kill credibility. Catch them as you write, not after:

- Em dashes (—) → use periods or line breaks
- "Delve," "leverage," "robust," "seamless," "crucial," "foster," "landscape"
- Negative parallelism: "It's not just X — it's Y"
- Rule of three in every paragraph
- Symmetric list structures with identical openings
- Generic inspirational conclusions
- Throat-clearing openers: "In today's fast-paced world..."
- Vague attributions: "Studies show..." → name the study

Full pattern list in `references/anti-ai-checklist.md` — load it if unsure.

## Step 5: Insert CTAs

Follow CTA placement from the plan state. Use the shortcode labels from the profile:
- `{{cta:soft}}` for embedded soft CTAs
- `{{cta:direct}}` for closing CTAs
- Expand to actual copy at this stage (or leave as shortcodes if user specified CMS integration in discussion)

First-person CTA copy: "Book my call" not "Book a call." "Get the full framework" not "Download our guide."

## Step 6: Apply platform formatting

Follow the loaded conventions file for the exact formatting rules. Key defaults:
- Blog: H2 every 300–400 words, 2–3 sentence paragraphs max
- LinkedIn: line break every 2–3 lines, link in first comment noted in publishing notes
- Twitter/X: numbered tweets (1/N), links in reply to thread — never in tweet body
- Instagram: hook in first 125 characters, line breaks every 2–3 lines
- Email: mobile-first structure, preheader in first 1–2 lines of body

## Step 7: Save draft state

Save to memory as `[Content Writer] Current Project - Draft`:

```
content: [full draft text]
word_count: [count]
platform: [platform]
format: [format]
framework_used: [framework]
cta_expanded: [yes/no — whether shortcodes were expanded]
```

Present the full draft. Then instruct:
**Run `/writer:verify` or `/writer:next` to quality-check the content.**
