# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application for sector signal, a comprehensive social media AI agent that helps brands create annual strategies, monthly plans, and tactical campaigns. The application uses the App Router, TypeScript, and Tailwind CSS with shadcn/ui component system integration ("new-york" style variant).

### Key Features

- **Annual Strategy Generation**: AI-powered brand strategy with content pillars, playbooks, and KPI frameworks
- **Monthly Planning**: Editorial calendars, content specifications, and platform-specific distribution
- **Tactical Campaigns**: Market opportunity detection and campaign recommendations
- **Competitive Intelligence**: RivalIQ API integration for competitor analysis and benchmarking

## Standard Workflow

Use this workflow when working on a new task:

1. First, think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md
2. The plan should have a list of todo items that you can check off as you complete them.
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information
6. Remember to ALWAYS use the best practice method that is applicable in Next JS. For example, don't use window.location.href for redirect, but use push("/")

Periodically make sure to commit when it make sense to do so.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Production build**: `npm run build` (uses Turbopack)
- **Start production server**: `npm start`
- **Linting**: `npm run lint` (ESLint with Next.js and TypeScript rules)

The development server runs on http://localhost:3000.

## Architecture & Structure

### Core Framework

- **Next.js 15** with App Router architecture
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **React 19** for UI components

### Key Directories

- `app/` - Next.js App Router pages and layouts
- `lib/` - Utility functions and shared logic
- `public/` - Static assets
- `components/` - Reusable React components via shadcn/ui
- `tasks/` - Project planning and todo management files

### Component System

The project uses **shadcn/ui** with these configurations:

- Style: "new-york" variant
- Base color: slate
- CSS variables enabled
- Icon library: lucide-react
- Path aliases configured for clean imports:
  - `@/components` → components
  - `@/lib` → lib
  - `@/utils` → lib/utils
  - `@/ui` → components/ui
  - `@/hooks` → hooks

### Styling Approach

- **Tailwind CSS v4** with PostCSS integration
- Utility-first CSS approach
- Dark mode support via CSS variables
- Custom font loading with Geist Sans and Geist Mono
- Class merging utility via `cn()` function in `lib/utils.ts`

### TypeScript Configuration

- Strict mode enabled
- Path aliases configured with `@/*` pointing to project root
- Next.js plugin integrated for enhanced TypeScript support
- Target: ES2017 with modern module resolution

## Code Conventions

### Import Patterns

- Use `@/` path aliases for clean imports
- Next.js Image component for optimized images
- Font optimization via `next/font/google`

### Styling Patterns

- Use the `cn()` utility for conditional class merging
- Follow Tailwind's utility-first approach
- Leverage CSS variables for theme consistency
- Responsive design with mobile-first approach

### Component Structure

- Functional components with TypeScript
- Props typing with React.ReactNode for children
- Metadata exports for SEO optimization
- Clean separation between layout and page components
- **Always use shadcn/ui components first** - if a needed component doesn't exist in shadcn/ui, then create your own custom component

## External Integrations

### RivalIQ API Integration

- **Purpose**: Social media competitive intelligence and performance benchmarking
- **API Reference**: https://app.rivaliq.com/api-reference/
- **Authentication**: API Key via `x-api-key` header
- **Base URL**: `https://api.rivaliq.com/v3`
- **Data Sources**: Competitor content analysis, engagement metrics, industry benchmarks

**Key Endpoints:**

- **Landscapes**: `/landscapes` - List and manage competitor landscapes
- **Companies**: `/companies` - Get company data and social metrics
- **Posts**: `/posts` - Analyze social media posts and performance
- **Metrics**: `/metrics` - Retrieve engagement and performance metrics
- **Benchmarks**: Access industry-standard benchmarks for comparison

**Implementation Pattern:**

```typescript
const response = await fetch("https://api.rivaliq.com/v3/{endpoint}", {
  headers: {
    "x-api-key": process.env.RIVALIQ_API_KEY,
    "Content-Type": "application/json",
  },
});
```

**Key Features:**

- Competitor landscape analysis
- Content performance benchmarking
- Market trend detection
- Social media listening and engagement metrics
- Competitive gap analysis for tactical opportunities

### AI Services Integration (Replicate + GPT-5)

- **Platform**: Replicate.com for AI model access
- **Development Model**: GPT-5-nano via `openai/gpt-5-structured`
- **Production Model**: GPT-5 (full version)
- **Key Features**:
  - Structured JSON schema outputs for consistent data
  - Web search capabilities for real-time market intelligence
  - Configurable reasoning effort (low/medium/high)
  - Tools integration for enhanced functionality
- **Applications**:
  - Annual strategy generation (SWOT analysis, content pillars)
  - Monthly content planning and editorial calendars
  - Tactical campaign recommendations with competitive analysis
  - Performance optimization suggestions with reasoning

## Data Architecture

### Core Data Models

- **Brand Profiles**: Guidelines, target audience, competitors, market positioning
- **Strategy Data**: Annual plans, content pillars, KPI frameworks, playbooks
- **Content Management**: Editorial calendars, content specifications, performance tracking
- **Competitive Intelligence**: RivalIQ data cache, competitor insights, market trends
- **Campaign Data**: Tactical opportunities, campaign performance, optimization insights

### API Management

- Secure credential storage for RivalIQ and Replicate APIs
- Rate limiting and error handling for external service calls
- Data caching strategy for competitive intelligence
- Real-time synchronization with external data sources
- Environment-based model configuration (dev: GPT-5-nano, prod: GPT-5)
- Structured JSON schema validation for AI responses
- Retry logic and fallback handling for AI model calls

## Development Setup

### Required Dependencies

```bash
npm install replicate
```

### Environment Variables

