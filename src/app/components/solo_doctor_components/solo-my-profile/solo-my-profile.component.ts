import { Component, effect } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { RouterLink } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../services/loader.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-solo-my-profile',
  standalone: true,
  imports: [RouterLink, GoogleMapsModule, CommonModule, TranslateModule],
  templateUrl: './solo-my-profile.component.html',
  styleUrl: './solo-my-profile.component.css'
})
export class SoloMyProfileComponent {
  soloDrProfile = this.service._soloDoctorProfile;
  center: google.maps.LatLngLiteral = { lat: 28.6139, lng: 77.2090 };
  zoom = 12;
  imagePreview: string = 'assets/img/np_pro.jpg';
  constructor(private service: CommonService, private loaderService: LoaderService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    this.getSoloDoctorProfile()
    effect(() => {
      this.soloDrProfile();
      this.center = {
        lat: Number(this.soloDrProfile()?.clinic?.location?.latitude),
        lng: Number(this.soloDrProfile()?.clinic?.location?.longitude)
      }
    });
  }

  getMinVal(range: string | undefined) {
    return JSON.parse(range || '{}').min
  }

  getMaxVal(range: string | undefined) {
    return JSON.parse(range || '{}').max
  }

  openModal(imageUrl: string | undefined) {
    if (imageUrl) {
      this.imagePreview = imageUrl
    }
  }

  getSoloDoctorProfile() {
    this.loaderService.show();
    this.service.get<any>('solo_doctor/get_profile').subscribe((resp) => {
      this.service._soloDoctorProfile.set(resp.data);
      this.loaderService.hide();
    },
      (error) => {
        this.loaderService.hide();
      })
  };

  mapDoctorAvailability(data: any[]): any[] {
    const grouped: { [key: string]: any[] } = {};

    data?.forEach(item => {
      const day = item.day.toLowerCase();

      if (!grouped[day]) {
        grouped[day] = [];
      }

      grouped[day].push({
        start_time: item.start_time,
        end_time: item.end_time,
        slot_duration: +item.slot_duration,
        start_time_utc: item.start_time_utc,
        end_time_utc: item.end_time_utc
      });
    });

    return Object.keys(grouped).map(day => ({
      day,
      slots: grouped[day]
    }));
  }

  convertTime(time: any): any {
    const localTime = new Date(time).toLocaleString();
    return localTime
  }
}

