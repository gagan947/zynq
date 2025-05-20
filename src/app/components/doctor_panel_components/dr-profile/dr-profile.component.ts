import { Component } from '@angular/core';
import { ProfileSetupComponent } from '../profile-setup/profile-setup.component';

@Component({
  selector: 'app-dr-profile',
  standalone: true,
  imports: [ProfileSetupComponent],
  templateUrl: './dr-profile.component.html',
  styleUrl: './dr-profile.component.css'
})
export class DrProfileComponent {

}
