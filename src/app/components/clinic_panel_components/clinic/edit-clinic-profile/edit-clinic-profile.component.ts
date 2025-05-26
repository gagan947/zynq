import { CommonModule, Location } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NoWhitespaceDirective } from '../../../../validators';
import { CommonService } from '../../../../services/common.service';
import { CertificationType, EquipmentType, EquipmentTypeResponse, SecurityLevel, SecurityLevelResponse, SkinType, SkinTypeResponse, Treatment, TreatmentResponse } from '../../../../models/clinic-onboarding';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { LoginUserData } from '../../../../models/login';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-edit-clinic-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NzSelectModule, NzUploadModule],
  templateUrl: './edit-clinic-profile.component.html',
  styleUrl: './edit-clinic-profile.component.css'
})
export class EditClinicProfileComponent {
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
  logoPreview: string | null | undefined = null;
  locations: any[] = [];
  selectedLocation: any = null;
  clinicProfile = this.service._clinicProfile;
  steps = [
    { id: 'Clinic', label: 'Clinic Details' },
    { id: 'Contact', label: 'Contact Details' },
    // { id: 'Operation', label: 'Operation Hours' },
    { id: 'Expertise', label: 'Expertise' }
  ];

  stepFields = [
    ['clinic_name', 'org_number', 'zynq_user_id', 'clinic_description', 'logo', 'ivo_registration_number', 'hsa_id'],
    ['email', 'mobile_number', 'street_address', 'city', 'state', 'zip_code', 'latitude', 'longitude', 'website_url'],
    // ['clinic_timing'],
    ['treatments', 'equipments', 'skin_types', 'severity_levels', 'fee_range', 'language']
  ];

  constructor(private fb: FormBuilder, private service: CommonService, private toster: NzMessageService, private router: Router, public location: Location) {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    effect(() => {
      if (this.clinicProfile()) {
        this.patchValue();
      }
    });
  }

  ngOnInit(): void {
    this.inItForm();
    this.getTreatments();
    this.getSkinTypes();
    this.getSecurityLevel();
    this.getEquipmentType();
  }

  inItForm() {
    this.Form = this.fb.group({
      clinic_name: ['', [Validators.required, NoWhitespaceDirective.validate]],
      org_number: [''],
      zynq_user_id: [''],
      ivo_registration_number: [''],
      hsa_id: [''],
      email: ['', [Validators.required, Validators.email]],
      mobile_number: ['+46', [Validators.required, NoWhitespaceDirective.validate]],
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
      formData.append('clinic_description', this.Form.value.clinic_description)
      if (this.LogoImage) {
        formData.append('logo', this.LogoImage!)
      }
      formData.append('ivo_registration_number', this.Form.value.ivo_registration_number)
      formData.append('hsa_id', this.Form.value.hsa_id)
      formData.append('zynq_user_id', this.userInfo.id);
    } else if (this.currentStep === 1) {
      formData.append('email', this.Form.value.email)
      formData.append('mobile_number', this.Form.value.mobile_number)
      formData.append('street_address', this.Form.value.street_address)
      formData.append('city', this.Form.value.city)
      formData.append('state', this.Form.value.state)
      formData.append('zip_code', this.Form.value.zip_code)
      formData.append('latitude', this.Form.value.latitude)
      formData.append('longitude', this.Form.value.longitude)
      formData.append('address', this.selectedLocation)
      formData.append('website_url', this.Form.value.website_url)
      formData.append('zynq_user_id', this.userInfo.id);
      // } else if (this.currentStep === 2) {
      //   formData.append('clinic_timing', JSON.stringify(this.Form.value.clinic_timing))
      //   formData.append('zynq_user_id', this.userInfo.id);
    } else if (this.currentStep === 2 && this.selectedTreatments.length > 0 && this.selectedSkinTypes.length > 0 && this.selectedSecurityLevel.length > 0) {
      formData.append('treatments', JSON.stringify(this.selectedTreatments.map(item => item.treatment_id)));
      formData.append('equipments', JSON.stringify(this.selectedEquipmentType.map(item => item.equipment_id)));
      formData.append('skin_types', JSON.stringify(this.selectedSkinTypes.map(item => item.skin_type_id)));
      formData.append('severity_levels', JSON.stringify(this.selectedSecurityLevel.map(item => item.severity_level_id)));
      formData.append('fee_range', JSON.stringify(this.Form.value.fee_range));
      formData.append('language', 'en');;
      formData.append('zynq_user_id', this.userInfo.id);
    } else {
      return
    }

    this.service.post(`clinic/onboard-clinic`, formData).subscribe((res: any) => {
      if (res.success) {
        this.getClinicProfile()
        this.toster.success('Profile updated successfully');
        if (this.currentStep === 2) {
          this.router.navigate(['/clinic/clinic-profile']);
        }
      } else {
        this.toster.error(res.message);
      }
    }, err => {
      this.toster.error(err);
    })
  }


  patchValue() {
    this.logoPreview = this.clinicProfile()?.clinic_logo
    this.selectedLocation = this.clinicProfile()?.address
    this.Form.patchValue({
      clinic_name: this.clinicProfile()?.clinic_name,
      clinic_description: this.clinicProfile()?.clinic_description,
      ivo_registration_number: this.clinicProfile()?.ivo_registration_number,
      hsa_id: this.clinicProfile()?.hsa_id,
      email: this.clinicProfile()?.email,
      mobile_number: this.clinicProfile()?.mobile_number,
      city: this.clinicProfile()?.location.city,
      state: this.clinicProfile()?.location.state,
      street_address: this.clinicProfile()?.location.street_address,
      zip_code: this.clinicProfile()?.location.zip_code,
      latitude: this.clinicProfile()?.location.latitude,
      longitude: this.clinicProfile()?.location.longitude,
      website_url: this.clinicProfile()?.website_url,
      // fee_range: JSON.parse(this.clinicProfile()?.fee_range || '{}'),
      // clinic_timing: this.patchClinicTiming(this.clinicProfile()?.operation_hours || [])
    });
    this.selectedTreatments = this.clinicProfile()?.treatments || []
    this.selectedEquipmentType = this.clinicProfile()?.equipments || []
    this.selectedSkinTypes = this.clinicProfile()?.skin_types || []
    this.selectedSecurityLevel = this.clinicProfile()?.severity_levels || []
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

  isSelected(item: any): boolean {
    const isSelected = this.selectedTreatments.some((selected: any) => selected.treatment_id === item.treatment_id);
    return isSelected;
  }
  getClinicProfile() {
    this.service.get<any>('clinic/get-profile').subscribe((resp) => {
      this.service._clinicProfile.set(resp.data);
    })
  }
}
