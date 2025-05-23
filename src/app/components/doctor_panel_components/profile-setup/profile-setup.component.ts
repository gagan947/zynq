import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonService } from '../../../services/common.service';
import { DoctorProfileResponse } from '../../../models/doctorProfile';
import { SecurityLevel, SecurityLevelResponse, SkinType, SkinTypeResponse, Treatment, TreatmentResponse } from '../../../models/clinic-onboarding';
import { NoWhitespaceDirective, timeRangeValidator } from '../../../validators';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { getISOWeek } from 'date-fns';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd/i18n';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../../services/auth.service';
function operationHoursValidator(group: AbstractControl): ValidationErrors | null {
  const closed = group.get('closed')?.value;
  const startTime = group.get('start_time')?.value;
  const endTime = group.get('end_time')?.value;

  if (!closed) {
    const errors: any = {};
    if (!startTime) {
      errors.start_time = 'Start time is required when clinic is open.';
    }
    if (!endTime) {
      errors.end_time = 'End time is required when clinic is open.';
    }
    return Object.keys(errors).length ? errors : null;
  }
  return null;
}

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [NzSelectModule, CommonModule, FormsModule, ReactiveFormsModule, NzDatePickerModule, NzButtonModule, NzDatePickerModule],
  templateUrl: './profile-setup.component.html',
  styleUrl: './profile-setup.component.css'
})
export class ProfileSetupComponent {

  personalForm!: FormGroup;
  operationHoursForm!: FormGroup;
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  imagePreview: string | null = null;
  profileImage: any;
  certificates: any[] = [{
    type: null,
    file: null
  }];
  treatments: Treatment[] = [];
  education: any[] = [{
    institution: null,
    degree_name: null,
    start_year: null,
    end_year: null
  }];
  experience: any[] = [{
    organisation_name: null,
    start_date: null,
    end_date: null,
    designation: null
  }];
  certificaTeypes: any;
  selectedTreatments: Treatment[] = [];
  filteredTreatments: Treatment[] = [];

  skintypes: SkinType[] = []
  selectedSkinTypes: SkinType[] = []
  securityLevel: SecurityLevel[] = []
  selectedSecurityLevel: SecurityLevel[] = [];
  date = null;
  constructor(private fb: FormBuilder, private http: HttpClient, private apiService: CommonService, private router: Router, private i18n: NzI18nService, private toster: NzMessageService, private auth: AuthService) {

  }


  ngOnInit(): void {

    this.personalForm = this.fb.group({
      fullName: ['', [Validators.required, NoWhitespaceDirective.validate]],
      phone: ['', [Validators.required, Validators.min(1)]],
      age: ['', [Validators.required, Validators.min(1)]],
      gender: ['', Validators.required],
      address: ['', [Validators.required, NoWhitespaceDirective.validate]],
      biography: ['']
    });
    this.operationHoursForm = this.fb.group({
      fee_per_session: ['', [Validators.required, NoWhitespaceDirective.validate]],
      session_duration: ['', Validators.required],
      operation_hours: this.fb.array([])
    });

    this.initializeOperationHours();

    this.loadFormData();
    this.getCertificaTeypes();
    this.getTreatments();
    this.getSecurityLevel();
    this.getSkinTypes();
  }

  loadFormData() {
    this.apiService.get<DoctorProfileResponse>('doctor/get_profile').subscribe(res => {
      if (res.success == false) {
        return;
      }
      const data = res.data;
      this.personalForm.patchValue({
        fullName: data.name,
        phone: data.phone,
        age: data.age,
        gender: data.gender,
        address: data.address,
        biography: data.biography
      });
      if (data.certifications.length > 0) {
        this.certificates = data.certifications.map(cert => ({ type: cert.file_name, file: null, previewUrl: cert.upload_path, id: cert.doctor_certification_id }));
      }
      if (data.education.length > 0) {
        this.education = data.education.map(edu => ({ institution: edu.institution, degree_name: edu.degree, start_year: edu.start_year, end_year: edu.end_year }));
      }
      if (data.experience.length > 0) {
        this.experience = data.experience.map(edu => ({
          organisation_name: edu.organization, designation: edu.designation, start_date: edu.start_date ? edu.start_date.split('T')[0] : '',
          end_date: edu.end_date ? edu.end_date.split('T')[0] : ''
        }));
      }
      if (data.treatments.length > 0) {
        this.selectedTreatments = data.treatments.map(edu => ({ treatment_id: edu.treatment_id, name: edu.name }));
      }
      if (data.skinTypes.length > 0) {
        this.selectedSkinTypes = data.skinTypes.map(edu => ({ skin_type_id: edu.skin_type_id, name: edu.name }));
      }
      if (data.severityLevels.length > 0) {
        this.selectedSecurityLevel = data.severityLevels.map(edu => ({ severity_level_id: edu.severity_level_id, level: edu.level }));
      }
      if (data.profile_image != null && data.profile_image != '') {
        this.imagePreview = data.profile_image;
      }

      this.currentStep = data.on_boarding_status;


    });
  };


