import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SkinType, SkinTypeResponse, Treatment, TreatmentResponse } from '../../../models/clinic-onboarding';
import { LoginUserData } from '../../../models/login';
import { CommonService } from '../../../services/common.service';
import { AuthService } from '../../../services/auth.service';
import { NoWhitespaceDirective, timeRangeValidator } from '../../../validators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-solo-profile-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NzSelectModule, NzUploadModule],
  templateUrl: './solo-profile-setup.component.html',
  styleUrl: './solo-profile-setup.component.css'
})
export class SoloProfileSetupComponent {
  @Input() isEdit: boolean = false;

  besicInfoForm!: FormGroup
  contactForm!: FormGroup
  ExpertiseForm!: FormGroup
  operationHoursForm!: FormGroup;
  treatments: Treatment[] = []
  skinConditions: any[] = []
  surgeries: any[] = []
  devices: any[] = []
  skintypes: SkinType[] = []
  certificaTeypes: any
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  submitted: boolean = false
  currentStep = 0;
  userInfo: LoginUserData;
  LogoImage: File | null = null;
  logoPreview: string | null = null;
  profileImage: File | null = null;
  profilePreview: string | null = null;
  locations: any[] = [];
  selectedLocation: any = null;
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
  certificates: any[] = [{
    type: null,
    file: null
  }];
  certificateURl = environment.certificateUrl;
  maxDate: Date = new Date();
  @ViewChild('drEmail') drEmail!: ElementRef<HTMLButtonElement>
  steps = [
    { id: 'Personal', label: 'Personal Details' },
    { id: 'Contact', label: 'Contact Details' },
    { id: 'Education', label: 'Education & Experience' },
    { id: 'Expertise', label: 'Expertise' },
    { id: 'Operation', label: 'Operation Hours' },
  ];

  constructor(private fb: FormBuilder, private service: CommonService, private toster: NzMessageService, private router: Router, private auth: AuthService) {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  }

  ngOnInit(): void {
    this.inItForm();
    this.initializeOperationHours();
    this.getTreatments();
    this.getSkinTypes();
    this.getSkinConditions();
    this.getSurgeries();
    this.getDevices();
    this.getCertificaTeypes();
    this.getProfile();
  }

  inItForm() {
    this.besicInfoForm = this.fb.group({
      name: ['', [Validators.required, NoWhitespaceDirective.validate]],
      clinic_name: ['', [Validators.required, NoWhitespaceDirective.validate]],
      age: ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$'), this.integerValidator]],
      gender: ['', Validators.required],
      org_number: [''],
      ivo_registration_number: [''],
      hsa_id: [''],
      clinic_description: ['', [Validators.required, NoWhitespaceDirective.validate, Validators.maxLength(500)]],
      language: ['en'],
      logo: [null],
      profile_image: [null],
    });

    this.contactForm = this.fb.group({
      mobile_number: ['', [Validators.required]],
      street_address: ['', [Validators.required, NoWhitespaceDirective.validate]],
      city: ['', [Validators.required, NoWhitespaceDirective.validate]],
      state: ['', [Validators.required, NoWhitespaceDirective.validate]],
      zip_code: ['', [Validators.required, NoWhitespaceDirective.validate]],
      website_url: [''],
      latitude: [''],
      longitude: [''],
    })

    this.operationHoursForm = this.fb.group({
      fee_per_session: ['', [Validators.required, Validators.min(0)]],
      session_duration: this.fb.group({
        hours: ['00', [Validators.required, Validators.min(0), Validators.pattern('^[0-9]+$')]],
        minutes: ['30', [Validators.required, Validators.min(0), Validators.max(59), Validators.pattern('^[0-9]+$')]]
      }),
      operation_hours: this.fb.array([])
    });

    this.ExpertiseForm = this.fb.group({
      treatments: [[], [Validators.required]],
      skin_types: [[], [Validators.required]],
      skin_condition: [[], [Validators.required]],
      surgeries: [[], [Validators.required]],
      devices: [[], [Validators.required]],
    })
  }

  initializeOperationHours(): void {
    this.daysOfWeek.forEach(day => {
      const dayGroup = this.fb.group({
        day_of_week: [day],
        start_time: [''],
        end_time: [''],
        closed: [false]
      }, { validators: [operationHoursValidator, timeRangeValidator()] });

      dayGroup.get('start_time')?.valueChanges.subscribe(() => {
        dayGroup.updateValueAndValidity({ onlySelf: true });
      });

      dayGroup.get('end_time')?.valueChanges.subscribe(() => {
        dayGroup.updateValueAndValidity({ onlySelf: true });
      });

      // Subscribe to 'closed' value changes to trigger validation
      dayGroup.get('closed')?.valueChanges.subscribe(() => {
        dayGroup.updateValueAndValidity();
      });

      this.operationHours.push(dayGroup);
    });
  }

  get session_duration(): FormGroup {
    return this.operationHoursForm.get('session_duration') as FormGroup;
  }

