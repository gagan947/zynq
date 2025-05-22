import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private _showLoader = new BehaviorSubject<boolean>(false);
  showLoader$ = this._showLoader.asObservable();

  show() {
    console.log('show loader');
    this._showLoader.next(true);
  }

  hide() {
    console.log('hide loader');
    this._showLoader.next(false);
  }

  // Optional: expose getter for boolean
  get isLoading(): boolean {
    return this._showLoader.getValue();
  }
}
