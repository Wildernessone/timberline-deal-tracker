---
name: writer:verify
description: Quality check — SEO optimization, anti-AI audit, and manual review before shipping
---

# /writer:verify — Verify Content Quality

@~/.claude/skills/shared-context.md

## Objective

Catch every problem before the content ships. SEO check, anti-AI audit, and a manual quality pass. Nothing leaves this phase that wouldn't hold up to scrutiny.

## Step 1: Load draft

Load `[Content Writer] Current Project - Draft` from memory.

If missing: "No draft found. Run `/writer:execute` first."

Also load `references/anti-ai-checklist.md` — this phase always uses it.

## Step 2: SEO check

**If claude-seo is available:**
- Run `/seo:analyze` on the content
- Present findings with scores
- Ask: "Apply recommendations? (yes / no / manual)"
- Apply approved changes and note them

**If claude-seo is not available:**
- Run a manual SEO check:
  - [ ] Primary keyword appears in: title/headline, first 100 words, at least one H2, meta description
  - [ ] Meta title is under 60 characters and front-loads the keyword
  - [ ] Meta description is 150–160 characters and includes the keyword
  - [ ] URL slug is lowercase, hyphened, and contains the primary keyword
  - [ ] No keyword stuffing — reads naturally
  - [ ] Internal/external links included where appropriate
  - [ ] Image alt text suggestions included (for blog articles)
- Note: "claude-seo not available — manual SEO check applied."

Skip SEO check entirely for content types with no search intent (social posts, email newsletters).

## Step 3: Anti-AI audit

**If humanizer is available:**
- Run `/humanizer:audit` on the content
- Present pattern count by category
- Ask: "Apply fixes? (yes / no / manual)"
- Apply approved fixes

**If humanizer is not available:**
- Run the manual anti-AI checklist from `references/anti-ai-checklist.md`
- Work through these categories in order:
  1. Vocabulary: scan for the red-flag word list
  2. Structure: check for symmetric list overuse, rule-of-three in every section
  3. Punctuation: count em dashes — maximum 1 per 500 words
  4. Opening: does any section begin with a throat-clearing phrase?
  5. Endings: does any section end with generic inspiration or vague stakes?
  6. Attributions: are all statistics named and sourced?
  7. Voice: does this sound like the writer's profile adjectives, or like a content farm?

Report what was found and fixed. If everything is clean, say so explicitly — don't leave the user guessing.

## Step 4: Quality checklist

Manual check — these can't be automated:

**Content quality:**
- [ ] Achieves the stated goal from the discussion phase
- [ ] Follows the selected framework's structure (verify against `references/content-frameworks.md`)
- [ ] Every claim is specific — no vague superlatives, no "many companies"
- [ ] Social proof is attributed: named person, title, company
- [ ] At least one proof point is internal (case study or direct experience from the profile)
- [ ] The hook (first line or headline) is strong enough to stop the scroll

**Voice quality:**
- [ ] Matches the profile's voice adjectives
- [ ] Avoids everything on the profile's "avoid" list
- [ ] Reads like the writer, not like a report

**Platform compliance:**
- [ ] Formatting matches the platform conventions file loaded during execute
- [ ] CTAs are correct type, correctly placed, first-person copy
- [ ] Link placement follows platform rules (first comment vs. body vs. bio)
- [ ] Character/word count is within the optimal range for this platform and format

## Step 5: Apply all fixes

Compile all changes from SEO, anti-AI, and manual checks. Apply to the content in one pass — don't present three separate revised versions. Present the final corrected content once.

## Step 6: Save verified state

Save to memory as `[Content Writer] Current Project - Verified`:

```
content: [final corrected content]
word_count: [count]
seo_score: [score if claude-seo ran, or "manual" if not]
ai_patterns_fixed: [count or "none found"]
manual_check: passed
```

Present the verified draft. Then instruct:
**Run `/writer:ship` or `/writer:next` to save and deliver.**
