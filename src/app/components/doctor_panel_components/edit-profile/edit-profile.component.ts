import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SecurityLevel, TreatmentResponse, SkinTypeResponse } from '../../../models/clinic-onboarding';
import { Treatment, SkinType } from '../../../models/clinic-profile';
import { DoctorProfileResponse } from '../../../models/doctorProfile';
import { CommonService } from '../../../services/common.service';
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoaderService } from '../../../services/loader.service';
import { NoWhitespaceDirective } from '../../../validators';
import { environment } from '../../../../environments/environment';
import { CountryISO, NgxIntlTelInputModule, SearchCountryField } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [NzSelectModule, CommonModule, FormsModule, ReactiveFormsModule, RouterLink, NgxIntlTelInputModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {
  certificateURl = environment.certificateUrl;
  @Input() isEdit: boolean = false; // default value
  personalForm!: FormGroup;
  availabilityForm!: FormGroup;
  Form!: FormGroup;
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  sessionDuration: string[] = ['15 Mins', '30 Mins', '45 Mins', '60 Mins', '75 Mins', '90 Mins', '105 Mins', '120 Mins']
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
  skintypes: SkinType[] = []
  maxDate: Date = new Date();
  skinConditions: any[] = []
  surgeries: any[] = []
  devices: any[] = []
  loading: boolean = false
  SearchCountryField = SearchCountryField
  CountryISO = CountryISO;
  selectedCountry = CountryISO.Sweden
  constructor(private fb: FormBuilder, private loaderService: LoaderService, private apiService: CommonService, private toster: NzMessageService, private router: Router) {

  }


  ngOnInit(): void {
    this.personalForm = this.fb.group({
      fullName: ['', [Validators.required, NoWhitespaceDirective.validate]],
      phone: ['', [Validators.required, Validators.min(0)]],
      age: ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$'), this.integerValidator]],
      gender: ['', Validators.required],
      address: ['', [Validators.required, NoWhitespaceDirective.validate]],
      biography: ['']
    });

    this.Form = this.fb.group({
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

    this.getCertificaTeypes();
    this.getTreatments();
    this.getSkinTypes();
    this.getSkinConditions();
    this.getSurgeries();
    this.getDevices();
    this.loadFormData();
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
    return this.Form.get('treatments') as FormArray;
  }


  loadFormData() {
    // this.loaderService.show();
    this.apiService.get<DoctorProfileResponse>('doctor/get_profile').subscribe(res => {
      if (res.success == false) {
        return;
      }
      const data = res.data;
      this.apiService._doctorProfile.set(data);
      this.personalForm.patchValue({
        fullName: data.name,
        phone: data.phone,
        age: data.age,
        gender: data.gender,
        address: data.address,
        biography: data.biography
      });
      if (data.profile_image != null && data.profile_image != '') {
        this.imagePreview = data.profile_image;
      }
      this.Form.patchValue({
        treatments: data?.treatments.forEach((item: any) => {
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
        skin_types: data?.skinTypes.map((item: any) => item.skin_type_id),
        surgeries: data?.surgery.map((item: any) => item.surgery_id),
        devices: data?.aestheticDevices.map((item: any) => item.aesthetic_devices_id),
        skin_condition: data?.skinCondition.map((item: any) => item.skin_condition_id),
      })

      // if (data.certifications.length > 0) {
      //   this.certificaTeypes = data.certifications.map(cert => ({ type: cert.file_name, file: null, previewUrl: cert.upload_path, id: cert.doctor_certification_id }));
      // }
      if (data.education.length > 0) {
        this.education = data.education.map(edu => ({
          institution: edu.institution, degree_name: edu.degree, start_year: edu.start_year, end_year: edu.end_year,
          isOngoing: edu.end_year ? false : true
        }));
      }
      if (data.experience.length > 0) {
        this.experience = data.experience.map(edu => ({
          organisation_name: edu.organization, designation: edu.designation, start_date: edu.start_date ? edu.start_date.split('T')[0] : '',
          end_date: edu.end_date ? edu.end_date.split('T')[0] : null,
          isCurrent: edu.end_date ? false : true
        }));
      }

      this.availabilityForm.patchValue({
        fee_per_session: data.fee_per_session,
      })
      this.patchAvailabilityData(data.availability);
    });
  };

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

        const slots = day.sessions.map((session: any) => ({
          start_time: session.start_time,
          end_time: session.end_time,
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

  nextStep() {
    if (this.currentStep == 0 && this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return
    }
    if (this.currentStep == 0 && this.personalForm.valid) {
      this.onSubmitPersonal();
    };
    if (this.currentStep == 1) {

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

  next() {
    this.currentStep = this.currentStep + 1;
  }

  previous() {
    this.currentStep = this.currentStep - 1;
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
  onSubmitPersonal() {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    };
    this.loading = true;
    const formData = new FormData();
    formData.append('name', this.personalForm.value.fullName);
    formData.append('phone', this.personalForm.value.phone.e164Number);
    formData.append('age', this.personalForm.value.age.toString());
    formData.append('gender', this.personalForm.value.gender);
    formData.append('address', this.personalForm.value.address);
    formData.append('biography', this.personalForm.value.biography);

    if (this.profileImage) {
      formData.append('file', this.profileImage, this.profileImage.name);
    }
    this.apiService.post<any, any>('doctor/edit_personal_details', formData).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          this.toster.success(resp.message);
          this.loadFormData();
          this.loading = false;
        }
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      }
    });
  };

  onSubmitProfessional() {
    this.loading = true;
    const formData = new FormData();
    const education = this.education.map(edu => ({
      institute: edu.institution.trim(),
      degree: edu.degree_name.trim(),
      start_year: edu.start_year,
      end_year: edu.end_year
    }));
    const experience = this.experience.map(exp => ({
      organization: exp.organisation_name.trim(),
      start_date: exp.start_date,
      end_date: exp.end_date,
      designation: exp.designation.trim()
    }))
    formData.append('education', JSON.stringify(education));
    formData.append('experience', JSON.stringify(experience));
    this.certificaTeypes.forEach((cert: any) => {
      if (cert.file) {
        formData.append(cert.file_name, cert.file, cert.file.name);
      }
    })

    this.apiService.post<any, any>('doctor/edit_education_experience', formData).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          this.toster.success(resp.message);
          this.loadFormData();
          this.getCertificaTeypes();
          this.loading = false;
        } else {
          this.toster.error(resp.message);
          this.loading = false;
        }
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      }
    });
  };

  onExpertiseSubmit() {
    if (this.Form.invalid) {
      this.Form.markAllAsTouched();
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
      skin_type_ids: this.Form.value.skin_types.join(','),
      skin_condition_ids: this.Form.value.skin_condition.join(','),
      surgery_ids: this.Form.value.surgeries.join(','),
      aesthetic_devices_ids: this.Form.value.devices.join(','),
    }

    this.apiService.post<any, any>('doctor/edit_expertise', formData).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          this.toster.success(resp.message);
        } else {
          this.toster.error(resp.message);
        }
        this.loading = false
      },
      error: (error) => {
        console.log(error);
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
      dr_type: 0
    };
    this.loading = true
    let formData = transformedFormData;

    this.apiService.post<any, any>('doctor/updateDoctorAvailability', formData).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          this.toster.success(resp.message);
          this.router.navigate(['/doctor/my-profile']);
          this.loading = false
        }
      },
      error: (error) => {
        this.toster.error(error);
        this.loading = false
      }
    })
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
    console.log(index, id);
    this.certificaTeypes[index].upload_path = null;
    if (id) {
      this.deleteCertificate(id)
    }
  }

  removeImage() {
    this.apiService.delete<any>(`doctor/delete_profile_image`).subscribe((res) => {
      if (res.success) {
        this.imagePreview = null;
        this.profileImage = null;
      } else {
        this.toster.error(res.message);
      }
    })
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

  getCertificaTeypes() {
    this.apiService.get<any>(`doctor/get_doctor_certificates_path`).subscribe((res) => {
      this.certificaTeypes = res.data;
    });
  };

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.certificaTeypes[index].file = file;
      this.certificaTeypes[index].previewUrl = null;
    }

  };

  addEducation() {
    this.education.push({
      institution: null, degree_name: null, start_year: null,
      end_year: null
    });
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
      this.inItTreatMentForm();
    });
  }


  getSkinTypes() {
    this.apiService.get<SkinTypeResponse>(`clinic/get-skin-types`).subscribe((res) => {
      this.skintypes = res.data
    });
  }

  getSkinConditions() {
    this.apiService.get<any>(`clinic/get-SkinConditions`).subscribe((res) => {
      this.skinConditions = res.data
    });
  }

  getSurgeries() {
    this.apiService.get<any>(`clinic/get-surgery`).subscribe((res) => {
      this.surgeries = res.data
    });
  }

  getDevices() {
    this.apiService.get<any>(`clinic/get-devices`).subscribe((res) => {
      this.devices = res.data
    });
  }

  trackById(index: number, item: SecurityLevel) {
    return item.severity_level_id;
  };

  deleteCertificate(id: any) {
    this.apiService.delete<any>(`doctor/delete_certification/${id}`).subscribe((res) => {
      if (res.success == true) {
      }
    });
  }

  integerValidator(control: AbstractControl) {
    const value = control.value;
    return Number.isInteger(Number(value)) ? null : { notInteger: true };
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
}
