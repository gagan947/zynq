import { Component } from '@angular/core';
import { Router, } from '@angular/router';
import { effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonService } from '../../../services/common.service';
import { ClinicProfile } from '../../../models/clinic-profile';
import { DoctorProfile } from '../../../models/doctorProfile';

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

  clinicProfile = this.service._clinicProfile;
  drProfile = this.service._doctorProfile;
  constructor(public auth: AuthService, private service: CommonService, private router: Router) {
    effect(() => {
      this.clinicProfile();
      this.drProfile();
    });

    if (this.auth.getRoleName() == 'clinic') {
      this.getClinicProfile();
    } else {
      this.getDoctorProfile();
    }
  }

  getClinicProfile() {
    this.service.get<any>('clinic/get-profile').subscribe((resp) => {
      this.clinicPofile = resp.data;
      this.service._clinicProfile.set(this.clinicPofile);
    })
  };

  getDoctorProfile() {
    this.service.get<any>('doctor/get_profile').subscribe((resp) => {
      this.doctorPofile = resp.data;
      this.service._doctorProfile.set(this.doctorPofile);
    })
  };

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
