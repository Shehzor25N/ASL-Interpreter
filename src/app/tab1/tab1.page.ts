import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCardTitle, IonCard, IonCardHeader, IonToast, IonButton, IonCardContent, IonIcon, IonCol, IonGrid, IonRow, IonCardSubtitle, AlertController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';
import Groq from 'groq-sdk';
import { BleClient, numbersToDataView } from '@capacitor-community/bluetooth-le';

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
  recognizedText: string = '';
  translate: string = '';
  deviceId: string = ''; // Store the device ID after connecting
  SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb'; // Example: '0000180d-0000-1000-8000-00805f9b34fb'
  CHARACTERISTIC_UUID = '00002a37-0000-1000-8000-00805f9b34fb'; // Example: '00002a37-0000-1000-8000-00805f9b34fb'



  
  private groq: any;
  private apiKey: string = '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'; // Replace with your actual API key

  constructor(private alertController: AlertController) {
    SpeechRecognition.requestPermissions();
    this.groq = new Groq({ apiKey: this.apiKey, dangerouslyAllowBrowser: true });
  }

  ngOnInit() {
    this.translateASLGloss();
    this.initializeBLE();
  }

  async initializeBLE() {
    try {
      // Initialize Bluetooth
      await BleClient.initialize();

      console.log('Bluetooth initialized.');

      // Request to scan and select a device
      const device = await BleClient.requestDevice({
        services: [this.SERVICE_UUID],
      });

      console.log('Device selected:', device);

      // Connect to the selected device
      await BleClient.connect(device.deviceId);
      this.deviceId = device.deviceId;

      console.log('Connected to device:', this.deviceId);
    } catch (error) {
      console.error('Error initializing BLE:', error);
    }
  }

  async sendRecognizedText() {
    try {
      if (!this.deviceId || !this.recognizedText) {
        console.error('Device not connected or recognized text is empty.');
        return;
      }

      // Convert recognized text to DataView for BLE transmission
      const textArray = Array.from(this.recognizedText, (c) => c.charCodeAt(0));
      const dataView = numbersToDataView(textArray);

      // Write the recognized text to the BLE characteristic
      await BleClient.write(this.deviceId, this.SERVICE_UUID, this.CHARACTERISTIC_UUID, dataView);

      console.log('Sent recognized text:', this.recognizedText);
    } catch (error) {
      console.error('Error sending recognized text:', error);
    }
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
    console.log('Speech recognition started');
  
    // Start listening
    SpeechRecognition.start({
      language: 'en-US',
      maxResults: 2,
      prompt: 'Say something', // Prompt message (Android only)
      partialResults: true, // Return partial results
      popup: false, // Popup window (Android only)
    });
     

    // Listen for partial results
    SpeechRecognition.addListener('partialResults', (data: any) => {
      console.log('partialResults was fired:', data.matches);
      if (data.matches && data.matches.length > 0) {
        this.recognizedText = data.matches[0];

        console.log('Recognized text:', this.recognizedText);
      }
    });

    setTimeout(() => {
      this.stopListening();
    }, 5000);
  }

  async stopListening() {
    await SpeechRecognition.stop();
    SpeechRecognition.removeAllListeners();
    this.isListening = false;
    console.log('Speech recognition stopped');
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
