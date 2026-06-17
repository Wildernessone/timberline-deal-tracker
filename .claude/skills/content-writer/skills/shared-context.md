# Content Writer — Shared Context

Loaded by every `/writer:` command via `@`. Contains the conventions every command
needs: paths, memory keys, workflow state schema, quick-reference anti-AI patterns,
and integration points. Do not add command-specific logic here.

---

## Profile enforcement

**No content is generated without a writer profile.**

On every command, check for `[Content Writer] Name` in memory. If missing:

1. Check `content-writer-output/profile/PROFILE.md`
2. If file exists — load it into memory, proceed
3. If neither exists — redirect to `/writer:profile-create` before anything else

Exception: profile commands (`/writer:profile-create`, `/writer:profile-view`,
`/writer:profile-edit`, `/writer:profile-delete`) run without a profile present.

---

## Memory keys

All memory uses these exact key formats. Consistency is required — retrieval is prefix-based.

### Profile data

| Key | Contains |
|-----|---------|
| `[Content Writer] Name` | Name and title |
| `[Content Writer] Company` | Company name and domain |
| `[Content Writer] Business` | 1–2 sentence company description |
| `[Content Writer] Industry` | Industry/niche |
| `[Content Writer] Audience` | Primary audience (specific) |
| `[Content Writer] Voice` | Tone adjectives and avoid list |
| `[Content Writer] Voice notes` | Style idiosyncrasies and influences |
| `[Content Writer] Content types` | Formats they create |
| `[Content Writer] Content pillars` | 3–5 recurring themes |
| `[Content Writer] Content goals` | Primary objective |
| `[Content Writer] Blog URL` | Canonical blog for voice calibration |
| `[Content Writer] Article length` | Preferred word count range |
| `[Content Writer] Output format` | Markdown / plain text / HTML |
| `[Content Writer] Publishing workflow` | Sequence and timing |
| `[Content Writer] [Platform] prefs` | Platform-specific formatting prefs |
| `[Content Writer Product] [Name]` | Individual product/service entry |
| `[Content Writer CTA] [label]` | CTA template entry |
| `[Content Writer Case Study] [label]` | Case study entry with rotation status |
| `[Content Writer Shortcode] [name]` | Shortcode → value mapping |

### Project state (cleared after ship, never after profile ops)

| Key | Set by | Contains |
|-----|--------|---------|
| `[Content Writer] Current Project - Discussion` | `/writer:discuss` | Platform, format, topic, angle, audience, awareness stage, goal, framework, CTA label, research URLs, key points |
| `[Content Writer] Current Project - Plan` | `/writer:plan` | Full outline, SEO (keyword/meta/slug), platform conventions file loaded, framework, voice notes, proof points, CTA placement |
| `[Content Writer] Current Project - Draft` | `/writer:execute` | Full draft content, word count, platform, format, framework used, CTA expansion status |
| `[Content Writer] Current Project - Verified` | `/writer:verify` | Final corrected content, word count, SEO score, AI patterns fixed count, manual check: passed |

---

## File paths

### Profile files

```
content-writer-output/profile/
├── PROFILE.md        ← all [Content Writer] core entries in readable markdown
├── PRODUCTS.md       ← all [Content Writer Product] entries
├── CTAS.md           ← all [Content Writer CTA] entries
└── CASE-STUDIES.md   ← all [Content Writer Case Study] entries + rotation status
```

### Content output

```
content-writer-output/
├── blog/
├── linkedin/
├── twitter/
├── facebook/
├── instagram/
├── email/
├── sales/
├── seo/
└── packages/[name]/
```

### Filename format

`NNN-[slug].md` where NNN auto-increments within the type directory.

Example: `001-mvp-validation-framework.md`, `014-linkedin-hiring-post.md`

---

## Reference files

Load only what the current command needs. Never load all at once.

