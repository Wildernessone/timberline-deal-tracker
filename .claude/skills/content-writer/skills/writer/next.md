---
name: writer:next
description: Auto-advance to the next phase — detects current state and runs the appropriate command
---

# /writer:next — Auto-Advance

@~/.claude/skills/shared-context.md

## Objective

Detect current workflow state from memory and run the next phase automatically. One command instead of five.

## Phase detection logic

Check memory in this sequence:

1. **No profile** (`[Content Writer]` entries missing)
   → Run `/writer:profile-create`
   → Message: "No profile found. Let's set that up first."

2. **Profile exists, no project** (`[Content Writer] Current Project - Discussion` missing)
   → Run `/writer:discuss`
   → Message: "No active project. Starting discussion phase."

3. **Discussion exists, no plan** (`[Content Writer] Current Project - Plan` missing)
   → Run `/writer:plan`
   → Message: "Discussion complete. Moving to plan."

4. **Plan exists, no draft** (`[Content Writer] Current Project - Draft` missing)
   → Run `/writer:execute`
   → Message: "Plan complete. Generating content."

5. **Draft exists, not verified** (`[Content Writer] Current Project - Verified` missing)
   → Run `/writer:verify`
   → Message: "Draft complete. Running quality check."

6. **Verified content exists**
   → Run `/writer:ship`
   → Message: "Verified. Shipping content."

7. **All keys cleared** (project was shipped)
   → Message: "Workflow complete. Run `/writer:discuss` to start a new project."

## Execution

Do not pause between detection and execution. Detect the state, announce the phase in one line, then immediately run it.

Do not ask "Should I continue?" — that's what this command is for.
