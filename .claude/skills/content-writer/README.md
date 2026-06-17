# content-writer

> A structured workflow skill for Claude Code that orchestrates content creation
> from brief to published draft — with built-in SEO checks and anti-AI-pattern auditing.

[![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)](https://github.com/sociilabs/claude-content-writer)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## What it does

`content-writer` adds a `/writer` command namespace to Claude Code. It runs content
production through five sequential phases — discuss, plan, execute, verify, ship — so
each piece goes through the same structured process instead of a single "write me a
blog post" prompt.

It does three things the default Claude workflow doesn't:

1. **Captures your brand voice first** — builds a profile before generating anything,
   so output reflects your tone rather than generic defaults.
2. **Runs a built-in SEO pass** — keyword targeting, meta tags, and title optimization
   happen during the verify phase, not as an afterthought.
3. **Audits for AI writing patterns** — flags and removes the ~25 most common markers
   that make AI-written content recognizable (via the `humanizer` dependency).

---

## Who it's for

- **Founders and operators** producing content regularly without a dedicated writer
- **Developers building content pipelines** who want a repeatable, auditable process
- **Agencies and consultants** managing content for multiple brands with different voices
- **Claude Code users** who already use slash commands and want content to fit that workflow

If you write content once a week and don't have a process problem, this is overkill.
If you're producing content at volume and want consistent quality without manually
quality-checking every draft, this is for you.

---

## Install

```bash
npx skills add sociilabs/claude-content-writer
```

Verify the install:

```
/writer:help
```

---

## Quick start

```
# 1. Create your voice profile (required before first use)
/writer:profile-create

# 2. Start a content project
/writer:discuss "blog post about SaaS pricing strategies"

# 3. Move through the phases
/writer:plan
/writer:execute
/writer:verify
/writer:ship
```

Each phase outputs what you need to move to the next one. You can stop, review,
and continue — nothing runs automatically without your input.

---

## The five phases

| Phase | What it does | Output |
|-------|-------------|--------|
| **Discuss** | Gathers topic, platform, audience, goals | Content brief |
| **Plan** | Outlines structure, researches SEO strategy, maps examples | Detailed plan + keyword targets |
| **Execute** | Generates content following the plan, calibrated to your profile | Complete draft |
| **Verify** | Runs SEO check and AI-pattern audit | Quality report with specific issues |
| **Ship** | Saves to file with metadata, generates publishing checklist | Production-ready file |

---

## Commands

### Workflow

| Command | Description |
|---------|-------------|
| `/writer:discuss [topic]` | Start a new content project |
| `/writer:plan` | Research and build execution strategy |
| `/writer:execute` | Generate the content |
| `/writer:verify` | Run SEO and anti-AI-pattern checks |
| `/writer:ship` | Save final output with publishing notes |

### Profile management

| Command | Description |
|---------|-------------|
| `/writer:profile-create` | Build your voice profile (URL scan + questionnaire) |
| `/writer:profile-view` | Display current profile |
| `/writer:profile-edit` | Update existing profile |
| `/writer:profile-delete` | Remove current profile |

### Utilities

| Command | Description |
|---------|-------------|
| `/writer:status` | Show current phase and profile status |
| `/writer:help` | List all commands |

---

## Content types supported

**Long-form**
Blog articles (1,500–2,500 words), landing pages (1,000–2,500 words),
case studies (1,000–2,000 words), web pages, product pages

**Short-form**
LinkedIn posts, Twitter/X (single or thread), Instagram captions,
Facebook posts, product descriptions, testimonials

**Email**
Newsletters, campaign emails, nurture sequences (3–10 emails)

**SEO assets**
Meta descriptions, title tags, schema markup

---

## Voice profile system

The profile is what separates this from a generic "write content" prompt.

When you run `/writer:profile-create`:

1. Claude scans a URL you provide to detect existing tone and style
2. You answer a 10-step questionnaire covering audience, vocabulary, tone preferences, and what to avoid
3. Optionally paste writing samples for direct voice calibration

The profile is stored locally and applied to every `/writer:execute` call.
You can maintain separate profiles for different brands or clients.

You cannot run `/writer:execute` without a profile. This is intentional.

---

## Dependencies

The skill auto-installs two dependencies on setup:

| Dependency | Purpose | Source |
|-----------|---------|--------|
| `claude-seo` | SEO optimization — keywords, meta tags, title scoring | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) |
| `humanizer` | Detects and rewrites ~25 AI writing pattern types | [blader/humanizer](https://github.com/blader/humanizer) |

Both are MIT licensed and can be used independently.

---

## Example: Full blog article workflow

```
/writer:discuss "comparison post: Stripe vs Paddle for SaaS founders"

→ [Profile check: passes]
→ [Clarify: audience = bootstrapped founders, goal = SEO + newsletter, ~2,000 words]

/writer:plan
→ [Outline: 7 sections, target keywords identified, 3 comparison tables planned]

/writer:execute
→ [2,100-word draft generated, formatted for the web, CTAs inserted]

/writer:verify
→ [SEO: primary keyword density 1.4% ✓, meta description: generated ✓]
→ [Anti-AI audit: 3 patterns flagged and rewritten]

/writer:ship
→ [Saved to ./output/stripe-vs-paddle-2025.md with front matter and publishing checklist]
```

---

## Troubleshooting

**"Profile not found"**
Run `/writer:profile-create`. The profile is required before generation.

**"SEO check fails"**
Manually install: `npx skills add AgriciDaniel/claude-seo`

**"Anti-AI audit fails"**
Manually install: `npx skills add blader/humanizer`

**Output doesn't reflect your tone**
Update your profile with more writing samples: `/writer:profile-edit`.
Paste 2–3 paragraphs you've written that represent how you actually sound.

---

## Contributing

Issues and PRs are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).
Good first issues are labeled accordingly.

---

## License

MIT — see [LICENSE](LICENSE)

---

**Made by [SociiLabs](https://sociilabs.com)**
