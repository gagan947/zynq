import { CommonModule, Location } from '@angular/common';
import { Component, effect, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NoWhitespaceDirective } from '../../../../validators';
import { CommonService } from '../../../../services/common.service';
import { CertificationType, SkinType, SkinTypeResponse, Treatment, TreatmentResponse } from '../../../../models/clinic-onboarding';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { LoginUserData } from '../../../../models/login';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CountryISO, NgxIntlTelInputModule, SearchCountryField } from 'ngx-intl-tel-input';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
declare var bootstrap: any;
@Component({
  selector: 'app-edit-clinic-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NzSelectModule, NzUploadModule, NgxIntlTelInputModule, ImageCropperComponent, TranslateModule],
  templateUrl: './edit-clinic-profile.component.html',
  styleUrl: './edit-clinic-profile.component.css'
})
export class EditClinicProfileComponent {
  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>
  Form!: FormGroup
  treatments: Treatment[] = []
  skinConditions: any[] = []
  surgeries: any[] = []
  devices: any[] = []
  skintypes: SkinType[] = []
  certificaTeypes: CertificationType[] = []
  days: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  submitted: boolean = false
  currentStep = 0;
  userInfo: LoginUserData;
  LogoImage: File | null = null;
  logoPreview: string | null | undefined = null;
  coverImage: File | null = null;
  coverPreview: string | null | undefined = null;
  locations: any[] = [];
  selectedLocation: any = null;
  productImages: File[] = [];
  previewProductImages: any[] = [];
  clinicProfile = this.service._clinicProfile;
  SearchCountryField = SearchCountryField
  CountryISO = CountryISO;
  selectedCountry = CountryISO.Sweden
  preferredCountries: CountryISO[] = [CountryISO.Sweden]
  steps = [
    { id: 'Clinic', label: 'ClinicDetails' },
    { id: 'Contact', label: 'ContactDetails' },
    { id: 'Expertise', label: 'Expertise' }
  ];

  stepFields = [
    ['clinic_name', 'org_number', 'zynq_user_id', 'clinic_description', 'logo', 'ivo_registration_number', 'hsa_id'],
    ['email', 'mobile_number', 'street_address', 'city', 'state', 'zip_code', 'latitude', 'longitude', 'website_url'],
    // ['clinic_timing'],
    ['skin_types', 'skin_condition', 'surgeries']
  ];
  loading: boolean = false
  constructor(private fb: FormBuilder, private service: CommonService, private toster: NzMessageService, private router: Router, public location: Location, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    effect(() => {
      if (this.clinicProfile()) {
        this.patchValue();
      }
    });
  }

  ngOnInit(): void {
    this.inItForm();
    // this.getTreatments();
    this.getSkinTypes();
    this.getSkinConditions();
    this.getSurgeries();
    // this.getDevices();
  }

