import { Component } from '@angular/core';
import { Router, } from '@angular/router';
import { effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonService } from '../../../services/common.service';
import { ClinicProfile } from '../../../models/clinic-profile';
import { DoctorProfile } from '../../../models/doctorProfile';
import { LoaderService } from '../../../services/loader.service';
import { SocketService } from '../../../services/socket.service';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  clinicPofile: ClinicProfile | null = null;
  doctorPofile: DoctorProfile | null = null;
  soloDoctorPofile: any | null = null;
  selectedLang: string = 'en';
  clinicProfile = this.service._clinicProfile;
  drProfile = this.service._doctorProfile;
  soloDrProfile = this.service._soloDoctorProfile;
  constructor(public auth: AuthService, public service: CommonService, private router: Router, public loaderService: LoaderService, private socketService: SocketService, private notification: NotificationService
  ) {
    this.loadScript();
    effect(() => {
      this.clinicProfile();
      this.drProfile();
      this.soloDrProfile();
    });
    this.loaderService.show();

    if (this.auth.getRoleName() == 'clinic') {
      this.getClinicProfile();
    } else if (this.auth.getRoleName() == 'doctor') {
      this.getDoctorProfile();
    } else {
      this.getSoloDoctorProfile();
    }
  }

  private destroy$ = new Subject<void>();
  public notificationList: any[] = [];

  ngOnInit() {
    this.getNotification();

    this.notification.message$.subscribe((msg) => {
      if (msg) {
        this.getNotification()
      }
    });
  }

  getNotification() {
    this.service.get('webuser/notifications/get').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.notificationList = res.data;
      this.service._notifications.set(this.notificationList);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getClinicProfile() {
    this.service.get<any>('clinic/get-profile').subscribe((resp) => {
      this.clinicPofile = resp.data;
      this.service._clinicProfile.set(this.clinicPofile);
      this.loaderService.hide();
    },
      (error) => {
        this.loaderService.hide();
      })
  };

  getDoctorProfile() {
    this.service.get<any>('doctor/get_profile').subscribe((resp) => {
      this.doctorPofile = resp.data;
      this.service._doctorProfile.set(this.doctorPofile);
      this.loaderService.hide();
    },
      (error) => {
        this.loaderService.hide();
      })
  };

  getSoloDoctorProfile() {
    this.service.get<any>('solo_doctor/getDoctorProfileByStatus/1').subscribe((resp) => {
      this.soloDoctorPofile = resp.data;
      this.service._soloDoctorProfile.set(this.soloDoctorPofile);
      this.loaderService.hide();
    },
      (error) => {
        this.loaderService.hide();
      })
  };

  logout() {
    this.auth.logout();
    this.socketService.setChatId(null);
    this.router.navigateByUrl('/');
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
    // this.service.language.set(selectedLang)
    this.setGoogleTranslateValue(selectedLang);
  }
}

declare var google: any
declare global {
  interface Window {
    googleTranslateElementInit: any;
  }
}

