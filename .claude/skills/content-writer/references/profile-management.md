# Profile Management System

Operational reference for managing writer profiles, products, CTAs, and case studies
in memory and on disk. Load this file when handling any `/writer:profile-*` command
or when needing to understand how profile data is stored, retrieved, or updated.

---

## Storage model: dual layer

All profile data lives in two places simultaneously:

| Layer | Speed | Persistence | Use for |
|-------|-------|-------------|---------|
| **Memory** (create_memory) | Fast, in-context | Session → persistent | Active lookups during generation |
| **Files** (`content-writer-output/profile/`) | Disk read required | Permanent | Backup, version control, portability |

**On save:** write file first, update memory second. If the file write fails, don't update memory.

**On load:** check memory first. If the key is missing, read the file and sync memory from it.

**On conflict (memory and file disagree):** file is authoritative. Always prefer the file. Update memory to match.

---

## Memory key conventions

All memory keys use these exact prefixes. Consistency matters — retrieval by prefix depends on it.

| Prefix | Contains |
|--------|---------|
| `[Content Writer]` | Core profile: identity, voice, audience, strategy, preferences |
| `[Content Writer Product]` | Individual product or service entries |
| `[Content Writer CTA]` | CTA templates by label |
| `[Content Writer Case Study]` | Case studies with rotation status |
| `[Content Writer Shortcode]` | Shortcode → value mappings |
| `[Content Writer Project]` | Active project state (cleared on ship) |

**Key format:** `[Content Writer] Voice` or `[Content Writer Product] MVP Sprint`

Keep each memory entry under 500 characters. Split long entries by sub-topic rather than
cramming everything into one entry.

---

## Profile data structure

### Core profile (`[Content Writer]` entries)

| Entry | What it holds |
|-------|--------------|
| `Name` | Full name and title |
| `Company` | Company name and domain |
| `Business` | 1–2 sentence description of what the company does |
| `Industry` | Industry/niche |
| `Audience` | Primary audience — be specific, not "marketers" |
| `Voice` | 3–5 adjectives + what to avoid |
| `Voice notes` | Style markers, writing idiosyncrasies, influences |
| `Content types` | List of formats they create |
| `Content pillars` | 3–5 recurring themes |
| `Content goals` | Primary objective (thought leadership, leads, SEO, etc.) |
| `Blog URL` | Canonical blog for tone calibration |
| `Article length` | Preferred word count range |
| `Output format` | Markdown / plain text / HTML |
| `Publishing workflow` | Sequence and timing across platforms |
| `[Platform] prefs` | Platform-specific formatting preferences |

### Product entry (`[Content Writer Product] [Name]`)

```
[Content Writer Product] MVP Sprint: 3-week validation process before building.
Customer interviews, landing page testing, paid pilots. $5K–$15K.
For: Early-stage founders. Use in content when: discussing validation, avoiding waste.
```

Required fields: name, 1-sentence description, price range or model, target customer,
trigger condition ("use when...").

### CTA entry (`[Content Writer CTA] [label]`)

```
[Content Writer CTA] soft_booking: Soft. "If you're dealing with this, let's talk.
Book 30 min — we'll tell you what we think even if the answer is 'you're fine.'"
Platforms: blog, LinkedIn. Link: https://cal.com/example
```

Required fields: label, type (soft/direct/specific offer), copy text, platform context, URL.

### Case study entry (`[Content Writer Case Study] [label]`)

```
[Content Writer Case Study] HealthTech Platform: Healthcare startup, 8 months dev,
zero users. Problem: built without validation. Approach: 30 provider interviews, found
different problem, 6-week focused MVP, 5 paid pilots. Outcome: $120K revenue in 6
months, 40 customers. NDA: no. Rotation: active.
```

Required fields: label, client context, problem, approach, outcome, NDA status, rotation
status. Testimonial quote optional.

### Shortcode entry (`[Content Writer Shortcode] [name]`)

```
[Content Writer Shortcode] booking_link: https://cal.com/example
[Content Writer Shortcode] cta:soft: [pulls from the soft_booking CTA entry]
```

