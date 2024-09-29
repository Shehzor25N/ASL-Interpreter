import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';  // Import FormBuilder and FormGroup
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';  // Use ReactiveFormsModule

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [HttpClientModule, IonicModule, CommonModule, ReactiveFormsModule]
})
export class Tab2Page {
  sensorForm: FormGroup;  // Declare the form

  predictionResult: string | null = null;

  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    // Initialize the form with FormBuilder
    this.sensorForm = this.formBuilder.group({
      flex_1: [null, Validators.required],
      flex_2: [null, Validators.required],
      flex_3: [null, Validators.required],
      flex_4: [null, Validators.required],
      flex_5: [null, Validators.required],
      GYRx: [null, Validators.required],
      GYRy: [null, Validators.required],
      GYRz: [null, Validators.required],
      ACCx: [null, Validators.required],
      ACCy: [null, Validators.required],
      ACCz: [null, Validators.required]
    });
  }

  // Function to submit form and make API call
  submitForm() {
    if (this.sensorForm.valid) {
      const inputData = Object.values(this.sensorForm.value);

      const apiUrl = 'http://100.101.248.5:5000/predict';  // Flask API endpoint

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
}
