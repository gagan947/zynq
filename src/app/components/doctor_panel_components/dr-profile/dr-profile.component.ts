import { Component } from '@angular/core';
import { ProfileSetupComponent } from '../profile-setup/profile-setup.component';
import { RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { DoctorProfileResponse } from '../../../models/doctorProfile';
import { Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-dr-profile',
  standalone: true,
  imports: [ RouterLink, CommonModule],
  templateUrl: './dr-profile.component.html',
  styleUrl: './dr-profile.component.css'
})
export class DrProfileComponent {
  doctorProfile$!: Observable<DoctorProfileResponse>;

  constructor(private apiService: CommonService ,private loaderService: LoaderService) { }

  ngOnInit() {
    this.loaderService.show();
    this.doctorProfile$ = this.apiService.get<DoctorProfileResponse>('doctor/get_profile').pipe(tap(() => setTimeout(() => this.loaderService.hide(), 100)));
  }
  // loadFormData() {
  //   this.apiService.get<DoctorProfileResponse>('doctor/get_profile').subscribe(res => {
  //     if (res.success == false) {
  //       return;
  //     }
  //     const data = res.data;
  //     this.personalForm.patchValue({
  //       fullName: data.name,
  //       phone: data.phone,
  //       age: data.age,
  //       gender: data.gender,
  //       address: data.address,
  //       biography: data.biography
  //     });
  //     if (data.certifications.length > 0) {
  //       this.certificates = data.certifications.map(cert => ({ type: cert.file_name, file: null, previewUrl: cert.upload_path }));
  //     }
  //     if (data.education.length > 0) {
  //       this.education = data.education.map(edu => ({ institution: edu.institution, degree_name: edu.degree }));
  //     }
  //     if (data.experience.length > 0) {
  //       this.experience = data.experience.map(edu => ({
  //         organisation_name: edu.organization, designation: edu.designation, start_date: edu.start_date ? edu.start_date.split('T')[0] : '',
  //         end_date: edu.end_date ? edu.end_date.split('T')[0] : ''
  //       }));
  //     }
  //     if (data.treatments.length > 0) {
  //       this.selectedTreatments = data.treatments.map(edu => ({ treatment_id: edu.treatment_id, name: edu.name }));
  //     }
  //     if (data.skinTypes.length > 0) {
  //       this.selectedSkinTypes = data.skinTypes.map(edu => ({ skin_type_id: edu.skin_type_id, name: edu.name }));
  //     }
  //     if (data.severityLevels.length > 0) {
  //       this.selectedSecurityLevel = data.severityLevels.map(edu => ({ severity_level_id: edu.severity_level_id, level: edu.level }));
  //     }
  //     this.operationHoursForm.patchValue({
  //       fee_per_session: data.fee_per_session,
  //       session_duration: data.session_duration,
  //     });
  //     this.patchOperationHours(data.availability);
  //     if(data.profile_image != null && data.profile_image != ''){ 
  //       this.imagePreview = data.profile_image;
  //     }
  
  //   });
  // };

}
