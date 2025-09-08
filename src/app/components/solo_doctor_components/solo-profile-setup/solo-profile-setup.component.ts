import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, viewChild, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SkinType, SkinTypeResponse, Treatment, TreatmentResponse } from '../../../models/clinic-onboarding';
import { LoginUserData } from '../../../models/login';
import { CommonService } from '../../../services/common.service';
import { AuthService } from '../../../services/auth.service';
import { NoWhitespaceDirective } from '../../../validators';
import { environment } from '../../../../environments/environment';
import { CountryISO, NgxIntlTelInputModule, SearchCountryField } from 'ngx-intl-tel-input';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-solo-profile-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NzSelectModule, NzUploadModule, NgxIntlTelInputModule],
  templateUrl: './solo-profile-setup.component.html',
  styleUrl: './solo-profile-setup.component.css'
})
export class SoloProfileSetupComponent {
  private destroy$ = new Subject<void>();

  @Input() isEdit: boolean = false;
  treatmentForm!: FormGroup
  besicInfoForm!: FormGroup
  contactForm!: FormGroup
  ExpertiseForm!: FormGroup
  availabilityForm!: FormGroup;
  treatments: Treatment[] = []
  skinConditions: any[] = []
  surgeries: any[] = []
  devices: any[] = []
  skintypes: SkinType[] = []
  certificaTeypes: any
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  sessionDuration: string[] = ['15 Mins', '30 Mins', '45 Mins', '60 Mins', '75 Mins', '90 Mins', '105 Mins', '120 Mins']
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
  productImages: File[] = [];
  previewProductImages: any[] = [];
  loading: boolean = false
  soloDrData: any;
  SearchCountryField = SearchCountryField
  CountryISO = CountryISO;
  selectedCountry = CountryISO.Sweden
  preferredCountries: CountryISO[] = [CountryISO.Sweden]
  constructor(private fb: FormBuilder, private service: CommonService, private toster: NzMessageService, private router: Router, private auth: AuthService) {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  }

