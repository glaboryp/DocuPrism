// Types for Chrome Built-in AI API

// Sampling modes accepted by the Prompt API on the web.
// Raw topK/temperature are Chrome Extensions only and deprecated on the web.
export type AISamplingMode =
  | 'most-predictable'
  | 'predictable'
  | 'slightly-predictable'
  | 'balanced'
  | 'slightly-creative'
  | 'creative'
  | 'most-creative';

// Returned by availability(), which replaced the legacy capabilities()
export type AIAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

export interface AISummarizerOptions {
  type?: 'tldr' | 'key-points' | 'teaser' | 'headline';
  format?: 'markdown' | 'plain-text';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
}

export interface AISummarizer {
  summarize(input: string, options?: Partial<AISummarizerOptions>): Promise<string>;
  destroy(): void;
}

export interface AIPromptOptions {
  samplingMode?: AISamplingMode;
}

export interface AILanguageModel {
  prompt(input: string, options?: Partial<AIPromptOptions>): Promise<string>;
  promptStreaming(input: string, options?: Partial<AIPromptOptions>): AsyncIterable<string>;
  countPromptTokens(input: string, options?: Partial<AIPromptOptions>): Promise<number>;
  destroy(): void;
}

// Note: Window interface extensions are declared in useChromeAI.ts to avoid conflicts
export {};
