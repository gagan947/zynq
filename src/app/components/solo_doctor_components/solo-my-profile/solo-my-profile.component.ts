import { Component, effect } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { RouterLink } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-solo-my-profile',
  standalone: true,
  imports: [RouterLink, GoogleMapsModule],
  templateUrl: './solo-my-profile.component.html',
  styleUrl: './solo-my-profile.component.css'
})
export class SoloMyProfileComponent {
  soloDrProfile = this.service._soloDoctorProfile;
  center: google.maps.LatLngLiteral = { lat: 28.6139, lng: 77.2090 };
  zoom = 12;
  imagePreview: string = 'assets/img/doctor.png';
  constructor(private service: CommonService) {
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
}
