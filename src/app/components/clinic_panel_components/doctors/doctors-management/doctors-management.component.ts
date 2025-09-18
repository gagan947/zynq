import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from '../../../../services/common.service';
import { Doctor, DoctorResponse, DoctorTreatment } from '../../../../models/doctors';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Treatment, TreatmentResponse } from '../../../../models/clinic-onboarding';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { LoaderService } from '../../../../services/loader.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-doctors-management',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule, NzSelectModule],
  templateUrl: './doctors-management.component.html',
  styleUrl: './doctors-management.component.css'
})
export class DoctorsManagementComponent {
  private destroy$ = new Subject<void>();
  doctorsList: Doctor[] = [];
  orgDoctorsList: Doctor[] = [];
  treatments: Treatment[] = [];
  selectedTreatment: string[] = [];
  Form!: FormGroup
  imagePreview: string = 'assets/img/np_pro.jpg';
  doctorId: string | undefined;
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButton2') closeButton2!: ElementRef<HTMLButtonElement>;
  constructor(
    private router: Router,
    private service: CommonService,
    private toster: NzMessageService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private loader: LoaderService
  ) {
    this.Form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.getDoctors();
    this.getTreatments();
  }

  getDoctors() {
    this.loader.show();
    this.service.get<DoctorResponse>(`clinic/get-all-doctors`).pipe(
      takeUntil(this.destroy$)
    ).subscribe(res => {
      if (res.success) {
        this.doctorsList = this.orgDoctorsList = res.data;
        this.loader.hide();
      } else {
        this.doctorsList = this.orgDoctorsList = [];
        this.loader.hide();
      }
    });
  }

  getTreatments() {
    this.service.get<TreatmentResponse>(`clinic/get-treatments`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.treatments = res.data
    });
  }

  openModal(imageUrl: string) {
    if (imageUrl) {
      this.imagePreview = imageUrl
    }
  }

  onSubmit() {
    this.service.post<any, any>('clinic/send-doctor-invitation', { emails: [this.Form.value.email] }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.toster.success(resp.message)
          this.closeButton.nativeElement.click();
        } else {
          this.toster.error(resp.message)
        }
      },
      error: (error) => {
        this.toster.error(error);
      }
    })
  }

  opanUnlinkModal(doctorId: string) {
    this.doctorId = doctorId;
  }

  unlinkDoctor() {
    this.loader.show();
    this.service.post<any, any>('clinic/unlink-doctor', { doctor_id: this.doctorId }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.toster.success(resp.message)
          this.getDoctors();
          this.closeButton2.nativeElement.click();
          this.loader.hide();
        } else {
          this.toster.error(resp.message)
          this.loader.hide();
        }
      },
      error: (error) => {
        this.toster.error(error);
        this.loader.hide();
      }
    })
  }

  search(event: any) {
    const searchValue = event.target.value.trim().toLowerCase();
    if (searchValue) {
      this.doctorsList = this.orgDoctorsList.filter(list =>
        list.name?.toLowerCase().includes(searchValue) || list.email?.toLowerCase().includes(searchValue)
      );
    } else {
      this.doctorsList = [...this.orgDoctorsList];
    }
  }

  specialityName(treatments: DoctorTreatment[]) {
    return treatments.map(item => item.name).join(' | ');
  }

  viewDrdetail(doctor: Doctor) {
    this.service._doctorDetail.set(doctor);
    sessionStorage.setItem('doctorDetail', JSON.stringify(doctor));
    this.router.navigate(['detail'], { relativeTo: this.route });
  }

  filter(event: any) {
    if (event.length === 0) {
      this.doctorsList = [...this.orgDoctorsList];
    } else {
      this.doctorsList = this.orgDoctorsList.filter((list: Doctor) =>
        event.some((treatmentId: string) =>
          list.treatments.some(treatment => treatment.treatment_id === treatmentId)
        )
      );
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  exportTableToCSV() {
    const table = document.getElementById("myTable") as HTMLTableElement;
    if (this.doctorsList.length == 0) {
      this.toster.warning("No data found to export!");
      return;
    }

    let csv: string[] = [];

    for (let i = 0; i < table.rows.length; i++) {
      let row: string[] = [];
      const cols = table.rows[i].cells;

      for (let j = 0; j < cols.length; j++) {
        const headerText = table.rows[0].cells[j].innerText.trim();
        if (headerText === 'Action' || headerText === 'Profile') {
          continue;
        }
        row.push('"' + cols[j].innerText.replace(/"/g, '""') + '"');
      }

      csv.push(row.join(","));
    }
    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    const downloadLink = document.createElement("a");
    downloadLink.download = "Doctors.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
  }
}





