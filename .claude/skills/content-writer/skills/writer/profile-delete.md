---
name: writer:profile-delete
description: Delete the writer profile and all associated data — requires explicit confirmation
---

# /writer:profile-delete — Delete Profile

@~/.claude/skills/shared-context.md

## Objective

Permanently delete the writer profile from memory and disk. Cannot be undone.

## Step 1: Load and inventory what will be deleted

Retrieve all memory entries with `[Content Writer]` prefix. Count:
- Core profile entries: N
- Products: N
- CTAs: N
- Case studies: N
- Shortcodes: N

Check for files in `content-writer-output/profile/`:
- PROFILE.md
- PRODUCTS.md
- CTAS.md
- CASE-STUDIES.md

## Step 2: Show exactly what gets deleted

> "This will permanently delete:
> - [N] core profile entries (identity, voice, audience, strategy)
> - [N] products
> - [N] CTAs
> - [N] case studies
> - Profile files in content-writer-output/profile/
>
> Content files in content-writer-output/ (blog, linkedin, etc.) are NOT deleted.
>
> This cannot be undone. Type 'yes, delete everything' to confirm, or anything else to cancel."

## Step 3: Execute only on explicit confirmation

The user must type exactly the confirmation phrase or an equivalent explicit statement ("yes delete it," "go ahead," "confirmed"). Any ambiguous response cancels.

If cancelled: "Deletion cancelled. Profile unchanged."

## Step 4: Delete

On confirmed deletion:

1. Delete all `[Content Writer]` memory entries (profile, products, CTAs, case studies, shortcodes)
2. Delete the four profile files from `content-writer-output/profile/`
3. Do NOT touch content output files in other directories

## Step 5: Confirm

> "Profile deleted. Run `/writer:profile-create` to start fresh."

Do not add "I'm sorry to see it go" or other filler. Just confirm and instruct.
