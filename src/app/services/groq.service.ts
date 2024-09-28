import { Injectable } from '@angular/core';
import Groq from 'groq-sdk';

@Injectable({
  providedIn: 'root'
})
export class GroqService {
  private groq: any;
  private apiKey: string = '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';

  constructor() {
    this.groq = new Groq({ apiKey: this.apiKey });
  }

  async getChatCompletion(): Promise<string> {
    const response = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Explain the importance of fast language models',
        },
      ],
      model: 'llama3-8b-8192',
    });

    return response.choices[0]?.message?.content || '';
  }
}