```env
REPLICATE_API_TOKEN=your_replicate_token
RIVALIQ_API_KEY=your_rivaliq_key
```

### Replicate Integration Example

```javascript
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const input = {
  model: "gpt-5-nano", // or "gpt-5" for production
  tools: [],
  prompt: "Generate annual social media strategy...",
  verbosity: "medium",
  json_schema: {
    /* strategy schema */
  },
  reasoning_effort: "medium",
  enable_web_search: true,
};

const output = await replicate.run("openai/gpt-5-structured", { input });
```

## MCP Tool Usage

### Context7 MCP - Documentation Lookup

**IMPORTANT**: Always use Context7 MCP when you need documentation for any library or framework. This provides up-to-date, accurate documentation directly from the source.

**When to Use:**
- When fixing bugs or errors related to a specific library
- When implementing features using frameworks (Next.js, React, Tailwind, etc.)
- When you're uncertain about API usage or best practices
- When exploring new libraries or unfamiliar APIs
- Before making assumptions about how a library works

**Available Tools:**
- `mcp__context7__resolve-library-id` - Find the correct library ID
- `mcp__context7__get-library-docs` - Retrieve documentation for a library

**Usage Pattern:**

```typescript
// Step 1: Resolve the library ID
mcp__context7__resolve-library-id({ libraryName: "next.js" })
// Returns: /vercel/next.js

// Step 2: Get documentation for specific topic
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/vercel/next.js",
  topic: "app router middleware",
  tokens: 5000
})
```

**Examples:**

1. **Next.js App Router issues:**
   ```
   Use context7 to get docs on: /vercel/next.js (topic: "app router")
   ```

2. **React hooks questions:**
   ```
   Use context7 to get docs on: /facebook/react (topic: "hooks")
   ```

3. **Tailwind CSS utility classes:**
   ```
   Use context7 to get docs on: /tailwindlabs/tailwindcss (topic: "utility classes")
   ```

4. **shadcn/ui component usage:**
   ```
   Use context7 to get docs on: /shadcn/ui (topic: "button component")
   ```

**Best Practice**: Always consult Context7 BEFORE attempting to fix library-related issues. Don't rely on outdated knowledge when current documentation is available.

### Supabase MCP - Database Operations

**IMPORTANT**: Always use Supabase MCP for all database-related operations. This ensures proper migration management, type safety, and consistency.

**When to Use:**
- Creating or modifying database tables
- Running migrations
- Querying database data
- Managing database extensions
- Listing tables and schemas
- Executing SQL operations

**Available Tools:**

**Project Management:**
- `mcp__supabase__list_projects` - List all Supabase projects
- `mcp__supabase__get_project` - Get project details
- `mcp__supabase__create_project` - Create new project
- `mcp__supabase__pause_project` - Pause a project
- `mcp__supabase__restore_project` - Restore a paused project

**Database Schema:**
- `mcp__supabase__list_tables` - List all tables in schemas
- `mcp__supabase__list_extensions` - List database extensions
- `mcp__supabase__list_migrations` - List all migrations

**Database Operations:**
- `mcp__supabase__apply_migration` - Apply DDL migrations (CREATE, ALTER, DROP)
- `mcp__supabase__execute_sql` - Execute raw SQL queries (SELECT, INSERT, UPDATE, DELETE)

**TypeScript Integration:**
- `mcp__supabase__generate_typescript_types` - Generate types from database schema

**Usage Patterns:**

```typescript
// 1. List tables to understand current schema
mcp__supabase__list_tables({
  project_id: "your-project-id",
  schemas: ["public"]
})

// 2. Apply a migration for schema changes
mcp__supabase__apply_migration({
  project_id: "your-project-id",
  name: "add_citations_table",
  query: `
    CREATE TABLE citations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      content TEXT NOT NULL,
      source_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
})

// 3. Execute SQL for data operations
mcp__supabase__execute_sql({
  project_id: "your-project-id",
  query: "SELECT * FROM brands WHERE id = $1"
})

// 4. Generate TypeScript types after schema changes
mcp__supabase__generate_typescript_types({
  project_id: "your-project-id"
})
```

**Best Practices:**

1. **Use `apply_migration` for DDL** (CREATE TABLE, ALTER TABLE, DROP TABLE, etc.)
2. **Use `execute_sql` for DML** (SELECT, INSERT, UPDATE, DELETE)
3. **Always list tables first** to understand the current schema before making changes
4. **Generate TypeScript types** after schema changes to maintain type safety
5. **Use descriptive migration names** in snake_case (e.g., `add_user_preferences_table`)
6. **Don't hardcode IDs** in migrations - use generated IDs or references

**Migration Workflow:**

```
1. List tables to see current schema
   → mcp__supabase__list_tables

2. Create migration for changes
   → mcp__supabase__apply_migration

3. Verify migration was applied
   → mcp__supabase__list_migrations

4. Generate TypeScript types
   → mcp__supabase__generate_typescript_types

5. Update application code to use new schema
```

**Example: Adding a New Table**

```typescript
// Step 1: Check existing tables
mcp__supabase__list_tables({
  project_id: "abc123",
  schemas: ["public"]
})

// Step 2: Apply migration
mcp__supabase__apply_migration({
  project_id: "abc123",
  name: "create_campaigns_table",
  query: `
    CREATE TABLE campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      objective TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_campaigns_brand_id ON campaigns(brand_id);
  `
})

// Step 3: Generate types
mcp__supabase__generate_typescript_types({
  project_id: "abc123"
})
```

**Never:**
- ❌ Use raw SQL for schema changes (use `apply_migration` instead)
- ❌ Skip migration naming (always provide descriptive names)
- ❌ Forget to generate TypeScript types after schema changes
- ❌ Apply migrations without checking current schema first
