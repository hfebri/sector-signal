# OpenAI Agent SDK Skill

You are given the following context:
$ARGUMENTS

## Overview

You are an expert in creating AI agents using the OpenAI Agents SDK for TypeScript. Your task is to help users create, configure, and run AI agents with tools, handoffs, and orchestration capabilities.

## Default Configuration

**IMPORTANT**: Always use `gpt-5-nano` as the default model for all agents unless the user explicitly requests a different model.

## SDK Installation

The project should have the OpenAI Agents SDK installed:

```bash
npm install @openai/agents zod
```

## Core Concepts

### 1. Basic Agent Creation

```typescript
import { Agent, run } from '@openai/agents';

const agent = new Agent({
  name: 'Agent Name',
  instructions: 'Clear instructions about what the agent does and how it should behave.',
  model: 'gpt-5-nano', // Default model
});
```

### 2. Running an Agent

```typescript
import { Agent, run } from '@openai/agents';

const result = await run(agent, 'Your input message here');
console.log(result.finalOutput);
```

### 3. Creating Tools with Zod

```typescript
import { tool } from '@openai/agents';
import { z } from 'zod';

const myTool = tool({
  name: 'tool_name',
  description: 'Clear description of what the tool does and WHEN to use it',
  parameters: z.object({
    param1: z.string().describe('Parameter description'),
    param2: z.number().optional(),
  }),
  execute: async ({ param1, param2 }) => {
    // Tool implementation
    return 'Tool result';
  },
});
```

### 4. Agent with Tools

```typescript
const agent = new Agent({
  name: 'Tool-Enabled Agent',
  instructions: 'You are a helpful assistant that uses tools.',
  model: 'gpt-5-nano',
  tools: [myTool],
});
```

### 5. Agent Handoffs (Multi-Agent Orchestration)

```typescript
const specialistAgent = new Agent({
  name: 'Specialist',
  instructions: 'You handle specific tasks.',
  model: 'gpt-5-nano',
});

const orchestratorAgent = new Agent({
  name: 'Orchestrator',
  instructions: 'You route tasks to the appr
  opriate specialist.',
  model: 'gpt-5-nano',
  handoffs: [specialistAgent],
});
```

### 6. Hosted Tools (Web Search, File Search, etc.)

```typescript
import { Agent, webSearchTool, fileSearchTool, codeInterpreterTool } from '@openai/agents';

const agent = new Agent({
  name: 'Research Agent',
  model: 'gpt-5-nano',
  tools: [
    webSearchTool(),
    fileSearchTool('VS_ID'), // Vector store ID
    codeInterpreterTool(),
  ],
});
```

### 7. Agents as Tools

```typescript
const summarizerAgent = new Agent({
  name: 'Summarizer',
  instructions: 'Generate concise summaries.',
  model: 'gpt-5-nano',
});

const mainAgent = new Agent({
  name: 'Main Agent',
  model: 'gpt-5-nano',
  tools: [
    summarizerAgent.asTool({
      toolName: 'summarize_text',
      toolDescription: 'Generate a concise summary of the supplied text.',
    }),
  ],
});
```

### 8. Streaming Results

```typescript
import { Runner } from '@openai/agents';

const runner = new Runner();
const stream = await runner.run(agent, 'Your input');

for await (const event of stream) {
  if (event.type === 'run_item_stream_event') {
    console.log(event.item);
  }
}
```

### 9. Context Management

```typescript
import { RunContext } from '@openai/agents';

interface MyContext {
  userId: string;
  preferences: Record<string, string>;
}

const context = new RunContext<MyContext>({
  userId: 'user-123',
  preferences: { theme: 'dark' },
});

const result = await run(agent, 'Hello', { context });
```

### 10. MCP Server Integration

```typescript
import { Agent, MCPServerStdio } from '@openai/agents';

const server = new MCPServerStdio({
  fullCommand: 'npx -y @modelcontextprotocol/server-filesystem ./files',
});

await server.connect();

const agent = new Agent({
  name: 'File Agent',
  model: 'gpt-5-nano',
  mcpServers: [server],
});
```

### 11. Output Guardrails

```typescript
import { defineOutputGuardrail } from '@openai/agents';

const lengthGuardrail = defineOutputGuardrail({
  name: 'length_check',
  type: 'output',
  execute: async (context, agent, output) => {
    if (output.length > 1000) {
      return {
        tripwireTriggered: true,
        message: 'Output too long',
      };
    }
    return { tripwireTriggered: false };
  },
});

const agent = new Agent({
  name: 'Guarded Agent',
  model: 'gpt-5-nano',
  outputGuardrails: [lengthGuardrail],
});
```

## Agent Templates

### Template 1: Simple Chat Agent

```typescript
import { Agent, run } from '@openai/agents';

export async function createChatAgent() {
  const agent = new Agent({
    name: 'Chat Assistant',
    instructions: 'You are a helpful assistant. Be concise and friendly.',
    model: 'gpt-5-nano',
  });

  return async (message: string) => {
    const result = await run(agent, message);
    return result.finalOutput;
  };
}
```

