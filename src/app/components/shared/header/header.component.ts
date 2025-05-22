import { Component, effect } from '@angular/core';
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
  constructor(public auth: AuthService, private service: CommonService) {
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
      this.clinicPofile = resp.data;
      this.service._clinicProfile.set(this.clinicPofile);
    })
  }
}
