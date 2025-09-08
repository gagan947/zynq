import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NoWhitespaceDirective } from '../../../../validators';
import { CommonService } from '../../../../services/common.service';
import { SkinType, SkinTypeResponse, Treatment, TreatmentResponse } from '../../../../models/clinic-onboarding';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { LoginUserData } from '../../../../models/login';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ClinicProfile, ClinicProfileResponse } from '../../../../models/clinic-profile';
import { AuthService } from '../../../../services/auth.service';
import { LoaderService } from '../../../../services/loader.service';
import { CountryISO, NgxIntlTelInputModule, SearchCountryField } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-clinic-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NzSelectModule, NzUploadModule, NgxIntlTelInputModule],
  templateUrl: './clinic-setup.component.html',
  styleUrl: './clinic-setup.component.css'
})
export class ClinicSetupComponent {
  Form!: FormGroup
  treatments: Treatment[] = []
  skintypes: SkinType[] = []
  skinConditions: any[] = []
  surgeries: any[] = []
  devices: any[] = []
  productImages: File[] = [];
  previewProductImages: any[] = [];
  days: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  submitted: boolean = false
  currentStep = 0;
  userInfo: LoginUserData;
  LogoImage: File | null = null;
  logoPreview: string | null = null;
  locations: any[] = [];
  selectedLocation: any = null;
  clinicPofile: ClinicProfile | null = null;
  selectedDrEmail: string[] = [];
  SearchCountryField = SearchCountryField
  CountryISO = CountryISO;
  selectedCountry = CountryISO.Sweden
  preferredCountries: CountryISO[] = [CountryISO.Sweden];
  @ViewChild('drEmail') drEmail!: ElementRef<HTMLButtonElement>
  steps = [
    { id: 'Clinic', label: 'Clinic Details' },
    { id: 'Contact', label: 'Contact Details' },
    // { id: 'Operation', label: 'Operation Hours' },
    { id: 'Expertise', label: 'Expertise' },
    { id: 'invite', label: 'Invite Doctors' }
  ];

  stepFields = [
    ['clinic_name', 'org_number', 'zynq_user_id', 'clinic_description', 'logo', 'ivo_registration_number', 'hsa_id'],
    ['email', 'mobile_number', 'street_address', 'city', 'state', 'zip_code', 'latitude', 'longitude', 'website_url'],
    // ['clinic_timing'],
    ['treatments', 'skin_types', 'skin_condition', 'surgeries', 'devices']
  ];

  loading: boolean = false

  constructor(private fb: FormBuilder, private service: CommonService, private toster: NzMessageService, private router: Router, private auth: AuthService, private loader: LoaderService) {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  }

  ngOnInit(): void {
    this.inItForm();
    this.getTreatments();
    this.getSkinTypes();
    this.getSkinConditions();
    this.getSurgeries();
    this.getDevices();
    this.getProfile();
  }

  inItForm() {
    this.Form = this.fb.group({
      clinic_name: ['', [Validators.required, NoWhitespaceDirective.validate]],
      org_number: [''],
      zynq_user_id: [''],
      ivo_registration_number: [''],
      hsa_id: [''],
      email: ['', [Validators.required, Validators.email]],
      mobile_number: ['', [Validators.required]],
      street_address: ['', [Validators.required, NoWhitespaceDirective.validate]],
      city: ['', [Validators.required, NoWhitespaceDirective.validate]],
      state: ['', [Validators.required, NoWhitespaceDirective.validate]],
      zip_code: ['', [Validators.required, NoWhitespaceDirective.validate]],
      latitude: [''],
      longitude: [''],
      treatments: [[], [Validators.required]],
      skin_types: [[], [Validators.required]],
      // severity_levels: [[], [Validators.required]],
      skin_condition: [[], [Validators.required]],
      surgeries: [[], [Validators.required]],
      devices: [[], [Validators.required]],


      // clinic_timing: this.fb.group({
      //   monday: this.fb.group({
      //     open: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     close: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     is_closed: [false]
      //   }, { validators: timeRangeValidator() }),
      //   tuesday: this.fb.group({
      //     open: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     close: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     is_closed: [false]
      //   }, { validators: timeRangeValidator() }),
      //   wednesday: this.fb.group({
      //     open: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     close: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     is_closed: [false]
      //   }, { validators: timeRangeValidator() }),
      //   thursday: this.fb.group({
      //     open: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     close: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     is_closed: [false]
      //   }, { validators: timeRangeValidator() }),
      //   friday: this.fb.group({
      //     open: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     close: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     is_closed: [false]
      //   }, { validators: timeRangeValidator() }),
      //   saturday: this.fb.group({
      //     open: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     close: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     is_closed: [false]
      //   }, { validators: timeRangeValidator() }),
      //   sunday: this.fb.group({
      //     open: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     close: ['', [Validators.required, NoWhitespaceDirective.validate]],
      //     is_closed: [false]
      //   }, { validators: timeRangeValidator() })
      // }),

      website_url: ['', [Validators.required, NoWhitespaceDirective.validate]],
      clinic_description: ['', [Validators.required, NoWhitespaceDirective.validate, Validators.maxLength(500)]],

      // fee_range: this.fb.group({
      //   min: ['', [Validators.required]],
      //   max: ['', [Validators.required]]
      // }),

      language: ['en'],
      logo: [null],
    });
  }
  get clinicTiming(): FormGroup {
    return this.Form.get('clinic_timing') as FormGroup;
  }

