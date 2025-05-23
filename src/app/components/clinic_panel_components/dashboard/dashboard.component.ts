import { Component, effect } from '@angular/core';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  clinicProfile = this.service._clinicProfile;
  constructor(private service: CommonService) {
    effect(() => {
      this.clinicProfile();
    });
  }
}