  inItForm() {
    this.Form = this.fb.group({
      clinic_name: ['', [Validators.required, NoWhitespaceDirective.validate]],
      org_number: [''],
      zynq_user_id: [''],
      // ivo_registration_number: [''],
      // hsa_id: [''],
      email: ['', [Validators.required, Validators.email]],
      mobile_number: ['', [Validators.required]],
      street_address: ['', [Validators.required, NoWhitespaceDirective.validate]],
      city: ['', [Validators.required, NoWhitespaceDirective.validate]],
      state: ['', [Validators.required, NoWhitespaceDirective.validate]],
      zip_code: ['', [Validators.required, NoWhitespaceDirective.validate]],
      latitude: [''],
      longitude: [''],

      // treatments: [[], [Validators.required]],
      skin_types: [[]],
      // severity_levels: [[], [Validators.required]],
      skin_condition: [[]],
      surgeries: [[]],
      // devices: [[], [Validators.required]],

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

      website_url: [''],
      clinic_description: ['', [Validators.required, NoWhitespaceDirective.validate, Validators.maxLength(500)]],

      // fee_range: this.fb.group({
      //   min: ['', [Validators.required]],
      //   max: ['', [Validators.required]]
      // }),

      language: ['en'],
      logo: [null],
      coverImg: [null]
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


  get progress(): string {
    return ((this.currentStep + 1) / this.steps.length) * 100 + '%';
  }

  goTo(index: number) {
    this.currentStep = index
  }

  next() {
    this.currentStep = this.currentStep + 1;
  }

  previous() {
    this.currentStep = this.currentStep - 1;
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
      const imageId = this.clinicProfile()?.images.find((item: any) => item.url == image)?.clinic_image_id
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
    this.service.get<any>(`clinic/search-location?input=${event.target.value}`).subscribe((res) => {
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


  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageBlob: any = '';
  onLogoImage(event: any): void {
    this.imageChangedEvent = event
    this.openModal()
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBlob = event.blob
    this.croppedImage = event.objectUrl
  }

  onDone() {
    this.logoPreview = this.croppedImage
    this.LogoImage = new File([this.croppedImageBlob], 'clinic.png', {
      type: 'image/png'
    })
    this.closeBtn.nativeElement.click()
  }

  openModal() {
    const modalElement = document.getElementById('ct_feedback_detail_modal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  removeImage() {
    this.LogoImage = null;
    this.logoPreview = null;
  }

  onCoverImage(event: any) {
    const file = event.target.files[0];
    this.coverImage = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.coverPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  removeCoverImage() {
    this.coverImage = null;
    this.coverPreview = null;
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
      formData.append('clinic_description', this.Form.value.clinic_description)
      if (this.LogoImage) {
        formData.append('logo', this.LogoImage!)
      }
      if (this.productImages.length > 0) {
        for (let i = 0; i < this.productImages.length; i++) {
          formData.append('files', this.productImages[i])
        }
      }
      formData.append('org_number', this.Form.value.org_number)
      // formData.append('hsa_id', this.Form.value.hsa_id)
      formData.append('zynq_user_id', this.userInfo.id);
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
      formData.append('website_url', this.Form.value.website_url)
      formData.append('zynq_user_id', this.userInfo.id);
      // } else if (this.currentStep === 2) {
      //   formData.append('clinic_timing', JSON.stringify(this.Form.value.clinic_timing))
      //   formData.append('zynq_user_id', this.userInfo.id);
    } else if (this.currentStep === 2 && this.Form.valid) {
      // formData.append('treatments', JSON.stringify(this.Form.value.treatments));
      formData.append('skin_types', JSON.stringify(this.Form.value.skin_types));
      formData.append('surgeries', JSON.stringify(this.Form.value.surgeries));
      // formData.append('aestheticDevices', JSON.stringify(this.Form.value.devices));
      formData.append('skin_Conditions', JSON.stringify(this.Form.value.skin_condition));
      formData.append('language', 'en');
      formData.append('zynq_user_id', this.userInfo.id);
    } else {
      this.Form.markAllAsTouched();
      return
    }

    this.service.post(`clinic/onboard-clinic`, formData).subscribe((res: any) => {
      if (res.success) {
        this.getClinicProfile()
        this.toster.success('Profile updated successfully');
        if (this.currentStep === 2) {
          this.router.navigate(['/clinic/clinic-profile']);
        }
        this.loading = false
      } else {
        this.toster.error(res.message);
        this.loading = false
      }
    }, err => {
      this.loading = false
      this.toster.error(err);
    })
  }


  patchValue() {
    this.previewProductImages = []
    this.logoPreview = this.clinicProfile()?.clinic_logo
    this.selectedLocation = this.clinicProfile()?.address
    this.clinicProfile()?.images.map((item: any) => this.previewProductImages.push(item.url))
    this.Form.patchValue({
      clinic_name: this.clinicProfile()?.clinic_name,
      clinic_description: this.clinicProfile()?.clinic_description,
      org_number: this.clinicProfile()?.org_number || '',
      // hsa_id: this.clinicProfile()?.hsa_id || '',
      email: this.clinicProfile()?.email,
      mobile_number: this.clinicProfile()?.mobile_number,
      city: this.clinicProfile()?.location.city,
      state: this.clinicProfile()?.location.state,
      street_address: this.clinicProfile()?.location.street_address,
      zip_code: this.clinicProfile()?.location.zip_code,
      latitude: this.clinicProfile()?.location.latitude,
      longitude: this.clinicProfile()?.location.longitude,
      website_url: this.clinicProfile()?.website_url,
      // treatments: this.clinicProfile()?.treatments.map((item: any) => item.treatment_id),
      skin_types: this.clinicProfile()?.skin_types.map((item: any) => item.skin_type_id),
      surgeries: this.clinicProfile()?.surgeries_level.map((item: any) => item.surgery_id),
      // devices: this.clinicProfile()?.aestheticDevices.map((item: any) => item.aesthetic_device_id),
      skin_condition: this.clinicProfile()?.skin_Conditions.map((item: any) => item.skin_condition_id),
    });
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

  getClinicProfile() {
    this.service.get<any>('clinic/get-profile').subscribe((resp) => {
      this.service._clinicProfile.set(resp.data);
    })
  }
}
