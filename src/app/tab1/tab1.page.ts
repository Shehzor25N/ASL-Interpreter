import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCardTitle, IonCard, IonCardHeader, IonToast, IonButton, IonCardContent, IonIcon, IonCol, IonGrid, IonRow, IonCardSubtitle, AlertController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';
import Groq from 'groq-sdk';
import { BleClient, numbersToDataView } from '@capacitor-community/bluetooth-le';
import { BleDataService } from '../ble-data.service';  // Import the service
import { EventEmitter } from 'events'; 


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
  isConnected: boolean = false; // Connection status
  receivedText: string = ''; // Variable to hold the text received from Arduino
  translate: string = '';
  parsedReceivedData: number[] = [];  // Store parsed uint16_t values

  
  deviceId: string = ''; // Store the device ID after connecting
  SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb'; // Example: '0000180d-0000-1000-8000-00805f9b34fb'
  CHARACTERISTIC_UUID = '00002a37-0000-1000-8000-00805f9b34fb'; // Example: '00002a37-0000-1000-8000-00805f9b34fb'



  
  private groq: any;
  private apiKey: string = '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'; // Replace with your actual API key
  private sensorDataEmitter = new EventEmitter();

  constructor(private alertController: AlertController, private cd: ChangeDetectorRef, private bleDataService: BleDataService) {
    SpeechRecognition.requestPermissions();
    this.groq = new Groq({ apiKey: this.apiKey, dangerouslyAllowBrowser: true });

    this.sensorDataEmitter.on('buttonSignal', () => {
      this.startListening();
    });
  }

  // Set up an event listener for the button signal  
  ngOnInit() {
    this.translateASLGloss();
    this.initializeBLE();
  }

  async initializeBLE() {
    try {
      await BleClient.initialize();
      console.log('Bluetooth initialized.');
    } catch (error) {
      console.error('Error initializing BLE:', error);
    }
  }

  
  // Function to connect to the Arduino BLE device
  /**
   * Connects to a Bluetooth device using the BleClient.
   * 
   * This method requests a Bluetooth device that provides the specified service UUID,
   * connects to the selected device, and starts receiving notifications from it.
   */

  async connectToDevice() {
    try {
      const device = await BleClient.requestDevice({
        services: [this.SERVICE_UUID],
      });

      console.log('Device selected:', device);
      await BleClient.connect(device.deviceId);
      this.deviceId = device.deviceId;
      this.isConnected = true;

      console.log('Connected to device:', this.deviceId);

      // Start receiving notifications
      await this.startReceivingNotifications();
    } catch (error) {
      console.error('Error connecting to device:', error);
      this.isConnected = false;
    }
  }

  
 
  /**
   * Disconnects from the currently connected BLE device.
   * 
   * This method attempts to disconnect from the BLE device identified by `this.deviceId`.
   * If the disconnection is successful, it sets `this.isConnected` to `false` and logs
   * a message indicating the device has been disconnected. If an error occurs during
   */

  async disconnectDevice() {
    try {
      await BleClient.disconnect(this.deviceId);
      this.isConnected = false;
      console.log('Disconnected from device:', this.deviceId);
    } catch (error) {
      console.error('Error disconnecting from device:', error);
    }
  }




  /**
   * Starts receiving notifications from a BLE device and processes the incoming data.
   * 
   * This method initiates notifications from a BLE device using the specified service and characteristic UUIDs.
   * It parses the incoming DataView to extract int16_t values and checks if the received data matches a predefined
   * button signal sequence. If the data matches, it emits a 'buttonSignal' event.
   * 
   */


  async startReceivingNotifications() {
    try {
      await BleClient.startNotifications(this.deviceId, this.SERVICE_UUID, this.CHARACTERISTIC_UUID, (value) => {
        // Parse the incoming DataView (BLE data as an array of uint8_t)
        const dataView = new DataView(value.buffer);
        const dataArray = [];
  
        // Loop through the DataView to extract int16_t values (each 2 bytes)
        for (let i = 0; i < dataView.byteLength; i += 2) {
          const int16Value = dataView.getInt16(i, true); // true for little-endian, assuming ESP32 uses little-endian
          dataArray.push(int16Value);
        }
  
        // Define the button signal sequence
        const buttonSignal = [12610, 17232, 16984, 21838, 18762, 20559];
  
        // Check if the received data matches the button signal
        if (dataArray.length === buttonSignal.length && dataArray.every((value, index) => value === buttonSignal[index])) {
          this.sensorDataEmitter.emit('buttonSignal');
        }
      });
      console.log('Started listening for button press notifications');
    } catch (error) {
      console.error('Error starting notifications:', error);
    }
  }



  // Function to process received data (optional)
  processReceivedData(dataArray: number[]) {
    // Here you can do something with the received data, e.g., update the UI
    console.log("Processing received data:", dataArray);
  }

  
  

  async stopReceivingNotifications() {
    try {
      await BleClient.stopNotifications(this.deviceId, this.SERVICE_UUID, this.CHARACTERISTIC_UUID);
      console.log('Stopped receiving notifications from Arduino.');
    } catch (error) {
      console.error('Error stopping notifications:', error);
    }
  }



  /**
   * Sends the recognized text to a BLE device.
   * 
   * This method checks if the device is connected and if there is recognized text available.
   * If both conditions are met, it converts the recognized text to a DataView and writes it
   * to the specified BLE characteristic.
   * 
   */


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

  

  /**
   * Asynchronously converts the text of the current gesture to speech.
   * 
   */


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
    console.log('Button signal received! Starting to listen...');
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
        this.sendRecognizedText(); // Send the recognized text via BLE
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

  



  /**
   * Translates the current ASL gloss gesture to English using an AI model.
   * 
   * This function sends the current gesture to an AI model for translation and
   * updates the `translate` property with the translated text. It logs the gesture,
   * the API response, and the translated text for debugging purposes.
   */
  async translateASLGloss() { // Function to translate ASL gloss to English
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
