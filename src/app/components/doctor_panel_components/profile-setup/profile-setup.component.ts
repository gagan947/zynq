import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonService } from '../../../services/common.service';
import { DoctorProfileResponse } from '../../../models/doctorProfile';
import { SecurityLevel, SecurityLevelResponse, SkinType, SkinTypeResponse, Treatment, TreatmentResponse } from '../../../models/treatments';

import { AbstractControl, ValidationErrors } from '@angular/forms';

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
  imports: [RouterLink, NzSelectModule, CommonModule, FormsModule, ReactiveFormsModule],
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
    degree_name: null
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

  constructor(private fb: FormBuilder, private http: HttpClient, private apiService: CommonService) { }


  ngOnInit(): void {
    this.personalForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      age: ['', [Validators.required, Validators.min(1)]],
      gender: ['', Validators.required],
      address: ['', Validators.required],
      biography: ['']
    });
    this.operationHoursForm = this.fb.group({
      fee_per_session: ['', Validators.required],
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
        this.certificates = data.certifications.map(cert => ({ type: cert.file_name, file: null, previewUrl: cert.upload_path }));
      }
      if (data.education.length > 0) {
        this.education = data.education.map(edu => ({ institution: edu.institute, degree_name: edu.degree }));
      }
      if (data.experience.length > 0) {
        this.experience = data.experience.map(edu => ({ organisation_name: edu.organization, designation: edu.designation, start_date: edu.start_date, end_date: edu.end_date }));
      }


      this.currentStep = data.on_boarding_status

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
  }

  nextStep() {
    console.log(this.personalForm);
    if (this.currentStep == 0 && this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return
    }
    if (this.currentStep == 0 && this.personalForm.valid) {
      this.onSubmitPersonal();
    };
    if (this.currentStep == 1) {
      const previewFiles = this.certificates.filter(c => c.previewUrl);
      console.log(previewFiles);
      if (previewFiles.length == 0) {
        const isValidCer = this.certificates.every(c => c.type && c.file);
        if (!isValidCer) {
          alert('Please select both certificate type and upload a file for all entries.');
          return;
        }

      } else {
        this.certificates = this.certificates.filter(c => !c.file);

      }

      const isValidEdu = this.education.every(c => c.institution && c.degree_name);
      if (!isValidEdu) {
        alert('Please enter both institution and degree name for all entries.');
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
      // this.onSubmitFee();
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
      degree: edu.degree_name
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
    console.log(this.selectedTreatments);
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

  onTimeSubmit(){
    if (this.operationHoursForm.valid) {
      const formValue = this.operationHoursForm.value;
      const payload = formValue.operation_hours
        .filter((entry: any) => entry.closed || (entry.start_time && entry.end_time))
        .map((entry: any) => ({
          day_of_week: entry.day_of_week,
          start_time: entry.closed ? null : entry.start_time,
          end_time: entry.closed ? null : entry.end_time,
          closed: entry.closed ? 1 : 0
        }));

      console.log('Payload:', payload);
      // Proceed with API submission using the payload
    } else {
      console.log('Form is invalid');
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

  removePreview(index: number) {
    this.certificates[index].previewUrl = null;
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

  removeCertificate(index: number) {
    this.certificates.splice(index, 1);
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
    }
  };

  addEducation() {
    this.education.push({ institution: null, degree_name: null });
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
    console.log(this.filteredTreatments);
    if (this.filteredTreatments.length === 0 || event.target.value === '') {
      this.filteredTreatments = [];
    }
  };

  getSkinTypes() {
    this.apiService.get<SkinTypeResponse>(`clinic/get-skin-types`).subscribe((res) => {
      this.skintypes = res.data
    });
  }

  addSkinTypes(skinType: SkinType) {
    if (!this.selectedSkinTypes.some((item) => item.skin_type_id === skinType.skin_type_id)) {
      this.selectedSkinTypes.push(skinType);
    } else {
      this.selectedSkinTypes = this.selectedSkinTypes.filter((item) => item.skin_type_id !== skinType.skin_type_id);
    }
  }
  getSecurityLevel() {
    this.apiService.get<SecurityLevelResponse>(`clinic/get-severity-levels`).subscribe((res) => {
      this.securityLevel = res.data
    });
  }

  addSecurityLevel(securityLavel: SecurityLevel) {
    if (!this.selectedSecurityLevel.some((item) => item.severity_level_id === securityLavel.severity_level_id)) {
      this.selectedSecurityLevel.push(securityLavel);
    } else {
      this.selectedSecurityLevel = this.selectedSecurityLevel.filter((item) => item.severity_level_id !== securityLavel.severity_level_id);
    }
  }





}