  ngOnInit(): void {
    this.inItForm();
    this.getTreatments();
    this.getSkinTypes();
    this.getSkinConditions();
    this.getSurgeries();
    this.getDevices();
    this.getCertificaTeypes();
    this.getProfile(1);
    this.days.controls.forEach((day, i) => {
      day.get('active')?.valueChanges.subscribe(() => {
        this.applyConditionalValidators();
      });
    });
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
      website_url: [null],
      latitude: [''],
      longitude: [''],
    })

    this.ExpertiseForm = this.fb.group({
      treatments: this.fb.array([]),
      skin_types: [[], [Validators.required]],
      skin_condition: [[], [Validators.required]],
      surgeries: [[], [Validators.required]],
      devices: [[], [Validators.required]],
    })

    this.availabilityForm = this.fb.group({
      sameForAllDays: [true],
      fee_per_session: ['', [Validators.required, Validators.min(0)]],
      days: this.fb.array(this.daysOfWeek.map(() => this.createDay()))
    });
  }

  inItTreatMentForm() {
    this.treatments.forEach(() => {
      this.treatmentArray.push(this.fb.group({
        selected: [false],
        price: [''],
        session_duration: [''],
        note: ['']
      }));
    });
  }

  get treatmentArray() {
    return this.ExpertiseForm.get('treatments') as FormArray;
  }

  createDay(): FormGroup {
    return this.fb.group({
      active: [false],
      sessions: this.fb.array([this.createSession()])
    });
  }

  createSession(): FormGroup {
    return this.fb.group({
      start_time: [''],
      end_time: [''],
      sessionDuration: [''],
    });
  }

  get days(): FormArray {
    return this.availabilityForm.get('days') as FormArray;
  }

  getSessions(dayIndex: number): FormArray {
    return this.days.at(dayIndex).get('sessions') as FormArray;
  }

  addSession(dayIndex: number): void {
    this.getSessions(dayIndex).push(this.createSession());
  }

  removeSession(dayIndex: number, sessionIndex: number): void {
    this.getSessions(dayIndex).removeAt(sessionIndex);
  }

  applySameSessionsToAll(): void {
    const referenceDay = this.days.at(0);
    const referenceSessions = referenceDay.get('sessions') as FormArray;
    const sessionData = referenceSessions.value;

    for (let i = 0; i < 7; i++) {
      const day = this.days.at(i);
      day.get('active')?.setValue(true);
      const sessionsArray = day.get('sessions') as FormArray;

      while (sessionsArray.length > 0) {
        sessionsArray.removeAt(0);
      }
      sessionData.forEach((session: any) => {
        sessionsArray.push(this.fb.group({
          start_time: [session.start_time, Validators.required],
          end_time: [session.end_time, Validators.required],
          sessionDuration: [session.sessionDuration, Validators.required]
        }));
      });
    }
  }

  transformFormValue(formValue: any) {
    const daysData = formValue.days
      .map((day: any, index: number) => {
        if (!day.active || !day.sessions || !day.sessions.length) return null;

        const toUTCFormatted = (timeStr: string): string => {
          const [hours, minutes] = timeStr.split(':').map(Number);

          const localDate = new Date();
          localDate.setHours(hours, minutes, 0, 0);

          const year = localDate.getUTCFullYear();
          const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
          const day = String(localDate.getUTCDate()).padStart(2, '0');
          const hour = String(localDate.getUTCHours()).padStart(2, '0');
          const minute = String(localDate.getUTCMinutes()).padStart(2, '0');
          const second = String(localDate.getUTCSeconds()).padStart(2, '0');

          return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        };

        const slots = day.sessions.map((session: any) => ({
          start_time: session.start_time,
          end_time: session.end_time,
          start_time_utc: toUTCFormatted(session.start_time),
          end_time_utc: toUTCFormatted(session.end_time),
          slot_duration: session.sessionDuration.split(' ')[0]
        }));

        return {
          day: this.daysOfWeek[index],
          slots
        };
      })
      .filter(Boolean);

    return { days: daysData };
  }

  applyConditionalValidators() {
    this.days.controls.forEach((dayCtrl: AbstractControl, index: number) => {
      const isActive = dayCtrl.get('active')?.value;
      const sessions = (dayCtrl.get('sessions') as FormArray);

      sessions.controls.forEach((sessionGroup: AbstractControl) => {
        if (isActive) {
          sessionGroup.get('start_time')?.setValidators([Validators.required]);
          sessionGroup.get('end_time')?.setValidators([Validators.required]);
          sessionGroup.get('sessionDuration')?.setValidators([Validators.required]);
        } else {
          sessionGroup.get('start_time')?.clearValidators();
          sessionGroup.get('end_time')?.clearValidators();
          sessionGroup.get('sessionDuration')?.clearValidators();
        }
        sessionGroup.get('start_time')?.updateValueAndValidity();
        sessionGroup.get('end_time')?.updateValueAndValidity();
        sessionGroup.get('sessionDuration')?.updateValueAndValidity();
      });
    });
  }

  getCertificaTeypes() {
    this.service.get<any>(`doctor/get_doctor_certificates_path`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.certificaTeypes = res.data
    });
  };
  getTreatments() {
    this.service.get<TreatmentResponse>(`clinic/get-treatments`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.treatments = res.data
      this.inItTreatMentForm();
    });
  }


  getSkinTypes() {
    this.service.get<SkinTypeResponse>(`clinic/get-skin-types`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.skintypes = res.data
    });
  }

  getSkinConditions() {
    this.service.get<any>(`clinic/get-SkinConditions`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.skinConditions = res.data
    });
  }

  getSurgeries() {
    this.service.get<any>(`clinic/get-surgery`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.surgeries = res.data
    });
  }

  getDevices() {
    this.service.get<any>(`clinic/get-devices`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
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
    this.profilePreview = null;
  }

  onAllCheckboxChange(event: any) {
    this.treatmentArray.controls.forEach((control: AbstractControl) => {
      control.get('selected')?.setValue(event.target.checked);
    })
  }

  onCheckboxChange(index: number) {
    const control = this.treatmentArray.at(index);
    const isChecked = control.get('selected')?.value;

    if (isChecked) {
      control.get('price')?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      control.get('price')?.clearValidators();
      control.get('price')?.setValue('');
    }

    control.get('price')?.updateValueAndValidity();
  }

  isIndeterminate() {
    const values = this.treatmentArray.controls.map(control => control.get('selected')?.value);
    const trueCount = values.filter(value => value === true).length;
    return trueCount > 0 && trueCount < this.treatmentArray.length;
  }

  onSubmitBasicInfo() {
    if (this.besicInfoForm.invalid) {
      this.besicInfoForm.markAllAsTouched();
      return;
    }

    this.loading = true
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
    if (this.productImages.length > 0) {
      for (let i = 0; i < this.productImages.length; i++) {
        formData.append('files', this.productImages[i])
      }
    }

    this.service.post<any, any>('solo_doctor/add_personal_info', formData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        if (res.success) {
          if (this.isEdit) {
            this.toster.success('Profile updated successfully');
            this.service.get<any>(`solo_doctor/getDoctorProfileByStatus/1`).pipe(
              takeUntil(this.destroy$)
            ).subscribe(res => {
              if (res.success) {
                this.service._soloDoctorProfile.set(res.data);
              }
            })
          } else {
            this.currentStep++;
          }
          this.loading = false
        } else {
          this.toster.error(res.message);
          this.loading = false
        }
      },
      error: (err) => {
        this.toster.error(err);
        this.loading = false
      }
    });
  }

  submitContactForm() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.loading = true
    let formData = {}

    if (this.contactForm.value.latitude && this.contactForm.value.longitude) {
      formData = {
        ...this.contactForm.value,
        address: this.selectedLocation,
        mobile_number: this.contactForm.value.mobile_number.e164Number
      }
    } else {
      this.toster.error('Map location is not valid please enter valid location')
      return
    }

    this.service.post<any, any>('solo_doctor/addContactInformation', formData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        if (res.success) {
          if (this.isEdit) {
            this.toster.success('Profile updated successfully');
          } else {
            this.currentStep++;
          }
          this.loading = false
        } else {
          this.toster.error(res.message);
          this.loading = false
        }
      },
      error: (err) => {
        this.toster.error(err);
        this.loading = false
      }
    });
  }

  onSubmitProfessional() {
    const isValidEdu = this.education.every(c =>
      c.institution?.trim() &&
      c.degree_name?.trim() &&
      c.start_year &&
      (
        c.isOngoing ||
        (c.end_year && c.end_year > c.start_year)
      )
    );

    if (!isValidEdu) {
      this.toster.warning('Please enter valid education details. End date must be after start date.');
      return;
    }
    const isValidExp = this.experience.every(c =>
      c.organisation_name?.trim() &&
      c.designation?.trim() &&
      c.start_date &&
      (
        c.isCurrent ||
        (c.end_date && c.end_date > c.start_date)
      )
    );
    if (!isValidExp) {
      this.toster.warning('Please enter valid experience details. End date must be after start date.');
      return;
    }

    this.loading = true
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

    this.service.post<any, any>('solo_doctor/add_education_experience', formData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          if (this.isEdit) {
            this.toster.success('Profile updated successfully');
          } else {
            this.currentStep++;
          }
          this.loading = false
        }
      },
      error: (error) => {
        this.loading = false
      }
    });

  };

  onExpertiseSubmit() {

    if (this.ExpertiseForm.invalid) {
      this.ExpertiseForm.markAllAsTouched();
      return
    }
    this.loading = true

    const selectedTreatments = this.treatmentArray.controls
      .map((group, i) => {
        const selected = group.get('selected')?.value;

        if (!selected) return null;

        return {
          treatment_id: this.treatments[i].treatment_id,
          price: group.get('price')?.value,
          session_duration: group.get('session_duration')?.value,
          add_notes: group.get('note')?.value
        };
      })
      .filter(item => item !== null);

    let formData = {
      treatments: selectedTreatments,
      skin_type_ids: this.ExpertiseForm.value.skin_types.join(','),
      skin_condition_ids: this.ExpertiseForm.value.skin_condition.join(','),
      surgery_ids: this.ExpertiseForm.value.surgeries.join(','),
      aesthetic_devices_ids: this.ExpertiseForm.value.devices.join(','),
    }
    this.service.post<any, any>('solo_doctor/add_expertise', formData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          if (this.isEdit) {
            this.toster.success('Profile updated successfully');
          } else {
            this.currentStep++;
          }
          this.loading = false
        } else {
          this.toster.error(resp.message);
          this.loading = false
        }
      },
      error: (error) => {
        this.loading = false
      }
    });
  };


  onTimeSubmit() {

    if (this.availabilityForm.get('sameForAllDays')?.value === true) {
      this.applySameSessionsToAll();
    }

    if (this.availabilityForm.invalid) {
      this.availabilityForm.markAllAsTouched();
      return;
    }

    const transformed = this.transformFormValue(this.availabilityForm.value);

    const transformedFormData = {
      ...transformed,
      fee_per_session: this.availabilityForm.value.fee_per_session,
      dr_type: 1
    };

    this.loading = true
    let formData = transformedFormData;

    if (this.isEdit) {
      this.service.post<any, any>('doctor/updateDoctorAvailability', formData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.toster.success(resp.message);
            this.router.navigate(['/solo-doctor/my-profile']);
            this.loading = false
          }
        },
        error: (error) => {
          this.toster.error(error);
          this.loading = false
        }
      })
    } else {
      this.service.post<any, any>('doctor/createDoctorAvailability', formData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            let data = this.auth.getUserInfo()
            data.is_onboarded = 1
            localStorage.setItem('userInfo', JSON.stringify(data));
            this.router.navigate(['/solo-doctor']);
            this.loading = false
          }
        },
        error: (error) => {
          this.toster.error(error);
          this.loading = false
        }
      })
    }


  }

  integerValidator(control: AbstractControl) {
    const value = control.value;
    return Number.isInteger(Number(value)) ? null : { notInteger: true };
  }

  searchLocation(event: any) {
    this.service.get<any>(`clinic/search-location?input=${event.target.value.trim()}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.locations = res.data
    })
  }

  selectLocation(location: any) {
    this.service.get<any>(`clinic/get-lat-long?address=${location}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.contactForm.patchValue({ latitude: res.data.lat, longitude: res.data.lng });
      this.selectedLocation = location;
      this.locations = [];
    })

  }

  addCertificate() {
    this.certificates.push({ type: '', file: null });
  };

  removeCertificate(index: number, id: any) {
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


  onProductImage(event: any) {
    const files = event.target.files;
    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewProductImages.push(e.target.result);
      };
      reader.readAsDataURL(file);
      this.productImages.push(file);
    });
  }

  removeProductImage(index: number, image?: string) {
    if (image) {
      const imageId = this.soloDrData?.clinic.images.find((item: any) => item.url == image)?.clinic_image_id
      this.service.delete<any>(`clinic/images/${imageId}`).pipe(
        takeUntil(this.destroy$)
      ).subscribe((resp) => {
        if (resp.success) {
          this.previewProductImages.splice(index, 1);
          this.productImages.splice(index, 1);
        } else {
          // this.toster.error(resp.message)
          this.previewProductImages.splice(index, 1);
          this.productImages.splice(index, 1);
        }
      }, (error) => {
        this.previewProductImages.splice(index, 1);
        this.productImages.splice(index, 1);
      })
    } else {
      this.previewProductImages.splice(index, 1);
      this.productImages.splice(index, 1);
    }
  }

  addEducation() {
    this.education.push({ institution: null, degree_name: null, start_year: null, end_year: null });
  }

  deleteCertificate(id: any) {
    this.service.delete<any>(`doctor/delete_certification/${id}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      if (res.success == true) {
      }
    });
  }

  getProfile(status: any) {
    this.service.get<any>(`solo_doctor/getDoctorProfileByStatus/${status}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        if (res.success) {
          const data = res.data;
          this.soloDrData = data
          if (!this.isEdit) {
            if (data.on_boarding_status == undefined || data.on_boarding_status == null) {
              this.currentStep = data.clinic.on_boarding_status
            } else {
              this.currentStep = data.on_boarding_status
            }
          }
          switch (status) {
            case 1:
              this.profilePreview = data?.profile_image
              this.logoPreview = data?.clinic?.clinic_logo
              this.previewProductImages = []
              data.clinic.images.forEach((element: any) => {
                this.previewProductImages.push(element.url)
              })
              this.besicInfoForm.patchValue({
                name: data.name,
                age: data.age,
                gender: data.gender,
                clinic_name: data.clinic.clinic_name,
                clinic_description: data.clinic.clinic_description,
                ivo_registration_number: data.clinic.ivo_registration_number,
                hsa_id: data.clinic.hsa_id
              })
              break;

            case 2:
              this.contactForm.patchValue({
                mobile_number: data.clinic.mobile_number,
                city: data.clinic.city,
                state: data.clinic.state,
                street_address: data.clinic.street_address,
                zip_code: data.clinic.zip_code,
                latitude: data.clinic.latitude,
                longitude: data.clinic.longitude,
                website_url: data.clinic.website_url
              })
              this.selectedLocation = data?.clinic.address
              break;

            case 3:
              if (data.education.length > 0) {
                this.education = data.education.map((edu: { institution: any; degree: any; start_year: any; end_year: any; }) => ({
                  institution: edu.institution, degree_name: edu.degree, start_year: edu.start_year, end_year: edu.end_year,
                  isOngoing: edu.end_year ? false : true
                }));
              }
              if (data.experience.length > 0) {
                this.experience = data.experience.map((edu: { organization: any; designation: any; start_date: string; end_date: string; }) => ({
                  organisation_name: edu.organization, designation: edu.designation, start_date: edu.start_date ? edu.start_date.split('T')[0] : '',
                  end_date: edu.end_date ? edu.end_date.split('T')[0] : null,
                  isCurrent: edu.end_date ? false : true
                }));
              }
              break;

            case 4:
              this.ExpertiseForm.patchValue({
                treatments: data.clinic?.treatments.forEach((item: any) => {
                  const index = this.treatments.findIndex(t => t.treatment_id === item.treatment_id);

                  if (index !== -1) {
                    const group = this.treatmentArray.at(index);

                    group.patchValue({
                      selected: true,
                      price: item.price,
                      note: item.add_notes,
                      session_duration: item.session_duration
                    });

                    this.onCheckboxChange(index);
                  }
                }),
                skin_types: data.clinic?.skin_types.map((item: any) => item.skin_type_id),
                surgeries: data.clinic?.surgeries_level.map((item: any) => item.surgery_id),
                devices: data.clinic?.aestheticDevices.map((item: any) => item.aesthetic_device_id),
                skin_condition: data.clinic?.skin_Conditions.map((item: any) => item.skin_condition_id),
              })
              break;

            case 5:
              this.availabilityForm.patchValue({
                fee_per_session: data.clinic.doctorSessions[0].fee_per_session,
              });
              this.patchAvailabilityData(data.clinic.operation_hours);
              break;
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

  patchAvailabilityData(operation_hours: any[]) {
    const daysFormArray = this.availabilityForm.get('days') as FormArray;
    const dayIndexMap = {
      monday: 0,
      tuesday: 1,
      wednesday: 2,
      thursday: 3,
      friday: 4,
      saturday: 5,
      sunday: 6
    };

    const groupedByDay: { [key: string]: any[] } = {};
    operation_hours.forEach((item) => {
      const day = item.day.toLowerCase();
      if (!groupedByDay[day]) {
        groupedByDay[day] = [];
      }

      groupedByDay[day].push({
        start_time: item.start_time,
        end_time: item.end_time,
        sessionDuration: item.slot_duration + ' Mins',
      });
    });

    Object.entries(dayIndexMap).forEach(([day, index]) => {
      const dayFormGroup = daysFormArray.at(index) as FormGroup;
      const sessionsArray = dayFormGroup.get('sessions') as FormArray;

      while (sessionsArray.length > 0) {
        sessionsArray.removeAt(0);
      }

      const dayData = groupedByDay[day];
      if (dayData?.length) {
        dayFormGroup.get('active')?.setValue(true);
        dayData.forEach((slot) => {
          sessionsArray.push(this.fb.group({
            start_time: [slot.start_time, Validators.required],
            end_time: [slot.end_time, Validators.required],
            sessionDuration: [slot.sessionDuration, Validators.required],
          }));
        });
      } else {
        dayFormGroup.get('active')?.setValue(false);
      }
    });
  }


  previousStep() {
    this.currentStep--
    if (this.isEdit) {
      this.getProfile(this.currentStep + 1)
    } else {
      this.service.get<any>(`solo_doctor/updateOnboardingStatus?statusId=${this.currentStep}`).pipe(
        takeUntil(this.destroy$)
      ).subscribe(res => {
        this.getProfile(this.currentStep + 1)
      })
    }
  }

  nextStep() {
    this.currentStep++
    this.getProfile(this.currentStep + 1)
  }

  changeStep(step: number) {
    this.currentStep = step
    this.getProfile(this.currentStep + 1)
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
