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

  clinicProfile = this.service._clinicProfile;
  drProfile = this.service._doctorProfile;
  soloDrProfile = this.service._soloDoctorProfile;
  constructor(public auth: AuthService, private service: CommonService, private router: Router, public loaderService: LoaderService, private socketService: SocketService
  ) {
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
}
