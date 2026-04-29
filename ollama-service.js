// ollama-service.js — Ollama REST API client for PromptForge
//
// Provides: improvePrompt (streaming), generateVariants, suggestTitle,
// suggestTags, suggestCategory, suggestAllMetadata, checkConnection.
//
// Default model: gemma4:latest

const DEFAULT_MODEL = 'gemma4:latest';

async function getOllamaSettings() {
  try {
    const data = await chrome.storage.local.get({
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: DEFAULT_MODEL,
      ollamaNumCtx: 8192,
      useThinking: true,
      ollamaBearerToken: '',
      variantCount: 3,
      autoSuggestMetadata: true,
      theme: 'system',
      displayMode: 'standard',
      forceDarkMode: false,
      disableOverwrite: false,
      enableTags: true,
      keyboardShortcut: null,
      buttonPosition: null,
      onboardingCompleted: false
    });
    return data;
  } catch {
    return {
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: DEFAULT_MODEL,
      ollamaNumCtx: 8192,
      useThinking: true,
      ollamaBearerToken: '',
      variantCount: 3,
      autoSuggestMetadata: true
    };
  }
}

// ---------------------------
// Meta-prompt constants
// ---------------------------

export const IMPROVE_SYSTEM_PROMPT = `You are an expert prompt engineer. You rewrite prompts to make them clearer, more specific, and more effective when given to a large language model.

When you rewrite a prompt, you:
- Preserve the user's original intent exactly
- Add missing specificity: audience, format, tone, length, constraints
- Add structure when helpful: role assignment, numbered steps, output format
- Remove ambiguity and filler words
- Keep the output as a prompt (an instruction TO an AI), never a response to it

Output rules:
- Return only the rewritten prompt text
- No preamble ("Here is the improved version:", "Sure!", etc.)
- No explanation of your changes
- No surrounding quotes or code fences

Example:
Input: write a blog post about dogs
Output: Write a 600-word blog post for first-time dog owners about choosing a breed that matches their lifestyle. Use a warm, encouraging tone. Structure it with an introduction, three lifestyle-based recommendations (apartment, family, active), and a brief conclusion with next steps.`;

export function makeVariantsSystemPrompt(count) {
  return `You are an expert prompt engineer. You generate alternative versions of a given prompt that take genuinely different approaches while preserving the core goal.

Each variant must differ meaningfully along at least two of these dimensions:
- Role: who the AI is asked to act as
- Format: narrative vs structured vs Q&A vs steps
- Tone: formal vs conversational vs analytical vs persuasive
- Scope: broad overview vs deep-dive vs comparative

You return a JSON array of strings. Each string is a complete, self-contained prompt.

Output rules:
- Return only the JSON array
- No markdown code fences
- No explanation before or after
- No trailing commas
- Each variant should be similar in length to the original prompt, not much longer

Example:
Input prompt: "explain photosynthesis"
Output: ["You are a biology teacher. Explain photosynthesis to a 10-year-old using a simple analogy and three short paragraphs.", "Provide a technical explanation of photosynthesis covering the light-dependent reactions, the Calvin cycle, and the role of chlorophyll. Use precise terminology.", "Compare and contrast C3, C4, and CAM photosynthesis. Format as a table with columns for mechanism, climate adaptation, and example plants."]`;
}

export const TITLE_SYSTEM_PROMPT = `You generate short, descriptive titles for AI prompts.

Given a prompt, you read it carefully and produce a title that captures its core task or intent. Titles are 3 to 7 words, in Title Case, with no surrounding quotes and no trailing punctuation.

Output rules:
- Return only the title
- No "Title:" prefix, no quotes, no period at the end
- No explanation

Examples:
Prompt: "Write a 600-word blog post about choosing a dog breed for first-time owners..."
Title: Beginner Dog Breed Selection Guide

Prompt: "Act as a senior Python developer and review this code for bugs, security issues, and..."
Title: Python Code Review Assistant

Prompt: "Generate three subject line options for a cold sales email targeting SaaS founders..."
Title: Cold Email Subject Line Generator
`;

