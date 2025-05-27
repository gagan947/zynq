import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NoWhitespaceDirective, timeRangeValidator } from '../../../../validators';
import { CommonService } from '../../../../services/common.service';
import { CertificationType, EquipmentType, EquipmentTypeResponse, SecurityLevel, SecurityLevelResponse, SkinType, SkinTypeResponse, Treatment, TreatmentResponse } from '../../../../models/clinic-onboarding';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { LoginUserData } from '../../../../models/login';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ClinicProfile, ClinicProfileResponse } from '../../../../models/clinic-profile';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-clinic-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NzSelectModule, NzUploadModule],
  templateUrl: './clinic-setup.component.html',
  styleUrl: './clinic-setup.component.css'
})
export class ClinicSetupComponent {
  Form!: FormGroup
  treatments: Treatment[] = []
  selectedTreatments: Treatment[] = []
  filteredTreatments: Treatment[] = []
  equipments: EquipmentType[] = []
  selectedEquipmentType: EquipmentType[] = []
  filteredEquipmentType: EquipmentType[] = []
  skintypes: SkinType[] = []
  selectedSkinTypes: SkinType[] = []
  securityLevel: SecurityLevel[] = []
  selectedSecurityLevel: SecurityLevel[] = []
  certificaTeypes: CertificationType[] = []
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
    ['treatments', 'equipments', 'skin_types', 'severity_levels', 'fee_range', 'language']
  ];

  constructor(private fb: FormBuilder, private service: CommonService, private toster: NzMessageService, private router: Router, private auth: AuthService) {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  }

  ngOnInit(): void {
    this.inItForm();
    this.getTreatments();
    this.getSkinTypes();
    this.getSecurityLevel();
    this.getEquipmentType();
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
      mobile_number: ['', [Validators.required, NoWhitespaceDirective.validate]],
      street_address: ['', [Validators.required, NoWhitespaceDirective.validate]],
      city: ['', [Validators.required, NoWhitespaceDirective.validate]],
      state: ['', [Validators.required, NoWhitespaceDirective.validate]],
      zip_code: ['', [Validators.required, NoWhitespaceDirective.validate]],
      latitude: [''],
      longitude: [''],

      treatments: this.fb.array([
        this.fb.control('')
      ]),

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

      equipments: this.fb.array([
        this.fb.control('')
      ]),
      skin_types: this.fb.array([
        this.fb.control('')
      ]),
      severity_levels: this.fb.array([
        this.fb.control('')
      ]),

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

  addTreatment(treatment: Treatment) {
    const index = this.selectedTreatments.findIndex((item) => item.treatment_id === treatment.treatment_id);
    if (index === -1) {
      this.selectedTreatments.push(treatment);
    } else {
      this.selectedTreatments.splice(index, 1);
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
  }

  getEquipmentType() {
    this.service.get<EquipmentTypeResponse>(`clinic/get-equipments`).subscribe((res) => {
      this.equipments = res.data
    });
  }

  addEquipmentType(equipment: EquipmentType) {
    const index = this.selectedEquipmentType.findIndex((item) => item.equipment_id === equipment.equipment_id);
    if (index === -1) {
      this.selectedEquipmentType.push(equipment);
    } else {
      this.selectedEquipmentType.splice(index, 1);
    }
  }
  removeEquipmentType(index: number) {
    this.selectedEquipmentType.splice(index, 1);
  }

  searchEquipmentType(event: any) {
    this.filteredEquipmentType = this.equipments.filter((item) => item.name.toLowerCase().includes(event.target.value.toLowerCase()));
    if (this.filteredEquipmentType.length === 0 || event.target.value === '') {
      this.filteredEquipmentType = [];
    }
  }

  getSkinTypes() {
    this.service.get<SkinTypeResponse>(`clinic/get-skin-types`).subscribe((res) => {
      this.skintypes = res.data
    });
  }

  addSkinTypes(skinType: SkinType) {
    const index = this.selectedSkinTypes.findIndex((item) => item.skin_type_id === skinType.skin_type_id);
    if (index === -1) {
      this.selectedSkinTypes.push(skinType);
    } else {
      this.selectedSkinTypes.splice(index, 1);
    }
  }
  getSecurityLevel() {
    this.service.get<SecurityLevelResponse>(`clinic/get-severity-levels`).subscribe((res) => {
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
  onFileChange(event: any, index: number) {

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
    let formData = new FormData()
    if (this.currentStep === 0) {
      formData.append('clinic_name', this.Form.value.clinic_name)
      // formData.append('org_number', this.Form.value.org_number)
      formData.append('zynq_user_id', this.userInfo.id)
      formData.append('clinic_description', this.Form.value.clinic_description)
      if (this.LogoImage) {
        formData.append('logo', this.LogoImage!)
      }
      formData.append('ivo_registration_number', this.Form.value.ivo_registration_number)
      formData.append('hsa_id', this.Form.value.hsa_id)
      formData.append('form_stage', '1')
    } else if (this.currentStep === 1) {
      // formData.append('email', this.Form.value.email)
      formData.append('mobile_number', this.Form.value.mobile_number)
      formData.append('street_address', this.Form.value.street_address)
      formData.append('city', this.Form.value.city)
      formData.append('state', this.Form.value.state)
      formData.append('zip_code', this.Form.value.zip_code)
      formData.append('latitude', this.Form.value.latitude)
      formData.append('longitude', this.Form.value.longitude)
      formData.append('address', this.selectedLocation)
      formData.append('zynq_user_id', this.userInfo.id)
      formData.append('website_url', this.Form.value.website_url)
      formData.append('form_stage', '2')
      // } else if (this.currentStep === 2) {
      //   formData.append('zynq_user_id', this.userInfo.id)
      //   formData.append('clinic_timing', JSON.stringify(this.Form.value.clinic_timing))
      //   formData.append('form_stage', this.currentStep.toString())
    } else if (this.currentStep === 2 && this.selectedTreatments.length > 0 && this.selectedSkinTypes.length > 0 && this.selectedSecurityLevel.length > 0) {
      formData.append('treatments', JSON.stringify(this.selectedTreatments.map(item => item.treatment_id)));
      // formData.append('equipments', JSON.stringify(this.selectedEquipmentType.map(item => item.equipment_id)));
      formData.append('skin_types', JSON.stringify(this.selectedSkinTypes.map(item => item.skin_type_id)));
      formData.append('severity_levels', JSON.stringify(this.selectedSecurityLevel.map(item => item.severity_level_id)));
      // formData.append('fee_range', JSON.stringify(this.Form.value.fee_range));
      formData.append('language', 'en');
      formData.append('zynq_user_id', this.userInfo.id);
      formData.append('form_stage', "3");
    } else {
      return
    }

    this.service.post(`clinic/onboard-clinic`, formData).subscribe((res: any) => {
      if (res.success) {
        this.currentStep++;
      } else {
        this.toster.error(res.message);
      }
    }, err => {
      this.toster.error(err);
    })
  }

  inviteDr() {

    if (this.selectedDrEmail.length == 0) {
      this.toster.error('Please add at least one email');
      return;
    }

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
              }
              this.currentStep++;
            },
            error: (err) => {
              this.toster.error(err);
            }
          });
        } else {
          this.toster.error(resp.message);
        }
      },
      error: (error) => {
        this.toster.error(error);
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
          // fee_range: JSON.parse(this.clinicPofile.fee_range),
          // clinic_timing: this.patchClinicTiming(this.clinicPofile.operation_hours)
        });
        this.selectedTreatments = this.clinicPofile.treatments
        this.selectedEquipmentType = this.clinicPofile.equipments
        this.selectedSkinTypes = this.clinicPofile.skin_types
        this.selectedSecurityLevel = this.clinicPofile.severity_levels
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

  issecurityLevelSelected(severity_level_id: string): boolean {
    return this.selectedSecurityLevel.some(item => item.severity_level_id === severity_level_id);
  }

  isskintypeselected(skin_type_id: string): boolean {
    return this.selectedSkinTypes.some(item => item.skin_type_id === skin_type_id);
  }
}
