import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import Groq from 'groq-sdk';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent]
})
export class Tab3Page implements OnInit {
  message: string = '';
  private groq: any;
  private apiKey: string = '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'; // Replace with your actual API key

  constructor() {
    this.groq = new Groq({ apiKey: this.apiKey, dangerouslyAllowBrowser: true });
  }

  ngOnInit() {
    this.getChatMessage();
  }

  async getChatMessage() {
    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: 'Explain the importance of fast language models',
          },
        ],
        model: 'llama3-8b-8192',
      });

      this.message = response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error fetching chat completion:', error);
    }
  }
}