  get feeRange(): FormGroup {
    return this.Form.get('fee_range') as FormGroup;
  }

  hasClinicTimingError(day: string, controlName: string, errorType: string): boolean {
    const dayGroup = this.clinicTiming.get(day) as FormGroup;
    const control = dayGroup?.get(controlName);
    return !!(control && control.touched && control.hasError(errorType));
  }

  setClosed(day: string, event: any) {
    const dayGroup = this.clinicTiming.get(day) as FormGroup;
    dayGroup?.patchValue({ is_closed: event.target.checked, open: '', close: '' });
    if (event.target.checked) {
      dayGroup?.get('open')?.clearValidators();
      dayGroup?.get('close')?.clearValidators();
    } else {
      dayGroup?.get('open')?.setValidators([Validators.required, NoWhitespaceDirective.validate]);
      dayGroup?.get('close')?.setValidators([Validators.required, NoWhitespaceDirective.validate]);
    }
    dayGroup?.get('open')?.updateValueAndValidity();
    dayGroup?.get('close')?.updateValueAndValidity();
  }

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

  addDrEmail(email: string) {
    if (!this.selectedDrEmail.includes(email)) {
      if (email.trim() != '') {
        this.selectedDrEmail.push(email.trim());
        this.drEmail.nativeElement.value = '';
      }
    } else {
      this.toster.error('Email already added');
    }
  }

  removeDrEmail(index: number) {
    this.selectedDrEmail.splice(index, 1);
  }

  get progress(): string {
    return ((this.currentStep + 1) / this.steps.length) * 100 + '%';
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1 && this.validateCurrentStep()) {
      this.onSubmit();
      // this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  validateCurrentStep(): boolean {
    const controls = this.stepFields[this.currentStep];
    let isValid = true;

    controls.forEach(field => {
      const control = this.Form.get(field);
      if (control instanceof FormArray || control instanceof FormGroup) {
        control.markAllAsTouched();
      } else {
        control?.markAsTouched();
      }

      if (control && control.invalid) {
        isValid = false;
      }
    });

    return isValid;
  }

  searchLocation(event: any) {
    this.service.get<any>(`clinic/search-location?input=${event.target.value.trim()}`).subscribe((res) => {
      this.locations = res.data
    })
  }