---

## Commands reference

### `/writer:profile-create`

See the profile creation flow in SKILL.md. This file covers what gets stored afterward.

After completing the interview:

1. Save each section to memory immediately (don't batch — partial profiles are usable)
2. Write `content-writer-output/profile/PROFILE.md` with all core entries
3. Write separate files for products, CTAs, case studies
4. Confirm with user: "Profile saved. [N] products, [N] CTAs, [N] case studies."

### `/writer:profile-view`

1. Retrieve all memory entries with `[Content Writer]` prefix
2. Organize into sections: Identity → Voice → Audience → Strategy → Publishing
3. Show product count, CTA count, case study count with rotation breakdown
4. Flag any incomplete sections: "Missing: Blog URL, Newsletter prefs"

### `/writer:profile-edit [field]`

When the user says "update my voice" or "change the booking link" or "add a product":

1. Identify which memory key(s) are affected
2. Show current value: "Current: [value]"
3. Accept new value
4. Update memory and file simultaneously
5. Confirm: "Updated [field]."

Do not re-run the full interview for edits. Change only what was requested.

### `/writer:profile-delete`

1. List what will be deleted: "This will remove [N] profile entries, [N] products, [N] CTAs, [N] case studies."
2. Require explicit "yes, delete everything" confirmation
3. Delete all `[Content Writer]` memory entries
4. Delete profile files in `content-writer-output/profile/`
5. Confirm deletion

### Adding products, CTAs, case studies

Use `/writer:profile-edit` for all additions. The user can say:

- "Add a product" → prompt for the required fields, save to memory and file
- "Add a CTA" → prompt for label, type, copy, platform, URL
- "Add a case study" → prompt for context, problem, approach, outcome, NDA, set rotation to "active"
- "Edit the MVP Sprint product" → retrieve that entry, show current values, accept changes

---

## Shortcode system

Shortcodes are `{{name}}` placeholders replaced with actual content at generation time.

**Standard shortcode types:**

| Shortcode | Resolves to |
|-----------|-------------|
| `{{booking_link}}` | Booking URL from profile |
| `{{email}}` | Contact email |
| `{{website}}` | Company domain |
| `{{blog}}` | Blog URL |
| `{{cta:soft}}` | Soft CTA copy text |
| `{{cta:direct}}` | Direct CTA copy text |
| `{{cta:[label]}}` | Any named CTA by label |
| `{{case_study:[label]}}` | Case study URL or reference |
| `{{product:[name]}}` | Product page URL or reference |
| `{{author_name}}` | Author name from profile |
| `{{company_name}}` | Company name from profile |

**When to expand vs. leave as shortcode:**

- Default: expand to actual content (readers see the final version)
- Leave as shortcodes if user says "for CMS" or "I'll fill these in"
- Ask once at the start of a session if unclear, then remember the preference

---

## Case study rotation

Rotation prevents overusing the same client stories across multiple pieces.

| Status | Meaning | Action |
|--------|---------|--------|
| `active` | Use freely | Default for all new entries |
| `rest` | Used heavily recently | Avoid unless it's a perfect fit and nothing else works |
| `retired` | Outdated or no longer accurate | Never use |

**When to update rotation:**

- After a case study appears in 3+ pieces in one month → set to `rest`
- After 4–6 weeks with no use → return `rest` to `active`
- After a case study is more than 2 years old and the numbers no longer represent current work → set to `retired`

**At generation time:** when selecting case studies, filter `active` first. If none fit the specific topic, check `rest`. If still no fit, write around the gap or note to the user that no suitable case study exists.

---

## Before writing: profile load checklist

Run this before every generation task:

```
1. Retrieve [Content Writer] memory entries
   → Missing? Read from content-writer-output/profile/PROFILE.md
   → Still missing? Run /writer:profile-create

2. Verify minimum viable profile:
   - Name ✓
   - Audience ✓
   - Voice ✓
   - At least 1 CTA ✓
   
3. Load products, CTAs, case studies
   → Filter case studies: active only (unless topic demands otherwise)

4. Identify platform-specific preferences for this content type
   → LinkedIn: check [Content Writer] LinkedIn prefs
   → Newsletter: check [Content Writer] Newsletter prefs
   → etc.
```

**Minimum viable profile:** If name, audience, and voice are present, proceed. Don't block
generation for missing optional fields (article length, blog URL, publishing workflow).
Note what's missing and suggest completing it after the current task.

---

## Integration during content generation

### Voice application

Apply these profile values automatically — don't announce them to the user:

- **Voice adjectives** → tune sentence construction, level of directness, formality
- **Voice notes** → apply idiosyncrasies (use of "we" vs "I", specific phrases they use, topics they lean into)
- **What to avoid** → treat as a hard filter on word choice and framing
- **Blog URL** → fetch 1–2 recent posts to calibrate (only if the topic differs significantly from the user's usual content)

### Product references

Reference products naturally when the content topic overlaps with what the product solves.
Never force a product mention. If a piece has no natural product fit, don't include one.

When a product IS relevant:

- Mention by name, in context, not as an ad
- Use the "use when" trigger condition from the product entry as the qualifier
- CTA to the product comes at the end, not mid-sentence

### CTA placement by platform

| Platform | Embedded CTAs | Closing CTA | Link placement |
|----------|--------------|-------------|----------------|
| Blog article | 1–2 soft, mid-content | 1 direct, end | In text or at closing |
| LinkedIn | 0–1 soft, end of post | — | First comment |
| Twitter/X | 0 in tweet body | Soft ("DM me"), final tweet | Reply to thread |
| Facebook | 0–1 soft, end | — | First comment |
| Instagram | 1 soft, end of caption | "Link in bio" | Bio |
| Email / newsletter | 1–2 soft, inline | 1 direct, end | In text |

Use `{{cta:soft}}` and `{{cta:direct}}` shortcodes during generation, expand before ship.

---

## File structure

```
content-writer-output/
└── profile/
    ├── PROFILE.md          ← all core [Content Writer] entries
    ├── PRODUCTS.md         ← all product entries
    ├── CTAS.md             ← all CTA entries
    └── CASE-STUDIES.md     ← all case study entries with rotation status
```

Each file should be human-readable markdown — not just raw memory entry strings.
Format with headers and clear sections so the user can review and edit in any text editor.

**PROFILE.md format:**

```markdown
# Writer Profile

## Identity
- Name: [Name], [Title]
- Company: [Company] — [domain]
- Industry: [Industry]

## Audience
[Description]

## Voice
Tone: [adjectives]
Avoid: [list]
Notes: [idiosyncrasies]

## Content Strategy
Types: [list]
Pillars: [list]
Goal: [primary goal]

## Publishing
Blog: [URL]
Article length: [range]
Output format: [format]
Workflow: [sequence]
```

---

## Edge cases

**Profile exists in memory but file is missing:**
Recreate the file from memory entries. Warn the user: "Profile file was missing — recreated from memory. Recommend saving the profile directory."

**File exists but memory is empty (new session):**
Read from file, populate memory. This is the normal cold-start behavior — don't prompt for profile creation when the file is there.

**User says "I moved offices" or "we changed our pricing":**
Treat as an edit. Identify which fields are affected, update both memory and file, confirm.

**Case study client asked to be removed:**
Set rotation to `retired`. Don't delete — the structure is still useful for reference. If the user explicitly says "delete it," delete from both memory and file.

**User adds a 10th product:**
No limit. But if the product list grows beyond ~8 entries, ask whether older products should be retired or archived — context windows have limits, and loading 10 product entries on every generation task adds noise.

**Profile is 80% complete but user wants to write now:**
Generate with what exists. Note at the end: "Missing: Newsletter prefs, Blog URL. Add these with /writer:profile-edit."

**Shortcode used in content but not in profile:**
Flag it before shipping: "{{shortcode_name}} in the content doesn't have a defined value. What should it resolve to?"
