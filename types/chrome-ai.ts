// Types for Chrome Built-in AI API
export interface AICapabilityAvailability {
  available: 'readily' | 'after-download' | 'no';
}

export interface AISummarizerCapabilities {
  available: 'readily' | 'after-download' | 'no';
  defaultTopK?: number;
  maxTopK?: number;
  defaultTemperature?: number;
}

export interface AISummarizerOptions {
  type?: 'tl;dr' | 'key-points' | 'teaser' | 'headline';
  format?: 'markdown' | 'plain-text';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
}

export interface AISummarizer {
  summarize(input: string, options?: Partial<AISummarizerOptions>): Promise<string>;
  destroy(): void;
}

export interface AIPromptCapabilities {
  available: 'readily' | 'after-download' | 'no';
  defaultTopK?: number;
  maxTopK?: number;
  defaultTemperature?: number;
}

export interface AIPromptOptions {
  temperature?: number;
  topK?: number;
  systemPrompt?: string;
}

export interface AILanguageModel {
  prompt(input: string, options?: Partial<AIPromptOptions>): Promise<string>;
  promptStreaming(input: string, options?: Partial<AIPromptOptions>): ReadableStream<string>;
  countPromptTokens(input: string, options?: Partial<AIPromptOptions>): Promise<number>;
  destroy(): void;
}

// Extended Window interface for Chrome Built-in AI
declare global {
  interface Window {
    ai?: {
      summarizer?: {
        capabilities(): Promise<AISummarizerCapabilities>;
        create(options?: Partial<AISummarizerOptions>): Promise<AISummarizer>;
      };
      languageModel?: {
        capabilities(): Promise<AIPromptCapabilities>;
        create(options?: Partial<AIPromptOptions>): Promise<AILanguageModel>;
      };
    };
  }
}

export {};