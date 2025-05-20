import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-clinic-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './clinic-profile.component.html',
  styleUrl: './clinic-profile.component.css'
})
export class ClinicProfileComponent {
  clinicProfile = this.service._clinicProfile;
  constructor(private fb: FormBuilder, private service: CommonService) {
    console.log(this.clinicProfile());

  }

}
