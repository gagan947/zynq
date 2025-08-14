import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { LoaderService } from '../../services/loader.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-records',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-records.component.html',
  styleUrl: './patient-records.component.css'
})
export class PatientRecordsComponent {
  private destroy$ = new Subject<void>();
  patientList: any[] = [];
  patientId: number | null = null
  orgPatientList: any[] = [];
  imagePreview: string = 'assets/img/np_pro.png';
  searchTerm: string = '';
  constructor(private service: CommonService, private router: Router, private route: ActivatedRoute, private loader: LoaderService) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.loader.show()
    this.service.get('doctor/patient-records').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.patientList = this.orgPatientList = res.data;
      this.loader.hide()
    });
  }

  viewPatient(item: any) {
    this.service._patient.set(item.user_id);
    sessionStorage.setItem('patient', JSON.stringify(item.user_id));
    this.router.navigate(['detail'], { relativeTo: this.route });
  }
  openModal(imageUrl: string | undefined) {
    if (imageUrl) {
      this.imagePreview = imageUrl
    }
  }

  searchFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.applyFilters();
  }

  applyFilters() {
    this.patientList = this.orgPatientList.filter((item) => {
      const matchSearch =
        !this.searchTerm ||
        item.name?.toLowerCase().includes(this.searchTerm)
      return matchSearch
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
