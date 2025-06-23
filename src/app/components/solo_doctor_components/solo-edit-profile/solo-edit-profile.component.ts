import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { SoloProfileSetupComponent } from "../solo-profile-setup/solo-profile-setup.component";

@Component({
  selector: 'app-solo-edit-profile',
  standalone: true,
  imports: [SoloProfileSetupComponent],
  templateUrl: './solo-edit-profile.component.html',
  styleUrl: './solo-edit-profile.component.css'
})
export class SoloEditProfileComponent {
  constructor(public location: Location) { }
}
