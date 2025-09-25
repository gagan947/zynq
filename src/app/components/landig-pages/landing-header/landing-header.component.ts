import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.css'
})
export class LandingHeaderComponent {
  selectedLang: string = 'en';
  private scriptElement?: HTMLScriptElement;
  constructor(
  ) {
    this.loadScript();
  }


  loadScript() {
    const existingScript = document.querySelector('script[src*="translate_a/element.js"]');
    if (existingScript) {
      this.onCustomLangChange('en');
      return;
    }

    const scriptElement = document.createElement('script');
    scriptElement.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

    window['googleTranslateElementInit'] = () => {
      new google.translate.TranslateElement({
        includedLanguages: 'sv,en',
        autoDisplay: false,
        layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL
      }, 'google_translate_element');

      setTimeout(() => {
        this.onCustomLangChange('en');
      }, 1000);
    };

    document.body.appendChild(scriptElement);
  }

  setGoogleTranslateValue(selectedLang: string) {
    let attempts = 0;
    const maxAttempts = 0;
    const interval = 500;

    const trySetLang = () => {
      const selectEl: HTMLSelectElement | null = document.querySelector('.goog-te-combo');
      if (selectEl) {
        selectEl.value = selectedLang;
        selectEl.dispatchEvent(new Event('change'));
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(trySetLang, interval);
      } else {
        console.warn('Google Translate dropdown not found after max attempts');
      }
    };

    trySetLang();
  }

  onCustomLangChange(lang: any) {
    this.selectedLang = lang
    const selectedLang = lang
    this.setGoogleTranslateValue(selectedLang);
  }

  ngOnDestroy() {
    // 1. Remove script
    if (this.scriptElement && this.scriptElement.parentNode) {
      this.scriptElement.parentNode.removeChild(this.scriptElement);
    }

    // 2. Clean up the google translate container
    const translateContainer = document.getElementById('google_translate_element');
    if (translateContainer) {
      translateContainer.innerHTML = '';
    }

    // 3. Remove global init function to avoid memory leaks
    delete window.googleTranslateElementInit;
    delete (window as any).google;
  }

}

declare var google: any
declare global {
  interface Window {
    googleTranslateElementInit: any;
  }
}

