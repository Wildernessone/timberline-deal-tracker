---
name: writer:profile-view
description: Display the complete current writer profile — identity, voice, products, CTAs, and case studies
---

# /writer:profile-view — View Profile

@~/.claude/skills/shared-context.md

## Objective

Display the full writer profile in a readable format. Useful for reviewing what's on file before a writing session or after editing.

## Step 1: Load profile

Retrieve all `[Content Writer]` memory entries.

If memory is empty:
- Check for `content-writer-output/profile/PROFILE.md`
- If file exists: read it, populate memory from file, then display
- If neither exists: "No profile found. Run `/writer:profile-create` to set one up."

## Step 2: Display

Present organized by section — not as raw memory key strings:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Writer Profile — [Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IDENTITY
  Name:     [Name, Title]
  Company:  [Company] — [domain]
  What:     [1–2 sentence company description]
  Industry: [Industry/niche]

AUDIENCE
  Primary:  [Specific audience description]
  Pain points: [list]
  Goals:    [list]
  Objections: [list]

VOICE
  Tone:     [adjectives]
  Avoid:    [list]
  Notes:    [idiosyncrasies, influences]

CONTENT STRATEGY
  Types:    [formats they create]
  Pillars:  [3–5 themes]
  Goal:     [primary content objective]
  Blog URL: [URL or "not set"]
  Length:   [preferred word count range]
  Format:   [Markdown / plain text / HTML]

PUBLISHING
  Workflow: [sequence and timing]
  [Platform-specific prefs if set]

PRODUCTS ([N] total)
  [Name]: [1-sentence description] — [price range]
  [Name]: ...

CTAs ([N] total)
  [label] ([type]): "[copy text]" → [URL]
  [label] ...

CASE STUDIES ([N] total — [N] active, [N] resting, [N] retired)
  [label] ([rotation]): [brief outcome summary]
  [label] ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files: content-writer-output/profile/
```

## Step 3: Surface gaps

After displaying the profile, note any missing sections that affect content quality:

- Missing blog URL → "Voice calibration won't use existing content — consider adding one."
- No case studies → "No case studies on file — content will lack internal proof points."
- No CTAs → "No CTAs defined — generic placeholder will be used in content."
- Only retired case studies → "All case studies are retired — no active proof points available."

Don't block anything. Just surface it.
