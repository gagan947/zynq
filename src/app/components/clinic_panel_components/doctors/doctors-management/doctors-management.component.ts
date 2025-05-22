import { Component, ElementRef, ViewChild, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from '../../../../services/common.service';
import { Doctor, DoctorResponse, DoctorTreatment } from '../../../../models/doctors';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Treatment, TreatmentResponse } from '../../../../models/clinic-onboarding';
import { NzSelectModule } from 'ng-zorro-antd/select';
@Component({
  selector: 'app-doctors-management',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule, NzSelectModule],
  templateUrl: './doctors-management.component.html',
  styleUrl: './doctors-management.component.css'
})
export class DoctorsManagementComponent {
  doctorsList: Doctor[] = [];
  orgDoctorsList: Doctor[] = [];
  treatments: Treatment[] = [];
  selectedTreatment: string[] = [];
  Form!: FormGroup
  imagePreview: string = 'assets/img/np_pro.png';
  doctorId: string | undefined;
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButton2') closeButton2!: ElementRef<HTMLButtonElement>;
  constructor(
    private router: Router,
    private service: CommonService,
    private toster: NzMessageService,
    private fb: FormBuilder,
    private route: ActivatedRoute
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
    this.service.get<DoctorResponse>(`clinic/get-all-doctors`).subscribe(res => {
      if (res.success) {
        this.doctorsList = this.orgDoctorsList = res.data;
      } else {
        this.doctorsList = this.orgDoctorsList = [];
      }
    });
  }

  getTreatments() {
    this.service.get<TreatmentResponse>(`clinic/get-treatments`).subscribe((res) => {
      this.treatments = res.data
    });
  }

  openModal(imageUrl: string) {
    if (imageUrl) {
      this.imagePreview = imageUrl
    }
  }

  onSubmit() {
    this.service.post<any, any>('clinic/send-doctor-invitation', { emails: [this.Form.value.email] }).subscribe({
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
    this.service.post<any, any>('clinic/unlink-doctor', { doctor_id: this.doctorId }).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.toster.success(resp.message)
          this.getDoctors();
          this.closeButton2.nativeElement.click();
        } else {
          this.toster.error(resp.message)
        }
      },
      error: (error) => {
        this.toster.error(error);
      }
    })
  }

  search(event: any) {
    const searchValue = event.target.value.trim().toLowerCase();
    if (searchValue) {
      this.doctorsList = this.orgDoctorsList.filter(list =>
        list.name.toLowerCase().includes(searchValue) || list.name.toLowerCase().includes(searchValue)
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
}
