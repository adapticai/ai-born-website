/**
 * LLM Plan Generator
 *
 * Generates custom organizational plans using Claude AI
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  LLMPromptContext,
  LLMGenerationOptions,
  LLMGenerationResponse,
} from '@/types/organization';

// Default system prompt for plan generation
const DEFAULT_SYSTEM_PROMPT = `You are an expert organizational strategist and AI transformation consultant. Your role is to generate comprehensive, actionable implementation plans for organizations adopting AI-native architectures.

Your plans should be:
1. Practical and immediately actionable
2. Based on the Five Planes framework (Data, Models, Agents, Orchestration, Governance)
3. Tailored to the organization's specific context and challenges
4. Forward-thinking but realistic about implementation timelines
5. Grounded in the principles from "AI-Born" by Mehran Granfar

Structure your plans with:
- Executive Summary
- Current State Assessment
- Strategic Vision
- Implementation Roadmap (with phases)
- Key Success Metrics
- Risk Mitigation
- Resource Requirements
- Next Steps

Use clear, professional language. Avoid jargon unless necessary, and define technical terms when used.`;

// Default prompt template
const DEFAULT_PROMPT_TEMPLATE = `Generate a comprehensive AI-native transformation plan for the following organization:

Organization Details:
- Name: {{organizationName}}
- Type: {{organizationType}}
{{#if industry}}- Industry: {{industry}}{{/if}}
{{#if size}}- Size: {{size}}{{/if}}

{{#if challenges}}
Current Challenges:
{{#each challenges}}
- {{this}}
{{/each}}
{{/if}}

{{#if goals}}
Strategic Goals:
{{#each goals}}
- {{this}}
{{/each}}
{{/if}}

{{#if customContext}}
Additional Context:
{{customContext}}
{{/if}}

Please generate a detailed transformation plan that addresses these specific needs and follows the AI-Born framework. The plan should be practical, actionable, and tailored to this organization's unique situation.`;

/**
 * Initialize Anthropic client
 */
function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not set. Please add it to your .env file.'
    );
  }

  return new Anthropic({
    apiKey,
  });
}

/**
 * Compile Handlebars-style template with context
 */
function compileTemplate(template: string, context: Record<string, unknown>): string {
  let result = template;

  // Replace simple variables {{varName}}
  result = result.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return String(context[varName] ?? '');
  });

  // Handle conditional blocks {{#if varName}}...{{/if}}
  result = result.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, varName, content) => {
      return context[varName] ? content : '';
    }
  );

  // Handle each blocks {{#each varName}}...{{/each}}
  result = result.replace(
    /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (match, varName, content) => {
      const items = context[varName];
      if (Array.isArray(items)) {
        return items.map(() => content.replace(/\{\{this\}\}/g, String)).join('\n');
      }
      return '';
    }
  );

  return result.trim();
}

/**
 * Build prompt from context
 */
export function buildPrompt(
  context: LLMPromptContext,
  customTemplate?: string
): string {
  const template = customTemplate || DEFAULT_PROMPT_TEMPLATE;

  return compileTemplate(template, {
    organizationName: context.organizationName,
    organizationType: context.organizationType,
    industry: context.industry,
    size: context.size,
    challenges: context.challenges,
    goals: context.goals,
    customContext: context.customContext,
  });
}

/**
 * Generate plan using Claude AI
 */
export async function generatePlan(
  context: LLMPromptContext,
  options: LLMGenerationOptions = {}
): Promise<LLMGenerationResponse> {
  const startTime = Date.now();

  try {
    const client = getAnthropicClient();

    // Build the prompt
    const userPrompt = buildPrompt(context, options.systemPrompt);

    // Default options
    const model = options.model || 'claude-3-5-sonnet-20241022';
    const maxTokens = options.maxTokens || 4096;
    const temperature = options.temperature ?? 0.7;

    // Call Claude API
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: options.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract content
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    const generationTime = Date.now() - startTime;

    // Calculate token count (approximation if not provided)
    const tokenCount =
      response.usage.input_tokens + response.usage.output_tokens;

    return {
      content: content.text,
      metadata: {
        model,
        tokenCount,
        generationTime,
        finishReason: response.stop_reason || 'end_turn',
      },
    };
  } catch (error) {
    console.error('Error generating plan with Claude:', error);

    if (error instanceof Anthropic.APIError) {
      throw new Error(
        `Claude API error: ${error.message} (Status: ${error.status})`
      );
    }

    throw new Error('Failed to generate plan. Please try again.');
  }
}