  currentStep = 0;

  steps = [
    { id: 'Personal', label: 'Personal Details' },
    { id: 'Education', label: 'Education & Experience' },
    { id: 'Expertise', label: 'Expertise' },
    { id: 'Fee', label: 'Fee & Availability' }
  ];

  get progress(): string {
    return ((this.currentStep + 1) / this.steps.length) * 100 + '%';
  };

  isChecked(item: any): boolean {
    const isSelected = this.selectedSkinTypes.some(
      (selected: any) => selected.skin_type_id === item.skin_type_id
    );
    return isSelected;
  }
  isCheckedLevels(item: SecurityLevel): boolean {
    const isSelected = this.selectedSecurityLevel.some(
      (selected) => selected.severity_level_id === item.severity_level_id
    );

    return isSelected;
  }

  nextStep() {

    if (this.currentStep == 0 && this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return
    }
    if (this.currentStep == 0 && this.personalForm.valid) {
      this.onSubmitPersonal();
    };
    if (this.currentStep == 1) {
      const previewFiles = this.certificates.filter(c => c.previewUrl);
      if (previewFiles.length == 0) {
        const isValidCer = this.certificates.every(c => c.type && c.file);
        if (!isValidCer) {
          this.toster.warning('Please select both certificate type and upload a file for all entries.');
          return;
        }

      } else {


      }

      const isValidEdu = this.education.every(c =>
        c.institution &&
        c.degree_name &&
        c.start_year &&
        c.end_year &&
        c.end_year > c.start_year // "2025-06" > "2025-05" works with string comparison
      );

      if (!isValidEdu) {
        this.toster.warning('Please enter valid education details. End date must be after start date.');
        return;
      }
      const isValidExp = this.experience.every(c => c.organisation_name && c.start_date && c.end_date && c.designation);
      if (!isValidExp) {
        alert('Please enter all experience details for all entries.');
        return;
      }
      this.onSubmitProfessional()
    };
    if (this.currentStep == 2) {
      this.onExpertiseSubmit();
    };
    if (this.currentStep == 3) {
      this.onTimeSubmit();
    };
  };

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  onSubmitPersonal() {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    };
    const formData = new FormData();
    formData.append('name', this.personalForm.value.fullName);
    formData.append('phone', this.personalForm.value.phone);
    formData.append('age', this.personalForm.value.age.toString());
    formData.append('gender', this.personalForm.value.gender);
    formData.append('address', this.personalForm.value.address);
    formData.append('biography', this.personalForm.value.biography);