### Template 2: Research Agent with Web Search

```typescript
import { Agent, run, webSearchTool } from '@openai/agents';

export function createResearchAgent() {
  return new Agent({
    name: 'Research Assistant',
    instructions: `You are a research assistant that helps find information.
    Use web search to find accurate, up-to-date information.
    Cite your sources when possible.`,
    model: 'gpt-5-nano',
    tools: [webSearchTool()],
  });
}
```

### Template 3: Multi-Agent Orchestrator

```typescript
import { Agent, run } from '@openai/agents';

export function createOrchestratorSystem() {
  const researchAgent = new Agent({
    name: 'Researcher',
    instructions: 'You research topics thoroughly and provide detailed findings.',
    model: 'gpt-5-nano',
  });

  const writerAgent = new Agent({
    name: 'Writer',
    instructions: 'You take research findings and write clear, engaging content.',
    model: 'gpt-5-nano',
  });

  const editorAgent = new Agent({
    name: 'Editor',
    instructions: 'You review and improve written content for clarity and accuracy.',
    model: 'gpt-5-nano',
  });

  const orchestrator = new Agent({
    name: 'Content Orchestrator',
    instructions: `You coordinate between researchers, writers, and editors.
    - Send research requests to the Researcher
    - Send writing requests to the Writer
    - Send editing requests to the Editor
    Choose the right agent based on the task.`,
    model: 'gpt-5-nano',
    handoffs: [researchAgent, writerAgent, editorAgent],
  });

  return orchestrator;
}
```

### Template 4: Tool-Using Agent

```typescript
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

export function createToolAgent() {
  const calculatorTool = tool({
    name: 'calculate',
    description: 'Perform mathematical calculations',
    parameters: z.object({
      expression: z.string().describe('Math expression to evaluate'),
    }),
    execute: async ({ expression }) => {
      try {
        // Safe evaluation using Function constructor
        const result = new Function(`return ${expression}`)();
        return `Result: ${result}`;
      } catch {
        return 'Error: Invalid expression';
      }
    },
  });

  const dateFormatterTool = tool({
    name: 'format_date',
    description: 'Format dates in various styles',
    parameters: z.object({
      date: z.string().describe('Date string to format'),
      format: z.enum(['short', 'long', 'iso']).describe('Output format'),
    }),
    execute: async ({ date, format }) => {
      const d = new Date(date);
      switch (format) {
        case 'short': return d.toLocaleDateString();
        case 'long': return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        case 'iso': return d.toISOString();
      }
    },
  });

  return new Agent({
    name: 'Utility Agent',
    instructions: 'You help users with calculations and date formatting.',
    model: 'gpt-5-nano',
    tools: [calculatorTool, dateFormatterTool],
  });
}
```

### Template 5: Streaming Agent

```typescript
import { Agent, Runner } from '@openai/agents';

export async function* streamAgentResponse(
  agent: Agent,
  message: string
): AsyncGenerator<string> {
  const runner = new Runner();
  const stream = await runner.run(agent, message);

  for await (const event of stream) {
    if (event.type === 'raw_model_stream_event') {
      const text = event.data?.delta?.content;
      if (typeof text === 'string') {
        yield text;
      }
    }
  }
}
```

## File Structure Recommendation

```
lib/agents/
  ├── index.ts           # Export all agents
  ├── orchestrator.ts    # Main orchestrator agent
  ├── specialist-a.ts    # Specialist agent A
  ├── specialist-b.ts    # Specialist agent B
  ├── tools/
  │   ├── index.ts       # Export all tools
  │   ├── search.ts      # Search-related tools
  │   └── utils.ts       # Utility tools
  └── types.ts           # Shared types
```

## Best Practices

1. **Clear Instructions**: Write detailed instructions that explain the agent's role, capabilities, and limitations.

2. **Tool Descriptions**: Provide clear descriptions that explain WHEN to use each tool, not just WHAT it does.

3. **Zod Schemas**: Always use Zod for parameter validation with descriptive `.describe()` calls.

4. **Error Handling**: Wrap tool execution in try-catch and return meaningful error messages.

5. **Model Selection**: Use `gpt-5-nano` for development and cost-effective operations.

6. **Handoff Chains**: Design handoff chains thoughtfully - avoid circular handoffs between agents.

7. **Context Usage**: Use RunContext to pass user-specific data without exposing it in prompts.

## Instructions

When asked to create an agent:

1. Understand the user's requirements
2. Determine if it needs:
   - Tools (custom or hosted)
   - Handoffs to other agents
   - Context management
   - Guardrails
   - Streaming capabilities
3. Create the agent using the templates above
4. Place the file in `lib/agents/` directory
5. Export from `lib/agents/index.ts`
6. Provide usage examples

## Environment Variables

Ensure these are set in `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key
```

Or set programmatically:

```typescript
import { setDefaultOpenAIKey } from '@openai/agents';
setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);
```