  selectLocation(location: any) {
    this.service.get<any>(`clinic/get-lat-long?address=${location}`).subscribe((res) => {
      this.Form.patchValue({ latitude: res.data.lat, longitude: res.data.lng });
      this.selectedLocation = location;
      this.locations = [];
    })

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
      const imageId = this.clinicPofile?.images.find((item: any) => item.url == image)?.clinic_image_id
      this.service.delete<any>(`clinic/images/${imageId}`).subscribe((resp) => {
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

  onSubmit() {
    this.submitted = true;

    if (!this.validateCurrentStep()) {
      this.Form.markAllAsTouched();
      return;
    }
    this.loading = true
    let formData = new FormData()
    if (this.currentStep === 0) {
      formData.append('clinic_name', this.Form.value.clinic_name)
      // formData.append('org_number', this.Form.value.org_number)
      formData.append('zynq_user_id', this.userInfo.id)
      formData.append('clinic_description', this.Form.value.clinic_description)
      if (this.LogoImage) {
        formData.append('logo', this.LogoImage!)
      }
      if (this.productImages.length > 0) {
        for (let i = 0; i < this.productImages.length; i++) {
          formData.append('files', this.productImages[i])
        }
      }
      formData.append('ivo_registration_number', this.Form.value.ivo_registration_number)
      formData.append('hsa_id', this.Form.value.hsa_id)
      formData.append('form_stage', '1')
    } else if (this.currentStep === 1) {
      // formData.append('email', this.Form.value.email)
      formData.append('mobile_number', this.Form.value.mobile_number.e164Number)
      formData.append('street_address', this.Form.value.street_address)
      formData.append('city', this.Form.value.city)
      formData.append('state', this.Form.value.state)
      formData.append('zip_code', this.Form.value.zip_code)
      formData.append('address', this.selectedLocation)
      if (this.Form.value.latitude && this.Form.value.longitude) {
        formData.append('latitude', this.Form.value.latitude)
        formData.append('longitude', this.Form.value.longitude)
      } else {
        this.toster.error('Map location is not valid please enter valid location')
        return
      }
      formData.append('zynq_user_id', this.userInfo.id)
      formData.append('website_url', this.Form.value.website_url)
      formData.append('form_stage', '2')
      // } else if (this.currentStep === 2) {
      //   formData.append('zynq_user_id', this.userInfo.id)
      //   formData.append('clinic_timing', JSON.stringify(this.Form.value.clinic_timing))
      //   formData.append('form_stage', this.currentStep.toString())
    } else if (this.currentStep === 2) {
      formData.append('treatments', JSON.stringify(this.Form.value.treatments));
      formData.append('skin_types', JSON.stringify(this.Form.value.skin_types));
      // formData.append('severity_levels', JSON.stringify(this.Form.value.severity_levels));
      formData.append('surgeries', JSON.stringify(this.Form.value.surgeries));
      formData.append('aestheticDevices', JSON.stringify(this.Form.value.devices));
      formData.append('skin_Conditions', JSON.stringify(this.Form.value.skin_condition));
      formData.append('language', 'en');
      formData.append('zynq_user_id', this.userInfo.id);
      formData.append('form_stage', "3");
    } else {
      return
    }

    this.service.post(`clinic/onboard-clinic`, formData).subscribe((res: any) => {
      if (res.success) {
        this.currentStep++;
        this.loading = false
      } else {
        this.toster.error(res.message);
        this.loading = false
      }
    }, err => {
      this.toster.error(err);
      this.loading = false
    })
  }

  inviteDr() {

    if (this.selectedDrEmail.length == 0) {
      this.toster.error('Please add at least one email');
      return;
    }
    this.loader.show();
    this.service.post<any, any>('clinic/send-doctor-invitation', { emails: this.selectedDrEmail }).subscribe({
      next: (resp) => {
        if (resp.success) {
          const formData = new FormData();
          formData.append('zynq_user_id', this.userInfo.id);
          formData.append('is_onboarded', 'true');
          this.service.post<any, any>('clinic/onboard-clinic', formData).subscribe({
            next: (res) => {
              if (res.status) {
                let data = this.auth.getUserInfo()
                data.is_onboarded = 1
                localStorage.setItem('userInfo', JSON.stringify(data));
                this.toster.success(resp.message);
                this.router.navigate(['/clinic']);
                this.loader.hide();
              }
              // this.currentStep++;
            },
            error: (err) => {
              this.toster.error(err);
              this.loader.hide();
            }
          });
        } else {
          this.toster.error(resp.message);
          this.loader.hide();
        }
      },
      error: (error) => {
        this.toster.error(error);
        this.loader.hide();
      }
    });
  }


  getProfile() {
    this.service.get<ClinicProfileResponse>('clinic/get-profile').subscribe(res => {
      if (res.status) {
        this.clinicPofile = res.data;
        this.logoPreview = this.clinicPofile.clinic_logo
        this.currentStep = this.clinicPofile.form_stage
        this.selectedLocation = this.clinicPofile.address
        this.clinicPofile?.images.map((item: any) => this.previewProductImages.push(item.url))
        this.Form.patchValue({
          clinic_name: this.clinicPofile.clinic_name,
          clinic_description: this.clinicPofile.clinic_description,
          ivo_registration_number: this.clinicPofile.ivo_registration_number || '',
          hsa_id: this.clinicPofile.hsa_id || '',
          email: this.clinicPofile.email,
          mobile_number: this.clinicPofile.mobile_number,
          city: this.clinicPofile.location.city,
          state: this.clinicPofile.location.state,
          street_address: this.clinicPofile.location.street_address,
          zip_code: this.clinicPofile.location.zip_code,
          latitude: this.clinicPofile.location.latitude,
          longitude: this.clinicPofile.location.longitude,
          website_url: this.clinicPofile.website_url,
          treatments: this.clinicPofile?.treatments.map((item: any) => item.treatment_id),
          skin_types: this.clinicPofile?.skin_types.map((item: any) => item.skin_type_id),
          surgeries: this.clinicPofile?.surgeries_level.map((item: any) => item.surgery_id),
          devices: this.clinicPofile?.aestheticDevices.map((item: any) => item.aesthetic_device_id),
          skin_condition: this.clinicPofile?.skin_Conditions.map((item: any) => item.skin_condition_id),
        });
      }
    }
    )
  }

  patchClinicTiming(operation_hours: any[]) {
    const form = this.Form.get('clinic_timing') as FormGroup;

    operation_hours.forEach(hour => {
      const dayKey = hour.day_of_week.toLowerCase();
      const dayFormGroup = form.get(dayKey) as FormGroup;
      if (dayFormGroup) {
        dayFormGroup.patchValue({
          open: hour.open_time !== '00:00:00' ? hour.open_time : null,
          close: hour.close_time !== '00:00:00' ? hour.close_time : null,
          is_closed: hour.is_closed === 1
        });
        if (hour.is_closed === 1) {
          dayFormGroup?.get('open')?.clearValidators();
          dayFormGroup?.get('close')?.clearValidators();
        }
      }
    });
  }
}
