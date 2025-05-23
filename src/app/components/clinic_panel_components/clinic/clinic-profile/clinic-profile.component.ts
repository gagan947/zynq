import { Component, effect } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-clinic-profile',
  standalone: true,
  imports: [RouterLink, GoogleMapsModule],
  templateUrl: './clinic-profile.component.html',
  styleUrl: './clinic-profile.component.css'
})
export class ClinicProfileComponent {
  clinicProfile = this.service._clinicProfile;
  center: google.maps.LatLngLiteral = { lat: 28.6139, lng: 77.2090 };
  zoom = 12;
  imagePreview: string = 'assets/img/doctor.png';
  constructor(private fb: FormBuilder, private service: CommonService) {
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
}
