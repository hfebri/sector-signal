/**
 * Orchestrator System - Multi-agent coordination example
 *
 * This demonstrates how to create multiple specialist agents
 * and an orchestrator that routes tasks to the appropriate agent.
 */

import { Agent, run } from '@openai/agents';
import { calculatorTool, dateFormatterTool, textAnalysisTool } from './tools';

/**
 * Creates a mathematics specialist agent
 */
export function createMathAgent() {
  return new Agent({
    name: 'Math Specialist',
    instructions: `You are a mathematics expert.
    - Solve mathematical problems step by step
    - Show your work and reasoning
    - Use the calculator tool for computations
    - Explain concepts clearly`,
    model: 'gpt-5-nano',
    tools: [calculatorTool],
  });
}

/**
 * Creates a text analysis specialist agent
 */
export function createTextAgent() {
  return new Agent({
    name: 'Text Specialist',
    instructions: `You are a text analysis expert.
    - Help with writing, editing, and analyzing text
    - Use the text analysis tool for statistics
    - Provide suggestions for improvement
    - Be constructive and helpful`,
    model: 'gpt-5-nano',
    tools: [textAnalysisTool],
  });
}

/**
 * Creates a date/time specialist agent
 */
export function createDateAgent() {
  return new Agent({
    name: 'Date Specialist',
    instructions: `You are a date and time expert.
    - Help with date formatting and calculations
    - Use the date formatter tool for conversions
    - Handle timezone questions carefully
    - Be precise with date arithmetic`,
    model: 'gpt-5-nano',
    tools: [dateFormatterTool],
  });
}

/**
 * Creates an orchestrator agent that routes to specialists
 */
export function createOrchestratorAgent() {
  const mathAgent = createMathAgent();
  const textAgent = createTextAgent();
  const dateAgent = createDateAgent();

  return new Agent({
    name: 'Task Orchestrator',
    instructions: `You are a task orchestrator that routes requests to the appropriate specialist.
    - Analyze the user's request to determine which specialist can best help
    - Hand off to:
      * Math Specialist: for calculations, equations, and math problems
      * Text Specialist: for writing, editing, and text analysis
      * Date Specialist: for date formatting, conversions, and time-related questions
    - If a request doesn't fit any specialist, handle it yourself
    - Be helpful and efficient in routing`,
    model: 'gpt-5-nano',
    handoffs: [mathAgent, textAgent, dateAgent],
  });
}

/**
 * Convenience function to process a task through the orchestrator
 */
export async function processTask(task: string): Promise<string> {
  const orchestrator = createOrchestratorAgent();
  const result = await run(orchestrator, task);
  return result.finalOutput ?? '';
}

export default createOrchestratorAgent;
