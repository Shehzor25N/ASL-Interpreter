import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCardTitle, IonCard, IonCardHeader, IonToast, IonButton, IonCardContent, IonIcon, IonCol, IonGrid, IonRow, IonCardSubtitle, AlertController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';
import Groq from 'groq-sdk';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonCardSubtitle, IonRow, IonGrid, IonCol, IonIcon, IonCardContent, IonButton, IonToast, IonCardHeader, IonCard, IonCardTitle, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class Tab1Page implements OnInit {
  gesture: string = ' RESEARCH PAPER, YOU LIKE WRITE? ';
  isListening: boolean = false;
  recognizedText: string = 'Yes I do';
  translate: string = '';

  private groq: any;
  private apiKey: string = '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'; // Replace with your actual API key

  constructor(private alertController: AlertController) {
    SpeechRecognition.requestPermissions();
    this.groq = new Groq({ apiKey: this.apiKey, dangerouslyAllowBrowser: true });
  }

  ngOnInit() {
    this.translateASLGloss();
  }

  async speak() {
    await TextToSpeech.speak({
      text: this.gesture,
      lang: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'playback',
    });
  }

  async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  async startListening() {
    const hasPermission = await SpeechRecognition.checkPermissions();
    if (hasPermission.speechRecognition !== 'granted') {
      const permission = await SpeechRecognition.requestPermissions();
      if (permission.speechRecognition !== 'granted') {
        alert('Permission not granted!');
        return;
      }
    }

    this.isListening = true;
    this.recognizedText = ''; // Clear previous text

    SpeechRecognition.start({
      language: 'en-US',
      maxResults: 1,
      prompt: 'Say something',
      partialResults: true,
    });

    // Listen for partial results
    SpeechRecognition.addListener('partialResults', (data: any) => {
      console.log('partialResults received:', data.value);
      if (data.value && data.value.length > 0) {
        this.recognizedText = data.value[0];
        this.gesture = data.value[0];
        this.translateASLGloss(); // Translate the recognized text
      }
    });

    setTimeout(() => {
      this.stopListening();
    }, 5000);
  }

  async stopListening() {
    if (Capacitor.getPlatform() !== 'web') {
      await SpeechRecognition.stop();
      SpeechRecognition.removeAllListeners();
      this.isListening = false;
    } else {
      this.showAlert('Speech recognition is not supported on the web.');
    }
  }

  getGestureImage(gesture: string): string {
    switch (gesture.toUpperCase()) {
      case 'A':
        return 'assets/gestures/A.png';
      case 'B':
        return 'assets/gestures/B.png';
      default:
        return 'assets/gestures/A.png';
    }
  }

  async translateASLGloss() {
    console.log('Gesture to translate:', this.gesture); // Verify the gesture value
    const content = `Translate the following ASL gloss into English: ${this.gesture}. And do not add more than that. Remove quotation marks. Be simple and clear. Only give the translated text.`;
    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: content, // Using template literal for interpolation
          },
        ],
        model: 'llama3-8b-8192',
      });
  
      console.log('API response:', response); // Check the API response
      this.translate = response.choices[0]?.message?.content || '';
      console.log('Translated text:', this.translate); // Verify the translated text
    } catch (error) {
      console.error('Error translating ASL gloss:', error); // Handle errors
    }
  }

}
