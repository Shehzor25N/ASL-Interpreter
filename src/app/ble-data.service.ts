import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BleDataService {
  private receivedTextSource = new BehaviorSubject<string>(''); // BehaviorSubject to store the BLE data
  receivedText$ = this.receivedTextSource.asObservable(); // Observable for the BLE data

  // Update the BLE data
  updateReceivedText(newText: string) {
    this.receivedTextSource.next(newText);
  }
}