export const TAGS_SYSTEM_PROMPT = `You assign tags to AI prompts.

Given a prompt, you identify 2 to 5 relevant tags covering its topic, use-case, and domain. Tags are short (1-2 words), lowercase, and use hyphens for multi-word tags.

Output rules:
- Return only a JSON array of strings
- No markdown code fences, no explanation, no preamble
- 2 to 5 tags total

Examples:
Prompt: "Write a 600-word blog post about choosing a dog breed for first-time owners..."
Tags: ["writing", "blog-post", "pets", "beginners"]

Prompt: "Act as a senior Python developer and review this code for bugs and security issues..."
Tags: ["coding", "python", "code-review", "security"]

Prompt: "Generate three subject line options for a cold sales email..."
Tags: ["marketing", "email", "sales", "copywriting"]
`;

export const CATEGORY_SYSTEM_PROMPT = `You classify AI prompts into exactly one of these categories:

- Writing & Content — blog posts, articles, stories, copywriting, content generation
- Coding & Development — code generation, debugging, code review, technical documentation
- Analysis & Research — summarization, research, fact-finding, comparison, synthesis
- Creative & Design — creative writing, brainstorming, design ideas, naming, visual concepts
- Business & Marketing — marketing copy, sales, strategy, branding, customer-facing content
- Education & Learning — explanations, tutorials, study aids, lesson plans, quizzes
- Data & Technical — data analysis, SQL, spreadsheets, technical specs, system design
- Communication & Email — emails, messages, letters, professional communication
- Productivity & Planning — task lists, planning, scheduling, project management, meeting notes
- Other — anything that does not clearly fit the above

Output rules:
- Return only the category name, exactly as written above (including the "&" character)
- No explanation, no quotes, no punctuation
- Pick exactly one category

Examples:
Prompt: "Write a blog post about dog breeds..." → Writing & Content
Prompt: "Review this Python code for bugs..." → Coding & Development
Prompt: "Draft a polite reply to this customer complaint..." → Communication & Email
Prompt: "Generate a SQL query that joins these three tables..." → Data & Technical
`;

// ---------------------------
// Core chat function
// ---------------------------

async function ollamaChat(systemPrompt, userMessage, options = {}) {
  const { temperature = 0.7, maxTokens = 1024, timeout = 60000, model, stream = false, think, numCtx, signal } = options;

  const settings = await getOllamaSettings();
  const baseUrl = settings.ollamaUrl || 'http://localhost:11434';
  const resolvedModel = model || settings.ollamaModel || DEFAULT_MODEL;
  const resolvedCtx = numCtx || settings.ollamaNumCtx || 8192;
  const useThinking = think !== undefined ? think : (settings.useThinking !== false);

  let controller;
  if (signal) {
    controller = { signal };
  } else {
    controller = new AbortController();
    if (timeout) setTimeout(() => controller.abort(), timeout);
  }

  const body = {
    model: resolvedModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    stream,
    think: useThinking,
    options: {
      temperature,
      top_p: 0.95,
      top_k: 64,
      num_predict: maxTokens,
      num_ctx: resolvedCtx
    }
  };

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(settings.ollamaBearerToken ? { Authorization: `Bearer ${settings.ollamaBearerToken}` } : {})
    },
    body: JSON.stringify(body),
    signal: controller.signal
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`Ollama HTTP ${res.status}: ${res.statusText}${errorBody ? ' — ' + errorBody.substring(0, 500) : ''}`);
  }

  if (!stream) {
    const data = await res.json();
    return data.message?.content?.trim() || '';
  }

  // Streaming: return async generator
  return ollamaStreamGenerator(res.body);
}

