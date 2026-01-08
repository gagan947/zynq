import { Component, effect } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clinic-profile',
  standalone: true,
  imports: [RouterLink, GoogleMapsModule, TranslateModule, CommonModule],
  templateUrl: './clinic-profile.component.html',
  styleUrl: './clinic-profile.component.css'
})
export class ClinicProfileComponent {
  clinicProfile = this.service._clinicProfile;
  center: google.maps.LatLngLiteral = { lat: 28.6139, lng: 77.2090 };
  zoom = 12;
  imagePreview: string = 'assets/img/np_pro.jpg';
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(private fb: FormBuilder, private service: CommonService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    effect(() => {
      this.clinicProfile();
      this.center = {
        lat: Number(this.clinicProfile()?.location?.latitude),
        lng: Number(this.clinicProfile()?.location?.longitude)
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

  convertTime(time: any): any {
    const [hours, minutes, seconds] = time.split(':').map(Number);

    const utcDate = new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));

    const localHours = String(utcDate.getHours()).padStart(2, '0');
    const localMinutes = String(utcDate.getMinutes()).padStart(2, '0');

    return `${localHours}:${localMinutes}`;
  }

  collapseStates: boolean[] = [];
  toggleCollapse(collapseStates: boolean[], index: number) {
    collapseStates[index] = !collapseStates[index];
  }

  sortDays(data: any[] | undefined) {
    return data?.sort(
      (a, b) => this.daysOfWeek.indexOf(a.day_of_week) - this.daysOfWeek.indexOf(b.day_of_week)
    );
  }
}