| File | Load when |
|------|-----------|
| `references/content-frameworks.md` | Plan phase — framework selection and outline structure |
| `references/anti-ai-checklist.md` | Verify phase — always; Execute phase — if unsure |
| `references/seo-meta-conventions.md` | Any content with search intent |
| `references/web-content-conventions.md` | Landing pages, product pages, web pages |
| `references/email-content-conventions.md` | Newsletters, campaigns, sequences |
| `references/twitter-conventions.md` | Twitter/X tweets and threads |
| `references/facebook-conventions.md` | Facebook posts |
| `references/instagram-conventions.md` | Instagram captions |
| `references/sales-content-conventions.md` | Sales pages, funnels, case studies, testimonials, proposals |
| `references/research-workflow.md` | Plan phase — if deep research is needed |
| `references/profile-management.md` | Any profile command — memory conventions and edge cases |

---

## Framework quick-reference

Full detail in `references/content-frameworks.md`. Quick selection:

| Use case | Framework |
|----------|-----------|
| Sales pages, landing pages | AIDA or PASTOR |
| Problem-focused content, cold outreach | PAS |
| Transformation stories, case studies | BAB |
| Thought leadership | LEMA or SCQA |
| Long-form articles | 4-Point |
| Conversion-focused pages | CONVERT |
| Features/product-focused | FAB |

---

## Storage rules

1. **Write order:** file first, memory second. If file write fails, do not update memory.
2. **Load order:** check memory first. If key is missing, read from file. Sync memory from file.
3. **Conflict resolution:** file is authoritative. Update memory to match.
4. **Max entry size:** 500 characters per memory entry. Split long entries by sub-topic.

---

## Output frontmatter

Every shipped file includes this YAML block at the top:

```yaml
---
title: [Headline or post opening]
platform: [platform]
format: [blog article / LinkedIn post / Twitter thread / etc.]
framework: [framework used]
word_count: [count]
created: [YYYY-MM-DD]
author: [name from profile]
company: [company from profile]
status: draft
seo:
  meta_title: [meta title]
  meta_description: [meta description]
  primary_keyword: [keyword]
  slug: [URL slug]
---
```

Omit the `seo:` block for social posts and email content where search intent is absent.

---

## Anti-AI quick-reference

Catch these while writing. Full pattern taxonomy in `references/anti-ai-checklist.md`.

**Vocabulary kills:**
`delve` · `leverage` · `robust` · `seamless` · `crucial` · `foster` · `landscape` ·
`realm` · `pivotal` · `groundbreaking` · `comprehensive` · `vital` · `showcase`

**Structural tells:**

- Em dash overuse (—) → use periods or line breaks; max 1 per 500 words
- Rule of three in every paragraph → vary to two, or four, or one strong point
- Symmetric list structures with identical sentence openings
- Negative parallelism: "It's not just X — it's Y"
- Throat-clearing openers: "In today's fast-paced world..." / "In an era where..."
- Generic inspirational endings: "The possibilities are endless." / "The future is bright."
- Vague attributions: "Studies show..." / "Experts say..." → name the source

**Voice tests:**

- Read it aloud. If it sounds like a press release, rewrite it.
- Count em dashes. More than one per 500 words is too many.
- Find the most interesting sentence. If it's not the first sentence, move it.

---

## Integration points

### claude-seo

- Phase: Verify
- Command: `/seo:analyze`
- Fallback: manual checklist in `/writer:verify` when not available

### humanizer

- Phase: Verify
- Command: `/humanizer:audit`
- Fallback: manual audit using `references/anti-ai-checklist.md` when not available

---

## Update check

Run once per session, before the first command executes.

1. Read `~/.claude/skills/content-writer/.version`
2. Run `npm view claude-content-writer version`
3. If newer version available and `updateNotificationShown` not in session memory:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 Content Writer Update Available
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Current: v{current}  →  Latest: v{latest}
  Run /writer:update to upgrade.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Set `updateNotificationShown = true` in session memory. Do not check again this session.
Then continue with the user's command — do not block on the notification.

---

## Workflow phase state machine

For `/writer:next` and `/writer:status` phase detection:

```
No profile
  → /writer:profile-create

Profile exists, no Discussion key
  → /writer:discuss

Discussion exists, no Plan key
  → /writer:plan

Plan exists, no Draft key
  → /writer:execute

Draft exists, no Verified key
  → /writer:verify

Verified exists
  → /writer:ship

All project keys cleared
  → Workflow complete. Run /writer:discuss for a new project.
```
