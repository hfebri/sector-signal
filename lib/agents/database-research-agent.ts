/**
 * Database Research Agent
 *
 * An AI agent that can query internal documentation stored in the database.
 * Uses semantic search to find relevant information across brands, documents,
 * and generated strategies.
 *
 * Capabilities:
 * - List and search brands
 * - Browse documents by category, platform, or status
 * - Semantic search across document content using AI embeddings
 * - Retrieve performance metrics and competitive insights
 * - Access generated strategies
 * - Execute custom SQL queries (read-only)
 */

import { Agent, run } from '@openai/agents';
import { databaseTools } from './tools/database-tools';

/**
 * Creates a database research agent with full access to internal documentation
 */
export function createDatabaseResearchAgent() {
  return new Agent({
    name: 'Database Research Agent',
    instructions: `You are a database research agent with access to internal documentation.

## Your Capabilities
You can query and search through:
- **Brands**: Brand profiles with industry, target audience, competitors, and goals
- **Documents**: Uploaded files (CSV, Excel, PDF, etc.) with metadata like platform and category
- **Document Chunks**: Text content with semantic search using AI embeddings
- **Strategies**: Previously generated annual strategies with citations
- **Conversations**: Chat history from the AI chatbot

## How to Use Your Tools

### Starting a Research Session
1. First, use \`list_brands\` to see available brands
2. Use \`get_brand\` to understand a specific brand's context
3. Use \`get_schema\` if you need to understand the database structure

### Searching for Information
- Use \`search_documents\` for semantic search - describe what you're looking for in natural language
- Use \`search_performance\` for engagement metrics, analytics, and KPIs
- Use \`search_competitive\` for competitor analysis and market insights

### Browsing Documents
- Use \`list_documents\` to see what files are available for a brand
- Filter by category (facebook, instagram, twitter, tiktok, rivaliq, general)
- Filter by processing status (pending, processing, completed, failed)

### Accessing Strategies
- Use \`list_strategies\` to see previously generated strategies
- Use \`get_strategy\` to retrieve the full strategy data with citations

### Advanced Queries
- Use \`execute_sql\` for complex queries that other tools can't handle
- ONLY SELECT queries are allowed for security

## Best Practices
1. Always start by identifying the brand you're working with
2. Use semantic search (\`search_documents\`) for natural language queries
3. Combine multiple searches to get comprehensive results
4. Cite sources when providing information from documents
5. Be transparent about the relevance scores from semantic search

## Example Workflow
User: "What do we know about Acme Corp's Instagram performance?"

1. list_brands -> find Acme Corp's brand_id
2. get_brand -> understand their context
3. list_documents with category=instagram -> see available data
4. search_performance with platform=instagram -> get metrics
5. search_documents with query="Instagram engagement trends" -> get insights

## Response Format
When presenting research findings:
- Summarize the key insights
- Include relevant metrics and data points
- Note the source documents and their relevance scores
- Highlight any gaps in the available data`,

## CRITICAL: Data Citation Rules
    1. **ALWAYS show source data** (citations) when answering with information
    2. **NO DATA = NO ANSWER**: If you cannot find relevant information:
       - Explicitly state: "Maaf, saya tidak menemukan data untuk topik ini."
       - DO NOT make up or hallucinate informasi
       - Saran pengguna unggah dokumen terkait dulu
    3. **Jangan asumsikan** data ada - cek dulu dengan search_documents tools
    4. **Hanya jawab dengan data** yang sebenarnya ada di dokumen
    model: 'gpt-5-nano',
    tools: databaseTools,
  });
}

/**
 * Convenience function to research the database
 */
export async function researchDatabase(query: string): Promise<string> {
  const agent = createDatabaseResearchAgent();
  const result = await run(agent, query);
  return result.finalOutput ?? '';
}

/**
 * Research a specific brand's documentation
 */
export async function researchBrand(brandId: string, query: string): Promise<string> {
  const agent = createDatabaseResearchAgent();
  const result = await run(
    agent,
    `Research the following for brand ID ${brandId}: ${query}`
  );
  return result.finalOutput ?? '';
}

/**
 * Search for performance metrics across all data
 */
export async function searchPerformanceMetrics(
  brandId: string,
  platform?: string
): Promise<string> {
  const agent = createDatabaseResearchAgent();
  const platformText = platform ? `on ${platform}` : 'across all platforms';
  const result = await run(
    agent,
    `Find performance metrics and analytics ${platformText} for brand ID ${brandId}. Include engagement rates, reach, impressions, and any notable trends.`
  );
  return result.finalOutput ?? '';
}

/**
 * Get competitive analysis for a brand
 */
export async function getCompetitiveAnalysis(brandId: string): Promise<string> {
  const agent = createDatabaseResearchAgent();
  const result = await run(
    agent,
    `Provide a competitive analysis for brand ID ${brandId}. Look for competitor benchmarks, market positioning, and competitive insights from the available data.`
  );
  return result.finalOutput ?? '';
}

export default createDatabaseResearchAgent;
