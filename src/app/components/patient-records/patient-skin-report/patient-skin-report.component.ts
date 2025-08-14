import { Component, effect } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-patient-skin-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-skin-report.component.html',
  styleUrl: './patient-skin-report.component.css'
})
export class PatientSkinReportComponent {
  patientReport = this.service._report;
  patientData: any
  constructor(private service: CommonService, public location: Location) {
    effect(() => {
      this.patientReport();
    });
    if (!this.patientReport()) {
      this.service._report.set(JSON.parse(sessionStorage.getItem('report') || ''));
    }
  }
}
