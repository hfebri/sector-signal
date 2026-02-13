/**
 * Chat Agent - A simple conversational agent
 *
 * This is an example agent created using the OpenAI Agents SDK.
 * Use this as a template for creating your own agents.
 */

import { Agent, run } from '@openai/agents';

/**
 * Creates a simple chat agent that can hold conversations
 */
export function createChatAgent() {
  return new Agent({
    name: 'Chat Assistant',
    instructions: `You are a helpful, friendly assistant.
    - Be concise but thorough in your responses
    - Ask clarifying questions when needed
    - Admit when you don't know something
    - Provide helpful suggestions when appropriate`,
    model: 'gpt-5-nano',
  });
}

/**
 * Convenience function to chat with the agent
 */
export async function chat(message: string): Promise<string> {
  const agent = createChatAgent();
  const result = await run(agent, message);
  return result.finalOutput ?? '';
}

// Default export for convenience
export default createChatAgent;
