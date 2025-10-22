# start-task

You are given the following context:
$ARGUMENTS

## Instructions

Follow the explore->plan->code framework for tackling this complex task:

### Phase 1: EXPLORE
1. **Understand the requirement**: Clarify what needs to be done and why
2. **Search the codebase**: Use Grep and Glob to find relevant files, patterns, and existing implementations
3. **Read key files**: Use Read to examine the current implementation and understand the architecture
4. **Check documentation with Context7 MCP**:
   - If the task involves a library or framework (Next.js, React, Tailwind, shadcn/ui, etc.), use Context7 MCP to get current documentation
   - Example: `mcp__context7__resolve-library-id` then `mcp__context7__get-library-docs`
   - This ensures you have accurate, up-to-date information before planning
5. **Identify dependencies**: Note what files, components, services, or systems will be affected
6. **Ask clarifying questions**: If anything is unclear, ask the user before proceeding

### Phase 2: PLAN
1. **Write a detailed plan** to `tasks/todo.md` that includes:
   - Summary of the task and its goals
   - List of specific files that need to be created/modified
   - Detailed todo items (actionable, specific tasks)
   - Any potential risks or considerations
   - Expected outcome

2. **Present the plan** to the user and wait for approval before proceeding

3. **Use TodoWrite tool** to track progress with the todo items from your plan

### Phase 3: CODE
1. **Work through todo items systematically**:
   - Mark each item as `in_progress` before starting
   - Complete one task at a time
   - Mark as `completed` immediately after finishing
   - Commit logical chunks of work as you go

2. **Use appropriate MCP tools**:
   - **For database operations**: Always use Supabase MCP tools
     - `mcp__supabase__list_tables` to check current schema
     - `mcp__supabase__apply_migration` for schema changes (CREATE, ALTER, DROP)
     - `mcp__supabase__execute_sql` for data queries (SELECT, INSERT, UPDATE, DELETE)
     - `mcp__supabase__generate_typescript_types` after schema changes
   - **For library questions**: Use Context7 MCP to get documentation
     - Don't rely on assumptions when official docs are available

3. **Test as you go**: Run builds, tests, or the dev server to verify changes work

4. **Handle errors**: If you encounter issues, update the plan and continue

5. **Final review**: Once complete, add a review section to `tasks/todo.md` summarizing:
   - What was changed and why
   - Any deviations from the original plan
   - Suggested next steps or follow-ups

## Important Notes
- Always explore FIRST before planning
- Always get plan approval BEFORE coding
- Use TodoWrite tool throughout to track progress
- Make commits at logical points
- Follow the architectural patterns documented in CLAUDE.md
