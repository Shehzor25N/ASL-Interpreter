import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'; // Import FormBuilder and FormGroup
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // Use ReactiveFormsModule

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [HttpClientModule, IonicModule, CommonModule, ReactiveFormsModule],
})
export class Tab2Page {
  sensorForm: FormGroup; // Define the form group
  predictionResult: string | null = null; // Variable to store the prediction result

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {
    // Initialize the form with default values
    this.sensorForm = this.formBuilder.group({
      flex_1: [20, Validators.required], // Set default value to 20
      flex_2: [-19, Validators.required], // Set default value to -19
      flex_3: [63, Validators.required], // Set default value to 63
      flex_4: [59, Validators.required], // Set default value to 59
      flex_5: [42, Validators.required], // Set default value to 42
      GYRx: [-1, Validators.required], // Set default value to -1
      GYRy: [1, Validators.required], // Set default value to 1
      GYRz: [0, Validators.required], // Set default value to 0
      ACCx: [956, Validators.required], // Set default value to 956
      ACCy: [1516, Validators.required], // Set default value to 1516
      ACCz: [885, Validators.required], // Set default value to 885
    });
  }

  // Method to submit the form data
  submitForm() {
    if (this.sensorForm.valid) {
      const formData = this.sensorForm.value;

      // API URL for the Flask backend
      const apiUrl = 'http://100.101.248.5:5000/predict'; // Replace with your actual Flask API URL

      // Send the form data via POST request to Flask API
      this.http.post(apiUrl, { data: Object.values(formData) }).subscribe(
        (response: any) => {
          // Update the prediction result with the returned value
          this.predictionResult = response.prediction;
          console.log('Prediction Result:', this.predictionResult);
        },
        (error) => {
          // Handle the error
          console.error('Error:', error);
          this.predictionResult = 'Error fetching prediction';
        }
      );
    }
  }
}
