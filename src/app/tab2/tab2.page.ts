import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // Add these imports

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [HttpClientModule, IonicModule, CommonModule, FormsModule, ReactiveFormsModule]  // Import FormsModule and ReactiveFormsModule
})
export class Tab2Page {
  // Store the form values in this object
  formValues = {
    flex_1: null,
    flex_2: null,
    flex_3: null,
    flex_4: null,
    flex_5: null,
    GYRx: null,
    GYRy: null,
    GYRz: null,
    ACCx: null,
    ACCy: null,
    ACCz: null
  };

  predictionResult: string | null = null;

  constructor(private http: HttpClient) {}

  // Function to send data to Flask API
  submitForm() {
    const inputData = [
      this.formValues.flex_1,
      this.formValues.flex_2,
      this.formValues.flex_3,
      this.formValues.flex_4,
      this.formValues.flex_5,
      this.formValues.GYRx,
      this.formValues.GYRy,
      this.formValues.GYRz,
      this.formValues.ACCx,
      this.formValues.ACCy,
      this.formValues.ACCz
    ];

    const apiUrl = 'http://100.101.248.5:5000/predict'; // Flask API URL

    this.http.post(apiUrl, { data: inputData }).subscribe(
      (response: any) => {
        this.predictionResult = response.prediction;
        console.log('Prediction Result:', this.predictionResult);
      },
      (error) => {
        console.error('Error:', error);
        this.predictionResult = 'No prediction available';
      }
    );
  }
}