async function* ollamaStreamGenerator(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.message?.content) yield data.message.content;
          if (data.done) return;
        } catch { /* skip malformed */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ---------------------------
// JSON parser for model output
// ---------------------------

export function extractJSON(raw) {
  try { return JSON.parse(raw); } catch {}
  const codeFence = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/.exec(raw);
  if (codeFence) { try { return JSON.parse(codeFence[1]); } catch {} }

  // Strip thinking tags that may have leaked despite think:false
  const stripped = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^(reasoning|thinking|analysis):[\s\S]*?\n\n/i, '')
    .trim();
  if (stripped !== raw) {
    try { return JSON.parse(stripped); } catch {}
  }

  const arrayMatch = /\[[\s\S]*\]/.exec(raw);
  if (arrayMatch) {
    try { return JSON.parse(arrayMatch[0]); } catch {}
    // Try fixing common Gemma JSON errors: trailing commas, single quotes
    try {
      const fixed = arrayMatch[0]
        .replace(/,(\s*[\]}])/g, '$1')
        .replace(/'/g, '"');
      return JSON.parse(fixed);
    } catch {}
  }

  const objMatch = /\{[\s\S]*\}/.exec(raw);
  if (objMatch) { try { return JSON.parse(objMatch[0]); } catch {} }

  const blocks = raw.split(/\n{2,}/);
  const results = blocks
    .map(b => b.replace(/^(?:\d+\.|-|\*)\s*/, '').trim())
    .filter(b => b.length > 10);
  if (results.length > 0) return results;
  throw new Error('Could not parse model output as JSON');
}

// ---------------------------
// Output cleaners
// ---------------------------

const CATEGORIES = [
  'Writing & Content', 'Coding & Development', 'Analysis & Research',
  'Creative & Design', 'Business & Marketing', 'Education & Learning',
  'Data & Technical', 'Communication & Email', 'Productivity & Planning', 'Other'
];

