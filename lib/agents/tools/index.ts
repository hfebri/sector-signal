/**
 * Custom Tools for OpenAI Agents
 *
 * This module exports all custom tools that can be used with agents.
 */

import { tool } from '@openai/agents';
import { z } from 'zod';

/**
 * Calculator tool for mathematical expressions
 */
export const calculatorTool = tool({
  name: 'calculate',
  description: 'Perform mathematical calculations. Use this tool when you need to evaluate math expressions.',
  parameters: z.object({
    expression: z.string().describe('Math expression to evaluate (e.g., "2 + 2", "10 * 5")'),
  }),
  execute: async ({ expression }) => {
    try {
      // Safe evaluation using Function constructor
      // Only allow basic math operations
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
      const result = new Function(`return ${sanitized}`)();
      return `Result: ${result}`;
    } catch {
      return 'Error: Invalid expression. Please use only numbers and basic operators (+, -, *, /, %, ()).';
    }
  },
});

/**
 * Date formatter tool
 */
export const dateFormatterTool = tool({
  name: 'format_date',
  description: 'Format dates in various styles. Use this when you need to format or convert dates.',
  parameters: z.object({
    date: z.string().describe('Date string to format (e.g., "2024-01-15", "tomorrow", "next week")'),
    format: z.enum(['short', 'long', 'iso', 'relative']).describe('Output format style'),
  }),
  execute: async ({ date, format }) => {
    try {
      const d = new Date(date);

      if (isNaN(d.getTime())) {
        return 'Error: Invalid date format';
      }

      switch (format) {
        case 'short':
          return d.toLocaleDateString();
        case 'long':
          return d.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        case 'iso':
          return d.toISOString();
        case 'relative': {
          const now = new Date();
          const diff = d.getTime() - now.getTime();
          const days = Math.round(diff / (1000 * 60 * 60 * 24));
          if (days === 0) return 'Today';
          if (days === 1) return 'Tomorrow';
          if (days === -1) return 'Yesterday';
          if (days > 0) return `In ${days} days`;
          return `${Math.abs(days)} days ago`;
        }
      }
    } catch {
      return 'Error: Could not process date';
    }
  },
});

/**
 * Text analysis tool
 */
export const textAnalysisTool = tool({
  name: 'analyze_text',
  description: 'Analyze text for word count, character count, and basic statistics.',
  parameters: z.object({
    text: z.string().describe('Text to analyze'),
  }),
  execute: async ({ text }) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;

    return JSON.stringify({
      words,
      characters,
      charactersWithoutSpaces: charactersNoSpaces,
      sentences,
      paragraphs,
      averageWordLength: words > 0 ? (charactersNoSpaces / words).toFixed(2) : 0,
    }, null, 2);
  },
});

/**
 * JSON formatter tool
 */
export const jsonFormatterTool = tool({
  name: 'format_json',
  description: 'Format and validate JSON strings. Use this to prettify or validate JSON data.',
  parameters: z.object({
    json: z.string().describe('JSON string to format or validate'),
    indent: z.number().min(0).max(8).optional().default(2).describe('Indentation spaces'),
  }),
  execute: async ({ json, indent }) => {
    try {
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, indent);
    } catch (e) {
      return `Error: Invalid JSON - ${e instanceof Error ? e.message : 'Unknown error'}`;
    }
  },
});

// Export all utility tools
export const allTools = [
  calculatorTool,
  dateFormatterTool,
  textAnalysisTool,
  jsonFormatterTool,
];

// Re-export database tools
export { databaseTools } from './database-tools';
