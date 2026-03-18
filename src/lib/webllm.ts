import * as webllm from '@mlc-ai/web-llm';

export type ModelId =
  | 'qwen-2.5-3b'
  | 'llama-3.2-3b'
  | 'phi-3.5-mini'
  | 'gemma-2b'
  | 'deepseek-coder-1.3b';

export interface ModelInfo {
  id: ModelId;
  label: string;
  description: string;
  size: string;
  webllmId: string;
  strengths: string[];
}

export const MODEL_CATALOG: ModelInfo[] = [
  {
    id: 'qwen-2.5-3b',
    label: 'Qwen 2.5 3B Instruct',
    description: 'Strong reasoning, coding, and multilingual support',
    size: '~2GB',
    webllmId: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    strengths: ['Reasoning', 'Coding', 'Multilingual'],
  },
  {
    id: 'llama-3.2-3b',
    label: 'Llama 3.2 3B Instruct',
    description: 'Stable, consistent outputs with great general chat',
    size: '~2GB',
    webllmId: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    strengths: ['General Chat', 'Consistency', 'Stable'],
  },
  {
    id: 'phi-3.5-mini',
    label: 'Phi-3.5 Mini Instruct',
    description: 'Extremely fast, strong at coding and logic',
    size: '~2.3GB',
    webllmId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    strengths: ['Speed', 'Coding', 'Logic'],
  },
  {
    id: 'gemma-2b',
    label: 'Gemma 2B',
    description: 'Clean, safe outputs for general Q&A',
    size: '~1.4GB',
    webllmId: 'gemma-2-2b-it-q4f16_1-MLC',
    strengths: ['Safety', 'Q&A', 'Lightweight'],
  },
  {
    id: 'deepseek-coder-1.3b',
    label: 'DeepSeek Coder 1.3B',
    description: 'Small but powerful for programming tasks',
    size: '~1GB',
    webllmId: 'DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC',
    strengths: ['Coding', 'Small Footprint', 'Programming'],
  },
];

export function getModelInfo(id: ModelId): ModelInfo {
  return MODEL_CATALOG.find((m) => m.id === id) || MODEL_CATALOG[0];
}

type ProgressCallback = (progress: { text: string; progress: number }) => void;
type StreamCallback = (token: string) => void;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class WebLLMEngine {
  private engine: webllm.MLCEngine | null = null;
  private currentModelId: string | null = null;
  private isLoading = false;
  private abortController: AbortController | null = null;

  async loadModel(
    modelId: ModelId,
    onProgress?: ProgressCallback
  ): Promise<void> {
    const info = getModelInfo(modelId);
    if (this.currentModelId === info.webllmId && this.engine) {
      return;
    }

    this.isLoading = true;

    try {
      if (this.engine) {
        await this.engine.unload();
        this.engine = null;
        this.currentModelId = null;
      }

      const initProgressCallback = (report: webllm.InitProgressReport) => {
        if (onProgress) {
          const match = report.text.match(/(\d+)%/);
          const progress = match ? parseInt(match[1]) / 100 : 0;
          onProgress({ text: report.text, progress });
        }
      };

      this.engine = new webllm.MLCEngine();
      this.engine.setInitProgressCallback(initProgressCallback);
      await this.engine.reload(info.webllmId);
      this.currentModelId = info.webllmId;
    } catch (error) {
      this.engine = null;
      this.currentModelId = null;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async chat(
    messages: ChatMessage[],
    onStream?: StreamCallback
  ): Promise<string> {
    if (!this.engine) {
      throw new Error('No model loaded. Please load a model first.');
    }

    this.abortController = new AbortController();

    try {
      if (onStream) {
        let fullResponse = '';
        const asyncChunkGenerator = await this.engine.chat.completions.create({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
          temperature: 0.7,
          max_tokens: 1024,
        });

        for await (const chunk of asyncChunkGenerator) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            fullResponse += delta;
            onStream(delta);
          }
          if (this.abortController?.signal.aborted) {
            break;
          }
        }

        return fullResponse;
      } else {
        const reply = await this.engine.chat.completions.create({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: 0.7,
          max_tokens: 1024,
        });

        return reply.choices[0]?.message?.content || 'No response generated.';
      }
    } catch (error) {
      if (this.abortController?.signal.aborted) {
        return '[Generation stopped]';
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  stopGeneration(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  async unload(): Promise<void> {
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
      this.currentModelId = null;
    }
  }

  isModelLoaded(): boolean {
    return this.engine !== null && this.currentModelId !== null;
  }

  getLoadedModel(): string | null {
    return this.currentModelId;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  isWebGPUSupported(): boolean {
    return 'gpu' in navigator;
  }
}

export const llmEngine = new WebLLMEngine();