  get operationHours(): FormArray {
    return this.operationHoursForm.get('operation_hours') as FormArray;
  }
  getCertificaTeypes() {
    this.service.get<any>(`doctor/get_doctor_certificates_path`).subscribe((res) => {
      this.certificaTeypes = res.data
    });
  };
  getTreatments() {
    this.service.get<TreatmentResponse>(`clinic/get-treatments`).subscribe((res) => {
      this.treatments = res.data
    });
  }


  getSkinTypes() {
    this.service.get<SkinTypeResponse>(`clinic/get-skin-types`).subscribe((res) => {
      this.skintypes = res.data
    });
  }

  getSkinConditions() {
    this.service.get<any>(`clinic/get-SkinConditions`).subscribe((res) => {
      this.skinConditions = res.data
    });
  }

  getSurgeries() {
    this.service.get<any>(`clinic/get-surgery`).subscribe((res) => {
      this.surgeries = res.data
    });
  }

  getDevices() {
    this.service.get<any>(`clinic/get-devices`).subscribe((res) => {
      this.devices = res.data
    });
  }
  onLogoImage(event: any) {
    const file = event.target.files[0];
    this.LogoImage = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  removeImage() {
    this.LogoImage = null;
    this.logoPreview = null;
  }

  onProfileImageChange(event: any) {
    const file = event.target.files[0];
    this.profileImage = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.profilePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  removeProfileImage() {
    this.profileImage = null;
    this.profileImage = null;
  }

  onSubmitBasicInfo() {
    if (this.besicInfoForm.invalid) {
      this.besicInfoForm.markAllAsTouched();
      return;
    }

    let formData = new FormData();
    formData.append('name', this.besicInfoForm.get('name')?.value);
    formData.append('age', this.besicInfoForm.get('age')?.value);
    formData.append('gender', this.besicInfoForm.get('gender')?.value);
    formData.append('clinic_name', this.besicInfoForm.get('clinic_name')?.value || '');
    formData.append('clinic_description', this.besicInfoForm.get('clinic_description')?.value || '');
    formData.append('language', 'en');
    formData.append('ivo_registration_number', this.besicInfoForm.get('ivo_registration_number')?.value || '');
    formData.append('hsa_id', this.besicInfoForm.get('hsa_id')?.value || '');
    if (this.LogoImage) {
      formData.append('logo', this.LogoImage!)
    }
    if (this.profileImage) {
      formData.append('profile', this.profileImage!)
    }
    this.service.post<any, any>('solo_doctor/add_personal_info', formData).subscribe({
      next: (res) => {
        if (res.success) {
          if (this.isEdit) {
            this.toster.success('Profile updated successfully');
          } else {
            this.currentStep++;
          }
        } else {
          this.toster.error(res.message);
        }
      },
      error: (err) => {
        this.toster.error(err);
      }
    });
  }

  submitContactForm() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    let formData = {}

    if (this.contactForm.value.latitude && this.contactForm.value.longitude) {
      formData = {
        ...this.contactForm.value,
        address: this.selectedLocation
      }
    } else {
      this.toster.error('Map location is not valid please enter valid location')
      return
    }

    this.service.post<any, any>('solo_doctor/addContactInformation', formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.currentStep++;
        } else {
          this.toster.error(res.message);
        }
      },
      error: (err) => {
        this.toster.error(err);
      }
    });
  }

  onSubmitProfessional() {
    const isValidEdu = this.education.every(c =>
      c.institution?.trim() &&
      c.degree_name?.trim() &&
      c.start_year &&
      c.end_year &&
      c.end_year > c.start_year
    );

    if (!isValidEdu) {
      this.toster.warning('Please enter valid education details. End date must be after start date.');
      return;
    }
    const isValidExp = this.experience.every(c => c.organisation_name?.trim() && c.start_date && c.end_date && c.designation?.trim() && c.end_date > c.start_date);
    if (!isValidExp) {
      this.toster.warning('Please enter valid experience details. End date must be after start date.');
      return;
    }
    const formData = new FormData();
    const education = this.education.map(edu => ({
      institute: edu.institution?.trim(),
      degree: edu.degree_name?.trim(),
      start_year: edu.start_year,
      end_year: edu.end_year
    }));
    const experience = this.experience.map(exp => ({
      organization: exp.organisation_name?.trim(),
      start_date: exp.start_date,
      end_date: exp.end_date,
      designation: exp.designation?.trim()
    }))
    formData.append('education', JSON.stringify(education));
    formData.append('experience', JSON.stringify(experience));
    this.certificaTeypes.forEach((cert: any) => {
      if (cert.file) {
        formData.append(cert.file_name, cert.file, cert.file.name);
      }
    })

    this.service.post<any, any>('solo_doctor/add_education_experience', formData).subscribe({
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

    if (this.ExpertiseForm.invalid) {
      this.ExpertiseForm.markAllAsTouched();
      return
    }
    let formData = {
      treatment_ids: this.ExpertiseForm.value.treatments.join(','),
      skin_type_ids: this.ExpertiseForm.value.skin_types.join(','),
      skin_condition_ids: this.ExpertiseForm.value.skin_condition.join(','),
      surgery_ids: this.ExpertiseForm.value.surgeries.join(','),
      aesthetic_devices_ids: this.ExpertiseForm.value.devices.join(','),
    }
    this.service.post<any, any>('solo_doctor/add_expertise', formData).subscribe({
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
        session_duration: this.operationHoursForm.value.session_duration.hours + ':' + this.operationHoursForm.value.session_duration.minutes,
        availability: (payload)
      };

      this.service.post<any, any>('solo_doctor/addConsultationFeeAndAvailability', formData).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            let data = this.auth.getUserInfo()
            data.on_boarding_status = 5
            localStorage.setItem('userInfo', JSON.stringify(data));
            this.router.navigate(['/solo-doctor'])
          }
        },
        error: (error) => {
          console.log(error);
        }
      });
    } else {
      this.operationHoursForm.markAllAsTouched();
      this.operationHours.controls.forEach((group: AbstractControl) => {
        group.markAllAsTouched();
        group.updateValueAndValidity();
      });
    }
  }

  integerValidator(control: AbstractControl) {
    const value = control.value;
    return Number.isInteger(Number(value)) ? null : { notInteger: true };
  }

  searchLocation(event: any) {
    this.service.get<any>(`clinic/search-location?input=${event.target.value.trim()}`).subscribe((res) => {
      this.locations = res.data
    })
  }

  selectLocation(location: any) {
    this.service.get<any>(`clinic/get-lat-long?address=${location}`).subscribe((res) => {
      this.contactForm.patchValue({ latitude: res.data.lat, longitude: res.data.lng });
      this.selectedLocation = location;
      this.locations = [];
    })

  }

  addCertificate() {
    this.certificates.push({ type: '', file: null });
  };

  removeCertificate(index: number, id: any) {
    console.log(index, id);

    this.certificaTeypes[index].upload_path = null;
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

  addExperience() {
    this.experience.push({
      organisation_name: '',
      start_date: null,
      designation: '',
      end_date: null
    });
  };

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.certificaTeypes[index].file = file;
      this.certificaTeypes[index].previewUrl = null;
    }
  };

  removePreview(index: number, id: any) {
    this.certificaTeypes[index].upload_path = null;
    if (id) {
      this.deleteCertificate(id)
    }
  }


  addEducation() {
    this.education.push({ institution: null, degree_name: null, start_year: null, end_year: null });
  }

  deleteCertificate(id: any) {
    this.service.delete<any>(`doctor/delete_certification/${id}`).subscribe((res) => {
      if (res.success == true) {
      }
    });
  }

  getProfile() {
    this.service.get<any>('solo_doctor/get_profile').subscribe({
      next: (res) => {
        if (res.success) {
          const data = res.data;
          if (!this.isEdit) {
            this.currentStep = data.on_boarding_status
          }
          this.profilePreview = data.profile_image
          this.logoPreview = data.clinic.clinic_logo
          this.besicInfoForm.patchValue({
            name: data.name,
            age: data.age,
            gender: data.gender,
            clinic_name: data.clinic.clinic_name,
            clinic_description: data.clinic.clinic_description,
            ivo_registration_number: data.clinic.ivo_registration_number,
            hsa_id: data.clinic.hsa_id
          })

          this.contactForm.patchValue({
            mobile_number: data.clinic.mobile_number,
            city: data.clinic.location.city,
            state: data.clinic.location.state,
            street_address: data.clinic.location.street_address,
            zip_code: data.clinic.location.zip_code,
            latitude: data.clinic.location.latitude,
            longitude: data.clinic.location.longitude,
            website_url: data.clinic.website_url
          })

          this.selectedLocation = data.clinic.address

          if (data.education.length > 0) {
            this.education = data.education.map((edu: { institution: any; degree: any; start_year: any; end_year: any; }) => ({ institution: edu.institution, degree_name: edu.degree, start_year: edu.start_year, end_year: edu.end_year }));
          }
          if (data.experience.length > 0) {
            this.experience = data.experience.map((edu: { organization: any; designation: any; start_date: string; end_date: string; }) => ({
              organisation_name: edu.organization, designation: edu.designation, start_date: edu.start_date ? edu.start_date.split('T')[0] : '',
              end_date: edu.end_date ? edu.end_date.split('T')[0] : ''
            }));
          }
        } else {
          this.toster.error(res.message);
        }
      },
      error: (err) => {
        this.toster.error(err);
      }
    });
  }

  previousStep() {
    this.currentStep--
  }

  nextStep() {
    this.currentStep++
  }
}


function operationHoursValidator(group: AbstractControl): ValidationErrors | null {
  const closed = group.get('closed')?.value;
  const startTime = group.get('start_time')?.value;
  const endTime = group.get('end_time')?.value;

  if (!closed) {
    const errors: any = {};
    if (!startTime) {
      errors.start_time = 'Start time is required.';
    }
    if (!endTime) {
      errors.end_time = 'End time is required.';
    }
    return Object.keys(errors).length ? errors : null;
  }
  return null;
}