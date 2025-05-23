import { Component, effect } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { CommonModule } from '@angular/common';
import { DoctorExperience, DoctorTreatment } from '../../../../models/doctors';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [CommonModule, NzRateModule, FormsModule],
  templateUrl: './doctor-detail.component.html',
  styleUrl: './doctor-detail.component.css'
})
export class DoctorDetailComponent {
  doctorDetail = this.service._doctorDetail;
  imagePreview: string = 'assets/img/doctor.png';
  constructor(private service: CommonService, public location: Location) {
    effect(() => {
      this.doctorDetail();
    });

    if (!this.doctorDetail()) {
      this.service._doctorDetail.set(JSON.parse(sessionStorage.getItem('doctorDetail') || ''));
    }
  }

  getCount(start_date: string, end_date: string) {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    let diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    diffTime = diffTime / (1000 * 60 * 60 * 24);
    const diffMonths = Math.floor(diffTime / 30);
    const diffYears = Math.floor(diffTime / 365);
    return { diffDays, diffMonths, diffYears };
  }

  specialityName(treatments: DoctorTreatment[]) {
    return treatments.map(item => item.name).join(' | ');
  }

  getTotalExperience(experience: DoctorExperience[]) {
    let totalExperience = 0;
    experience.forEach((item: DoctorExperience) => {
      totalExperience += this.getCount(item.start_date, item.end_date).diffYears;
    });
    return totalExperience;
  }

  openModal(imageUrl: string | undefined) {
    if (imageUrl) {
      this.imagePreview = imageUrl
    }
  }
}
