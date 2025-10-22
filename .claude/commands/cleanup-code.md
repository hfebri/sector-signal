# cleanup-code

You are given the following context:
$ARGUMENTS

## Instructions

Perform a thorough code cleanup to remove bloat and improve code quality. Follow this systematic approach:

### Phase 1: IDENTIFY BLOAT

1. **Unused imports**: Check for imports that are no longer used
2. **Dead code**: Look for commented-out code, unused functions, or unreachable code
3. **Console logs**: Find and remove debug console.log statements
4. **Duplicate code**: Identify repeated logic that should be refactored
5. **Unnecessary comments**: Remove obvious or outdated comments
6. **Empty files**: Find files with no meaningful content
7. **Redundant type definitions**: Look for duplicate or unnecessary type definitions
8. **Over-engineered solutions**: Identify code that can be simplified

### Phase 2: ANALYZE FILES

Review the files specified in $ARGUMENTS (or recent git changes if not specified):

1. Use `git diff` to see recent changes if no files specified
2. Read each file and identify cleanup opportunities
3. Check for linting issues with `npm run lint`
4. Look for TypeScript errors with `npx tsc --noEmit`

### Phase 3: CLEAN UP

For each issue found:

1. **Remove unused imports** - Clean up import statements
2. **Delete dead code** - Remove commented code and unused functions
3. **Remove debug logs** - Delete console.log/console.error used for debugging
4. **Simplify logic** - Refactor overly complex code
5. **Fix formatting** - Ensure consistent code style
6. **Update comments** - Keep only valuable, non-obvious comments
7. **Consolidate duplicates** - Merge duplicate code into reusable functions
8. **Check for MCP tool usage** - Ensure database operations use Supabase MCP instead of raw SQL/Drizzle where appropriate

### Phase 4: VERIFY

1. **Run linter**: `npm run lint` to ensure code quality
2. **Type check**: `npx tsc --noEmit` to verify TypeScript
3. **Test build**: `npm run build` to ensure nothing broke
4. **Database validation** (if database-related changes):
   - Use `mcp__supabase__list_tables` to verify schema is intact
   - Use `mcp__supabase__list_migrations` to ensure migrations are correct
   - Check that code uses Supabase MCP tools instead of raw SQL where appropriate
   - Verify TypeScript types are up-to-date with `mcp__supabase__generate_typescript_types` if needed
5. **Review changes**: Show a summary of what was cleaned up

### Phase 5: DOCUMENT IN CLAUDE.MD

After completing the cleanup, add documentation to CLAUDE.md:

1. **Summarize cleanup**: Create a concise summary of all changes made
2. **List removed items**: Document what was removed (imports, functions, files)
3. **Note improvements**: Highlight any refactoring or simplifications
4. **Impact assessment**: Note if any breaking changes or significant modifications were made
5. **Next steps**: Suggest any follow-up improvements or related cleanup tasks

Update the CLAUDE.md file with a timestamped entry documenting this cleanup session.

## Important Notes

- Be conservative - only remove what is clearly unnecessary
- Don't remove TODO comments or important documentation
- Preserve code that appears to be work-in-progress unless explicitly told otherwise
- Always verify the code still works after cleanup
- Ask before making large structural changes

## Usage Examples

- `/cleanup-code` - Clean up recent changes
- `/cleanup-code components/ui/badge.tsx` - Clean specific file
- `/cleanup-code lib/` - Clean all files in a directory