/**
 * Parse plan content into structured JSON
 * Attempts to extract key sections from the markdown content
 */
export function parsePlanContent(content: string): Record<string, unknown> {
  const sections: Record<string, string> = {};

  // Split by markdown headers
  const headerRegex = /^#{1,3}\s+(.+)$/gm;
  let lastMatch: RegExpExecArray | null = null;
  let lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = headerRegex.exec(content)) !== null) {
    if (lastMatch) {
      const sectionName = lastMatch[1].toLowerCase().replace(/\s+/g, '_');
      const sectionContent = content
        .slice(lastIndex, match.index)
        .trim()
        .replace(/^#{1,3}\s+.+$/m, ''); // Remove the header itself

      sections[sectionName] = sectionContent.trim();
    }

    lastMatch = match;
    lastIndex = match.index;
  }

  // Handle the last section
  if (lastMatch) {
    const sectionName = lastMatch[1].toLowerCase().replace(/\s+/g, '_');
    const sectionContent = content.slice(lastIndex).trim().replace(/^#{1,3}\s+.+$/m, '');
    sections[sectionName] = sectionContent.trim();
  }

  return {
    sections,
    fullContent: content,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Validate plan content
 */
export function validatePlanContent(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push('Plan content is empty');
  }

  if (content.length < 500) {
    errors.push('Plan content is too short (minimum 500 characters)');
  }

  if (content.length > 50000) {
    errors.push('Plan content is too long (maximum 50,000 characters)');
  }

  // Check for key sections
  const requiredSections = [
    'executive summary',
    'implementation',
    'roadmap',
  ];

  const lowerContent = content.toLowerCase();
  for (const section of requiredSections) {
    if (!lowerContent.includes(section)) {
      errors.push(`Missing recommended section: ${section}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a preview/summary of the plan (first 300 characters)
 */
export function generatePlanPreview(content: string): string {
  const cleanContent = content
    .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italic
    .trim();

  if (cleanContent.length <= 300) {
    return cleanContent;
  }

  return cleanContent.slice(0, 297) + '...';
}

/**
 * Estimate cost of plan generation
 */
export function estimateGenerationCost(
  promptLength: number,
  maxTokens: number = 4096
): {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCostUSD: number;
} {
  // Rough estimate: 1 token ≈ 4 characters
  const estimatedInputTokens = Math.ceil(promptLength / 4);
  const estimatedOutputTokens = maxTokens;

  // Claude 3.5 Sonnet pricing (as of Oct 2024)
  const inputCostPer1M = 3.0; // $3 per 1M input tokens
  const outputCostPer1M = 15.0; // $15 per 1M output tokens

  const inputCost = (estimatedInputTokens / 1_000_000) * inputCostPer1M;
  const outputCost = (estimatedOutputTokens / 1_000_000) * outputCostPer1M;

  return {
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedCostUSD: inputCost + outputCost,
  };
}

/**
 * Stream plan generation (for real-time updates)
 * Note: This requires streaming API support
 */
export async function* generatePlanStream(
  context: LLMPromptContext,
  options: LLMGenerationOptions = {}
): AsyncGenerator<string, void, unknown> {
  const client = getAnthropicClient();

  const userPrompt = buildPrompt(context, options.systemPrompt);
  const model = options.model || 'claude-3-5-sonnet-20241022';
  const maxTokens = options.maxTokens || 4096;
  const temperature = options.temperature ?? 0.7;

  const stream = await client.messages.stream({
    model,
    max_tokens: maxTokens,
    temperature,
    system: options.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text;
    }
  }
}
