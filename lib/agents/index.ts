/**
 * OpenAI Agents SDK - Agent Exports
 *
 * This module exports all agents and tools created using the OpenAI Agents SDK.
 * Use the openai-agent-sdk-skill command (/openai-agent-sdk-skill) to create new agents.
 *
 * @example
 * ```typescript
 * import { createChatAgent, chat } from '@/lib/agents';
 *
 * // Using factory functions
 * const agent = createChatAgent();
 * const result = await run(agent, 'Hello!');
 *
 * // Using convenience functions
 * const response = await chat('Hello!');
 * ```
 */

// Re-export OpenAI Agents SDK
export {
  Agent,
  Runner,
  run,
  tool,
  handoff,
  fileSearchTool,
  codeInterpreterTool,
  imageGenerationTool,
} from '@openai/agents';
export type { RunContext, RunResult, StreamedRunResult } from '@openai/agents';

// Example agents
export { createChatAgent, chat } from './chat-agent';
export {
  createOrchestratorAgent,
  createMathAgent,
  createTextAgent,
  createDateAgent,
  processTask,
} from './orchestrator';

// Utility Tools
export {
  calculatorTool,
  dateFormatterTool,
  textAnalysisTool,
  jsonFormatterTool,
  allTools,
} from './tools';

// Database Research Agent
export {
  createDatabaseResearchAgent,
  researchDatabase,
  researchBrand,
  searchPerformanceMetrics,
  getCompetitiveAnalysis,
} from './database-research-agent';

export { databaseTools } from './tools/database-tools';

// Data Analysis Agent
export {
  createDataAnalysisAgent,
  analyzeFollowerGrowth,
  calculateEngagementMetrics,
  compareMetricsPeriods,
  analyzeData,
} from './data-analysis-agent';

export { dataTools } from './tools/data-tools';

// Competitor Analysis Agent
export {
  createCompetitorAnalysisAgent,
  getCompetitiveOverview,
  compareToCompetitor,
  analyzeCompetitorContent,
  findCompetitiveOpportunities,
  analyzeCompetitors,
} from './competitor-analysis-agent';

export { competitorTools } from './tools/competitor-tools';

// Report Generator Agent
export {
  createReportGeneratorAgent,
  generateWeeklyReport,
  generateMonthlyReport,
  generatePlatformReport,
  generateComparisonReport,
  generateExecutiveSummary,
  generateReport,
} from './report-generator-agent';

export { reportTools } from './tools/report-tools';
