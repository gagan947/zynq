import { Component } from '@angular/core';
import { Router,  } from '@angular/router';
import {  effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonService } from '../../../services/common.service';
import { ClinicProfile } from '../../../models/clinic-profile';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  clinicPofile: ClinicProfile | null = null;

  clinicProfile = this.service._clinicProfile;
  constructor( public auth: AuthService, private service: CommonService, private router: Router) {
    effect(() => {
      this.clinicProfile();
    });

    if (this.auth.getRoleName() == 'clinic') {
      this.getClinicProfile();
    } else {

    }
  }

  getClinicProfile() {
    this.service.get<any>('clinic/get-profile').subscribe((resp) => {
      console.log(resp);
      this.clinicPofile = resp.data;
      this.service._clinicProfile.set(this.clinicPofile);
    })
  };

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
