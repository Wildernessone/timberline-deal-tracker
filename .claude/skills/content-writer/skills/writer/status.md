---
name: writer:status
description: Show current workflow phase, profile status, dependency availability, and next step
---

# /writer:status — Current Status

@~/.claude/skills/shared-context.md

## Objective

Give the user a complete snapshot of the current state: what's loaded, where in the workflow they are, and what to do next.

## Step 1: Gather state

Check memory for:
- `[Content Writer]` entries → profile loaded?
- `[Content Writer] Current Project - Discussion` → discuss complete?
- `[Content Writer] Current Project - Plan` → plan complete?
- `[Content Writer] Current Project - Draft` → draft complete?
- `[Content Writer] Current Project - Verified` → verified?

Check tool availability:
- claude-seo: available or not
- humanizer: available or not

## Step 2: Determine current phase

| State | Current phase | Next step |
|-------|--------------|-----------|
| No profile | Not started | `/writer:profile-create` |
| Profile, no project | No active project | `/writer:discuss` |
| Discussion complete, no plan | Discuss ✓ | `/writer:plan` |
| Plan complete, no draft | Plan ✓ | `/writer:execute` |
| Draft complete, not verified | Execute ✓ | `/writer:verify` |
| Verified, not shipped | Verify ✓ | `/writer:ship` |

## Step 3: Display

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Content Writer Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Profile:   [Name at Company] / Not loaded
  Products:  [N] / None
  CTAs:      [N] / None
  Cases:     [N active, N resting] / None

  Workflow:
  [✓] Discuss   — [topic, if set]
  [✓] Plan      — [framework, if set]
  [✓] Execute   — [word count, if generated]
  [✓] Verify    — [ai patterns fixed, seo score]
  [ ] Ship

  Next:      /writer:[command]

  Dependencies:
  claude-seo:  [available / not available]
  humanizer:   [available / not available]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Show checkmarks only for completed phases. Leave uncompleted phases as `[ ]`. Don't show phases that haven't been reached yet if it makes the display confusing — show at minimum the current phase and next step.
