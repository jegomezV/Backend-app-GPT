import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async firstMessage(text: string): Promise<string | null> {
    try {
      const gptResponse = await this.client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a friendly assistant that helps to summarize articles. your responses must be with MD (markdown)."
          },
          {role: "user", content: text}
        ],
        model: "gpt-3.5-turbo",
      });

      return gptResponse.choices[0].message.content;
    } catch (e) {
      console.error('El ERROR GPTRESPONSE', e);
      return null;
    }
  }

  async nextMessageIA(text: string, chat: {
    role: "system" | "user" | "assistant",
    content: string
  }[]): Promise<string> {
    const gptResponse = await this.client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a friendly assistant that helps to summarize articles and response questions about it, your responses must be with MD (markdown)."
        },
        ...chat,
        {role: "user", content: text}
      ],
      model: "gpt-3.5-turbo",
    });

    return gptResponse.choices[0].message.content;
  }
}
