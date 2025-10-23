import { Component, effect } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { LoaderService } from '../../../services/loader.service';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.css'
})
export class PatientDetailComponent {
  private destroy$ = new Subject<void>();
  patientId = this.service._patient;
  patientData: any
  constructor(private service: CommonService, public location: Location, private loader: LoaderService, private router: Router, private route: ActivatedRoute, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    effect(() => {
      this.patientId();
    });
    if (!this.patientId()) {
      this.service._patient.set(JSON.parse(sessionStorage.getItem('patient') || ''));
    }
  }

  ngOnInit(): void {
    this.getOrderDetails()
  }

  getOrderDetails() {
    this.loader.show()
    this.service.get(`doctor/patient-records/${this.patientId()}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      this.patientData = res.data[0];
      this.loader.hide()
    }, error => {
      this.loader.hide()
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Scheduled':
        return 'ct_yellow_text';
      case 'Completed':
        return 'ct_green_text';
      case 'Rescheduled':
        return 'ct_orange_text';
      case 'Ongoing':
        return 'ongoing';
      case 'Missed':
        return 'ct_red_text';
      case 'Cancelled':
        return 'ct_red_text';
      default:
        return '';
    }
  }

  openReport(data: any) {
    this.service._report.set(data);
    sessionStorage.setItem('report', JSON.stringify(data));
    this.router.navigate(['reports'], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