export function cleanTitle(raw) {
  let t = raw.replace(/^['"]+|['"]+$/g, '');
  t = t.replace(/^(?:Title|Suggested\s+title|Here\s+is)[:\s]+/i, '');
  t = t.replace(/[.!?]+$/, '').substring(0, 60).trim();
  return t || 'Untitled Prompt';
}

export function cleanCategory(raw) {
  const c = raw.replace(/^['"•\-*]+|['"•\-*]+$/g, '').trim();
  for (const cat of CATEGORIES) {
    if (c.toLowerCase() === cat.toLowerCase()) return cat;
  }
  for (const cat of CATEGORIES) {
    if (c.toLowerCase().includes(cat.split(/\s+/)[0].toLowerCase())) return cat;
  }
  return 'Other';
}

// Sanity check: detect when the model produced a response instead of a rewritten prompt
export function looksLikeResponseInsteadOfPrompt(text) {
  return /^(I |I'll |I can |I cannot |I'm |I am |As an AI|Sure,|Here's|Okay,|Great question)/i.test(text.trim());
}

// ---------------------------
// Public API
// ---------------------------

export async function checkConnection() {
  try {
    const settings = await getOllamaSettings();
    const baseUrl = settings.ollamaUrl || 'http://localhost:11434';
    const headers = {
      ...(settings.ollamaBearerToken ? { Authorization: `Bearer ${settings.ollamaBearerToken}` } : {})
    };
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
      ...(Object.keys(headers).length > 0 ? { headers } : {})
    });
    if (!res.ok) return { connected: false, models: [], model: settings.ollamaModel || DEFAULT_MODEL, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { connected: true, models: data.models?.map(m => m.name) || [], model: settings.ollamaModel || DEFAULT_MODEL, error: null };
  } catch (e) {
    return { connected: false, models: [], model: DEFAULT_MODEL, error: e.message };
  }
}

export async function* improvePrompt(promptText, options = {}) {
  const userMessage = `Rewrite this prompt to be clearer and more effective:

<prompt>
${promptText}
</prompt>

Return only the rewritten prompt.`;
  yield* await ollamaChat(IMPROVE_SYSTEM_PROMPT, userMessage, {
    temperature: 0.7, maxTokens: 2048, timeout: 90000, stream: true, think: true, signal: options.signal
  });
}

export async function generateVariants(promptText, count, options = {}) {
  const settings = await getOllamaSettings();
  const clampedCount = Math.max(2, Math.min(5, count || settings.variantCount || 3));
  const useThinkingSetting = settings.useThinking !== false;
  const userMessage = `Generate exactly ${clampedCount} meaningfully different variants of this prompt:

<prompt>
${promptText}
</prompt>

Return only a JSON array of ${clampedCount} strings.`;
  const raw = await ollamaChat(makeVariantsSystemPrompt(clampedCount), userMessage, {
    temperature: 0.9, maxTokens: 4096, timeout: 120000, stream: false, think: useThinkingSetting, signal: options.signal
  });

  try {
    const parsed = extractJSON(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean).slice(0, clampedCount);
  } catch {}

  const lines = raw.split(/\n{2,}/)
    .map(l => l.replace(/^(?:\d+\.|-|\*)\s*/, '').trim())
    .filter(l => l.length > 10)
    .slice(0, clampedCount);
  if (lines.length > 0) return lines;
  throw new Error('Model returned no usable variants');
}

export async function suggestTitle(promptText) {
  const raw = await ollamaChat(TITLE_SYSTEM_PROMPT,
`Read the prompt below and produce a 3-7 word title that captures its core task.

<prompt>
${promptText}
</prompt>

Return only the title.`, {
    temperature: 0.3, maxTokens: 20, timeout: 15000, stream: false, think: false
  });
  return cleanTitle(raw);
}

export async function suggestTags(promptText) {
  const raw = await ollamaChat(TAGS_SYSTEM_PROMPT,
`Read the prompt below and assign 2 to 5 lowercase tags.

<prompt>
${promptText}
</prompt>

Return only a JSON array.`, {
    temperature: 0.3, maxTokens: 80, timeout: 15000, stream: false, think: false
  });

  try {
    const parsed = extractJSON(raw);
    if (Array.isArray(parsed)) {
      const tags = parsed.map(t => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 5);
      if (tags.length > 0) return tags;
    }
  } catch {}

  // Fallback: parse comma-separated text
  const quoteStripper = /^["'\-*]+|["'\-*]+$/g;
  const tags = raw
    .split(/[,;\n]+/)
    .map(t => t.trim().toLowerCase().replace(quoteStripper, ''))
    .map(t => t.replace(/[{}[\]/\\<>"':|=+!@#$%^&*~`()-]/g, ''))
    .map(t => t.replace(/^(json|markdown|code\s*block|example|here|is|the|of|and|a)\s*/gi, ''))
    .map(t => t.replace(/\s+/g, '-'))  // collapse whitespace to hyphens
    .filter(t => t.length >= 2 && t.length <= 25 && /^[a-z0-9-]+$/.test(t))
    .slice(0, 5);

  return tags.length > 0 ? tags : ['untagged'];
}

export async function suggestCategory(promptText) {
  const raw = await ollamaChat(CATEGORY_SYSTEM_PROMPT,
`Classify the prompt below into exactly one category.

<prompt>
${promptText}
</prompt>

Return only the category name.`, {
    temperature: 0.1, maxTokens: 15, timeout: 15000, stream: false, think: false
  });
  return cleanCategory(raw);
}

export async function suggestAllMetadata(promptText) {
  const [titleResult, tagsResult, categoryResult] = await Promise.allSettled([
    suggestTitle(promptText),
    suggestTags(promptText),
    suggestCategory(promptText)
  ]);

  return {
    title: titleResult.status === 'fulfilled' ? titleResult.value : 'Untitled Prompt',
    tags: tagsResult.status === 'fulfilled' ? tagsResult.value : ['untagged'],
    category: categoryResult.status === 'fulfilled' ? categoryResult.value : 'Other'
  };
}