    if (this.profileImage) {
      formData.append('file', this.profileImage, this.profileImage.name);
    }
    this.apiService.post<any, any>('doctor/add_personal_info', formData).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          this.currentStep++;
        }
      },
      error: (error) => {
        console.log(error);
      }
    });

  };
  onSubmitProfessional() {

    const formData = new FormData();
    const education = this.education.map(edu => ({
      institute: edu.institution,
      degree: edu.degree_name,
      start_year: edu.start_year,
      end_year: edu.end_year
    }));
    const experience = this.experience.map(exp => ({
      organization: exp.organisation_name,
      start_date: exp.start_date,
      end_date: exp.end_date,
      designation: exp.designation
    }))
    formData.append('education', JSON.stringify(education));
    formData.append('experience', JSON.stringify(experience));
    this.certificates.forEach(cert => {
      if (cert.file) {
        formData.append(cert.type, cert.file, cert.file.name);
      }
    })

    this.apiService.post<any, any>('doctor/add_education_experience', formData).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          this.currentStep++;
        }
      },
      error: (error) => {
        console.log(error);
      }
    });

  };
  onExpertiseSubmit() {
    const formData = {
      treatment_ids: this.selectedTreatments.map(treatment => treatment.treatment_id).toString(),
      skin_type_ids: this.selectedSkinTypes.map(skinType => skinType.skin_type_id).toString(),
      severity_levels_ids: this.selectedSecurityLevel.map(securityLevel => securityLevel.severity_level_id).toString()
    };

    this.apiService.post<any, any>('doctor/add_expertise', formData).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          this.currentStep++;
        }
      },
      error: (error) => {
        console.log(error);
      }
    });

  };

  onTimeSubmit() {
    if (this.operationHoursForm.valid) {
      const formValue = this.operationHoursForm.value;
      var payload = formValue.operation_hours
        .filter((entry: any) => entry.closed || (entry.start_time && entry.end_time))
        .map((entry: any) => ({
          day_of_week: entry.day_of_week,
          start_time: entry.closed ? '' : entry.start_time,
          end_time: entry.closed ? '' : entry.end_time,
          closed: entry.closed ? 1 : 0
        }));
      const formData = {
        fee_per_session: this.operationHoursForm.value.fee_per_session,
        currency: 'INR',
        session_duration: this.operationHoursForm.value.session_duration,
        availability: (payload)
      };

      this.apiService.post<any, any>('doctor/add_fee_availability', formData).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            let data = this.auth.getUserInfo()
            data.on_boarding_status = 4
            localStorage.setItem('userInfo', JSON.stringify(data));
            this.router.navigateByUrl('/doctor');
            // this.currentStep++;
          }
        },
        error: (error) => {
          console.log(error);
        }
      });
      // Submit to your API here
    } else {
      // Trigger validation messages for fee and duration
      this.operationHoursForm.markAllAsTouched();

      // Manually trigger validation messages for each operation hours group
      this.operationHours.controls.forEach((group: AbstractControl) => {
        group.markAllAsTouched();  // Important: mark nested controls as touched
        group.updateValueAndValidity(); // Important: to re-evaluate custom validators
      });
    }
  }



  onProfileImage(event: any) {
    const file = event.target.files[0];
    this.profileImage = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  removePreview(index: number, id: any) {
    this.certificates[index].previewUrl = null;
    if (id) {
      this.deleteCertificate(id)
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.profileImage = null;
  };



  createCertificateGroup(): FormGroup {
    return this.fb.group({
      type: [null, Validators.required],
      file: [null, Validators.required],
    });
  }

  addCertificate() {
    this.certificates.push({ type: '', file: null });
  }

  removeCertificate(index: number, id: any) {

    this.certificates.splice(index, 1);
    if (id) {
      this.deleteCertificate(id)
    }
  }
  removeEducation(index: number) {
    this.education.splice(index, 1);
  }
  removeExperience(index: number) {
    this.experience.splice(index, 1);
  }
  get operationHours(): FormArray {
    return this.operationHoursForm.get('operation_hours') as FormArray;
  }

  initializeOperationHours(): void {
    this.daysOfWeek.forEach(day => {
      const dayGroup = this.fb.group({
        day_of_week: [day],
        start_time: [''],
        end_time: [''],
        closed: [false]
      }, { validators: operationHoursValidator });

      // Subscribe to 'closed' value changes to trigger validation
      dayGroup.get('closed')?.valueChanges.subscribe(() => {
        dayGroup.updateValueAndValidity();
      });

      this.operationHours.push(dayGroup);
    });
  }
  getCertificaTeypes() {
    this.apiService.get<any>(`clinic/get-certificate-type`).subscribe((res) => {
      this.certificaTeypes = res.data
    });
  };

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.certificates[index].file = file;
      this.certificates[index].previewUrl = null;
    }
  };

  addEducation() {
    this.education.push({ institution: null, degree_name: null, start_year: null, end_year: null });
  }
  addExperience() {
    this.experience.push({
      organisation_name: '',
      start_date: null,
      designation: '',
      end_date: null
    });
  };

  getTreatments() {
    this.apiService.get<TreatmentResponse>(`clinic/get-treatments`).subscribe((res) => {
      this.treatments = res.data
    });
  }

  addTreatment(treatment: Treatment) {
    if (!this.selectedTreatments.some((item: any) => item.treatment_id === treatment.treatment_id)) {
      this.selectedTreatments.push(treatment);
    }
  }
  removeTreatment(index: number) {
    this.selectedTreatments.splice(index, 1);
  }

  searchTratment(event: any) {
    this.filteredTreatments = this.treatments.filter((item) => item.name.toLowerCase().includes(event.target.value.toLowerCase()));
    if (this.filteredTreatments.length === 0 || event.target.value === '') {
      this.filteredTreatments = [];
    }
  };

  getSkinTypes() {
    this.apiService.get<SkinTypeResponse>(`clinic/get-skin-types`).subscribe((res) => {
      this.skintypes = res.data
    });
  }

  addSkinTypes(item: any) {
    const index = this.selectedSkinTypes.findIndex(s => s.skin_type_id === item.skin_type_id);
    if (index > -1) {
      // Remove if already selected
      this.selectedSkinTypes.splice(index, 1);
    } else {
      // Add if not selected
      this.selectedSkinTypes.push({ skin_type_id: item.skin_type_id, name: item.name });
    }
  }
  getSecurityLevel() {
    this.apiService.get<SecurityLevelResponse>(`clinic/get-severity-levels`).subscribe((res) => {
      this.securityLevel = res.data
    });
  }

  addSecurityLevel(securityLavel: SecurityLevel) {
    const index = this.selectedSecurityLevel.findIndex((item) => item.severity_level_id === securityLavel.severity_level_id);
    if (index === -1) {
      this.selectedSecurityLevel.push(securityLavel);
    } else {
      this.selectedSecurityLevel.splice(index, 1);
    }
  };


  trackById(index: number, item: SecurityLevel) {
    return item.severity_level_id;
  }


  deleteCertificate(id: any) {
    this.apiService.delete<any>(`doctor/delete_certification/${id}`).subscribe((res) => {
      console.log(res);
    });
  };

  onChangeYear(event: any) {
    // this.year = event.year;
  }

}
