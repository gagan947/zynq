import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, viewChild, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
declare var bootstrap: any;
@Component({
  selector: 'app-solo-profile-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NzSelectModule, NzUploadModule, NgxIntlTelInputModule, ImageCropperComponent, TranslateModule],
  templateUrl: './solo-profile-setup.component.html',
  styleUrl: './solo-profile-setup.component.css'
})
export class SoloProfileSetupComponent {
  private destroy$ = new Subject<void>();
  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>
  @ViewChild('closeBtn2') closeBtn2!: ElementRef<HTMLButtonElement>
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  @Input() isEdit: boolean = false;
  treatmentForm!: FormGroup
  besicInfoForm!: FormGroup
  contactForm!: FormGroup
  ExpertiseForm!: FormGroup
  availabilityForm!: FormGroup;
  treatments: Treatment[] = []
  surgeries: any[] = []
  devices: any[] = []
  skintypes: SkinType[] = []
  certificaTeypes: any
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  sessionDuration: string[] = ['15', '30', '45', '60', '75', '90', '105', '120']
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
    { id: 'Personal', label: 'PersonalDetails' },
    { id: 'Contact', label: 'ContactDetails' },
    { id: 'Education', label: 'EducationExperience' },
    { id: 'Expertise', label: 'Expertise' },
    { id: 'Operation', label: 'OperationHours' },
  ];
  selectedTreatments: any[] = [];
  productImages: File[] = [];
  previewProductImages: any[] = [];
  loading: boolean = false
  soloDrData: any;
  SearchCountryField = SearchCountryField
  CountryISO = CountryISO;
  selectedCountry = CountryISO.Sweden
  preferredCountries: CountryISO[] = [CountryISO.Sweden]
  dropdownOpen: boolean = false;
  lang: string = 'en';
  constructor(private fb: FormBuilder, private service: CommonService, private toster: NzMessageService, private router: Router, private auth: AuthService, private translate: TranslateService) {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    this.translate.use(localStorage.getItem('lang') || 'en');
    this.lang = localStorage.getItem('lang') || 'en';
  }

  ngOnInit(): void {
    this.inItForm();
    this.getTreatments();
    this.getSkinTypes();
    this.getSurgeries();
    // this.getDevices();
    this.getCertificaTeypes();
    if (this.isEdit) {
      this.getProfile(1);
    } else {
      this.service.get('solo_doctor/get_onboarding_status').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        this.getProfile(res.data + 1)
      })
    }
  }

  inItForm() {
    this.besicInfoForm = this.fb.group({
      name: ['', [Validators.required, NoWhitespaceDirective.validate]],
      lastName: [''],
      clinic_name: ['', [Validators.required, NoWhitespaceDirective.validate]],
      org_number: [''],
      email: ['', [Validators.required, Validators.email]],
      // ivo_registration_number: [''],
      // hsa_id: [''],
      clinic_description: ['', [Validators.required, NoWhitespaceDirective.validate, Validators.maxLength(500)]],
      language: ['en'],
      logo: [null],
      profile_image: [null],
    });

    this.contactForm = this.fb.group({
      mobile_number: ['', [Validators.required]],
      street_address: ['', [Validators.required, NoWhitespaceDirective.validate]],
      city: ['', [Validators.required, NoWhitespaceDirective.validate]],
      zip_code: ['', [Validators.required, NoWhitespaceDirective.validate]],
      website_url: [null],
      latitude: [''],
      longitude: [''],
    })

    this.ExpertiseForm = this.fb.group({
      treatments: this.fb.array([]),
      skin_types: [[]],
      surgeries: [[]],
      devices: [[]],
    })

    this.availabilityForm = this.fb.group({
      sameForAllDays: [true],
      fee_per_session: ['', [Validators.required, this.allowedPriceValidator.bind(this)]],
      slot_time: ['', [Validators.required]],
      clinic_timing: this.fb.array(this.daysOfWeek.map(() => this.createDay()))
    });
  }

  get clinic_timing(): FormArray {
    return this.availabilityForm.get('clinic_timing') as FormArray;
  }

  get treatmentsArray(): FormArray {
    return this.ExpertiseForm.get('treatments') as FormArray;
  }

  subTreatments(i: number): FormArray {
    return this.treatmentsArray.at(i).get('sub_treatments') as FormArray;
  }

  initTreatments(data: any[]) {
    this.treatmentsArray.clear();
    data.forEach((t: any) => {
      this.treatmentsArray.push(this.createTreatmentForm(t));
    });
  }

  createTreatmentForm(t: any) {
    return this.fb.group({
      id: t.treatment_id,
      name: t.name,
      selected: false,
      price: '',
      sub_treatments: this.fb.array(
        t.sub_treatments?.length > 0 ? t.sub_treatments.map((sub: any) =>
          this.fb.group({
            id: sub.sub_treatment_id,
            name: sub.name,
            selected: false,
            price: '',
          })
        ) : []
      ),
    });
  }

  allowedPriceValidator(control: AbstractControl) {
    const value = Number(control.value);

    if (value == 0) return null;
    if (value >= 3) return null;
    return { invalidPrice: true };
  }

  onTreatmentSelectChange(i: number) {
    const parent = this.treatmentsArray.at(i);
    const parentPrice = parent.get('price') as FormControl;
    const children = this.subTreatments(i)?.controls;

    if (parent.get('selected')?.value) {
      parent.get('price')?.setValidators([Validators.required, this.allowedPriceValidator.bind(this)]);
      parent.get('price')?.updateValueAndValidity();
      children?.forEach((sub: AbstractControl) => {
        sub.get('selected')?.setValue(true, { emitEvent: false });
        sub.get('price')?.setValidators([Validators.required, this.allowedPriceValidator.bind(this)]);
        sub.get('price')?.updateValueAndValidity();
      });

      if (children?.length > 0) {
        parentPrice.disable();
        this.updateParentTotal(i);
      }
    } else {
      parent.get('selected')?.setValue(false, { emitEvent: false });
      parent.get('price')?.clearValidators();
      parent.get('price')?.setValue('');
      parent.get('price')?.updateValueAndValidity();
      children?.forEach((sub: AbstractControl) => {
        sub.get('selected')?.setValue(false, { emitEvent: false });
        sub.get('price')?.clearValidators();
        sub.get('price')?.setValue('');
        sub.get('price')?.updateValueAndValidity();
      });

      parentPrice.enable();
      parentPrice.setValue('');
    }

    // Update selectedTreatments array to REMOVE unselected treatments
    if (!this.selectedTreatments) {
      this.selectedTreatments = [];
    }

    const updatedSelectedTreatments = this.treatmentsArray.controls
      .filter(t => t.get('selected')?.value)
      .map(t => ({
        id: t.get('id')?.value,
        name: t.get('name')?.value ?? '',
        price: t.get('price')?.value ?? 0,
        sub_treatments: t.get('sub_treatments')?.value
          .filter((sub: any) => sub.selected)
          .map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            price: sub.price,
          })) ?? [],
      }));

    this.selectedTreatments = updatedSelectedTreatments;
    this.toggleRecommendedCollapse(this.recommendedCollapseStates, i);
    this.searchInput.nativeElement.focus();
    this.getDevices();
  }

  onTreatmentSearch(event: any) {
    const searchValue = event.target.value;
    if (searchValue.length > 0) {
      const filtered = this.treatmentsArray.controls.filter((t: any) =>
        t.get('name')?.value.toLowerCase().includes(searchValue.toLowerCase()) ||
        t.get('selected')?.value ||
        t.get('sub_treatments')?.value.some((sub: any) => sub.name.toLowerCase().includes(searchValue.toLowerCase()))
      );
      filtered.sort((a, b) => {
        const aSelected = a.get('selected')?.value ? 1 : 0;
        const bSelected = b.get('selected')?.value ? 1 : 0;
        return aSelected - bSelected;
      });
      this.treatmentsArray.controls = filtered;
    } else {
      const previousSelections = this.selectedTreatments;

      const selectedTreatmentIds = new Set(previousSelections.map((t: any) => t.id));

      while (this.treatmentsArray.length !== 0) {
        this.treatmentsArray.removeAt(0);
      }
      previousSelections.forEach((t: any, index: number) => {
        this.treatmentsArray.push(
          this.fb.group({
            id: t.id,
            name: t.name,
            selected: true,
            price: [t.price, [Validators.required, this.allowedPriceValidator.bind(this)]],
            sub_treatments: this.fb.array(
              (t.sub_treatments || []).map((sub: any) =>
                this.fb.group({
                  id: sub.id,
                  name: sub.name,
                  selected: true,
                  price: [sub.price, [Validators.required, this.allowedPriceValidator.bind(this)]],
                })
              )
            ),
          })
        );
        if (this.subTreatments(index).controls?.length > 0) {
          this.treatmentsArray.at(index).get('price')?.disable();
          this.updateParentTotal(index);
        }
      });

      (this.treatments || []).forEach((item: any) => {
        if (!selectedTreatmentIds.has(item.treatment_id)) {
          this.treatmentsArray.push(
            this.fb.group({
              id: item.treatment_id,
              name: item.name,
              selected: false,
              price: '',
              sub_treatments: this.fb.array(
                (item.sub_treatments || []).map((sub: any) =>
                  this.fb.group({
                    id: sub.sub_treatment_id,
                    name: sub.name,
                    selected: false,
                    price: '',
                  })
                )
              ),
            })
          );
        }
      });
    }
  }


  onChildSelectChange(i: number, j: number) {
    const child = this.subTreatments(i).at(j);
    const parent = this.treatmentsArray.at(i);
    const parentPrice = parent.get('price') as FormControl;

    if (child.get('selected')?.value) {
      child.get('price')?.setValidators([Validators.required, this.allowedPriceValidator.bind(this)]);
    } else {
      child.get('price')?.clearValidators();
      child.get('price')?.setValue('');
    }
    child.get('price')?.updateValueAndValidity();

    const children = this.subTreatments(i).controls;
    const anySelected = children.some(c => c.get('selected')?.value);

    if (anySelected) {
      parent.get('selected')?.setValue(true, { emitEvent: false });
      parentPrice.disable();
      this.updateParentTotal(i);
    } else {
      parent.get('selected')?.setValue(false, { emitEvent: false });
      parentPrice.enable();
      parentPrice.setValue(null);
    }
    const newSelected = this.treatmentsArray.controls
      .filter(t => t.get('selected')?.value)
      .map(t => ({
        id: t.get('id')?.value,
        name: t.get('name')?.value ?? '',
        price: t.get('price')?.value ?? 0,
        sub_treatments: t.get('sub_treatments')?.value
          .filter((sub: any) => sub.selected)
          .map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            price: sub.price,
          })) ?? [],
      }));

    if (!this.selectedTreatments) {
      this.selectedTreatments = [];
    }
    const newSelectedIds = new Set(newSelected.map(t => t.id));
    const merged = [
      ...this.selectedTreatments.filter(old => !newSelectedIds.has(old.id)),
      ...newSelected
    ];
    this.selectedTreatments = merged;
    this.searchInput.nativeElement.focus();
    this.getDevices();
  }

  removeTreatment(index: number, id: string) {
    // Find the treatment in the array by id instead of index and unselect
    const treatmentIndex = this.treatmentsArray.controls.findIndex(ctrl => ctrl.get('id')?.value === id);
    if (treatmentIndex !== -1) {
      const treatment = this.treatmentsArray.at(treatmentIndex);
      treatment.get('selected')?.setValue(false, { emitEvent: false });
      treatment.get('price')?.clearValidators();
      treatment.get('price')?.setValue(null);
      treatment.get('price')?.updateValueAndValidity();
      this.subTreatments(treatmentIndex).controls.forEach((sub: AbstractControl) => {
        sub.get('selected')?.setValue(false, { emitEvent: false });
        sub.get('price')?.clearValidators();
        sub.get('price')?.setValue(null);
        sub.get('price')?.updateValueAndValidity();
      });
    }
    this.selectedTreatments = this.selectedTreatments.filter(t => t.id !== id);
    this.getDevices();
  }

  updateParentTotal(i: number) {
    const parent = this.treatmentsArray.at(i);
    const parentPrice = parent.get('price') as FormControl;

    const total = this.subTreatments(i).controls
      .filter(sub => sub.get('selected')?.value)
      .reduce((sum, sub) => sum + Number(sub.get('price')?.value || 0), 0);

    parentPrice.setValue(total);
    // this.selectedTreatments[i].price = total;
    console.log(this.selectedTreatments[i]);
  }


  getControl(group: any, controlName: string): FormControl {
    return group.get(controlName) as FormControl;
  }

  getChildControl(parentIndex: number, childIndex: number, controlName: string): FormControl {
    return this.subTreatments(parentIndex).at(childIndex).get(controlName) as FormControl;
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
    });
  }

  get days(): FormArray {
    return this.availabilityForm.get('days') as FormArray;
  }

  getSessions(dayIndex: number): FormArray {
    return this.clinic_timing.at(dayIndex).get('sessions') as FormArray;
  }


  transformFormValue(formValue: any[]) {
    const clinicTiming: any = [];
    const sameForAllDays = this.availabilityForm.get('sameForAllDays')?.value;

    let referenceSession: any = null;

    if (sameForAllDays) {
      const refDay = formValue.find(
        d => d.sessions && d.sessions.length
      );

      if (refDay) {
        referenceSession = refDay.sessions[0];
      }
    }

    const toUTCFormatted = (timeStr: string): string => {
      const [hours, minutes] = timeStr.split(':').map(Number);

      const localDate = new Date();
      localDate.setHours(hours, minutes, 0, 0);

      const hour = String(localDate.getUTCHours()).padStart(2, '0');
      const minute = String(localDate.getUTCMinutes()).padStart(2, '0');

      return `${hour}:${minute}`;
    };

    formValue.forEach((day: any, index: number) => {
      const dayName = this.daysOfWeek[index]
      if (sameForAllDays && referenceSession) {
        clinicTiming.push({
          day_of_week: dayName,
          start_time: toUTCFormatted(referenceSession.start_time),
          end_time: toUTCFormatted(referenceSession.end_time),
          closed: 0
        });
      }

      if (!day.sessions || day.sessions.length === 0) {
        clinicTiming.push({
          day_of_week: dayName,
          closed: 1
        });
      }

      const session = day.sessions[0];
      if (!sameForAllDays) {
        clinicTiming.push({
          day_of_week: dayName,
          start_time: toUTCFormatted(session.start_time),
          end_time: toUTCFormatted(session.end_time),
          closed: !day.active ? 1 : 0
        });
      }
    });

    return clinicTiming
  }


  getCertificaTeypes() {
    this.service.get<any>(`doctor/get_doctor_certificates_path`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.certificaTeypes = res.data
    });
  };

  getTreatments() {
    this.service.get<TreatmentResponse>(`clinic/get-treatments?language=${this.lang}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.treatments = res.data
      this.initTreatments(this.treatments);
    });
  }


  getSkinTypes() {
    this.service.get<SkinTypeResponse>(`clinic/get-skin-types`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.skintypes = res.data
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
    const treatmentIds = this.selectedTreatments.map(t => t.id);
    this.service.get<any>(`clinic/get-devices?treatment_ids=${treatmentIds.join(',')}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.devices = res.data
      const availableDeviceIds = this.devices.map((device: any) => device.id);
      const selectedDeviceIds = this.ExpertiseForm.value.devices || [];
      const validSelectedDevices = selectedDeviceIds?.filter((id: any) => availableDeviceIds.includes(id));
      this.ExpertiseForm.get('devices')?.setValue(validSelectedDevices);
      this.ExpertiseForm.get('devices')?.updateValueAndValidity();
    });
  }

  imageChangedEvent2: any = '';
  croppedImage2: any = '';
  croppedImageBlob2: any = '';
  onLogoImage(event: any): void {
    this.imageChangedEvent = event
    this.openModal2()
  }

  imageCropped2(event: ImageCroppedEvent) {
    this.croppedImageBlob2 = event.blob
    this.croppedImage2 = event.objectUrl
  }

  onDone2() {
    this.logoPreview = this.croppedImage2
    this.LogoImage = new File([this.croppedImageBlob2], 'logo.png', {
      type: 'image/png'
    })
    this.closeBtn2.nativeElement.click()
  }

  openModal2() {
    const modalElement = document.getElementById('ct_feedback_detail_modal_2');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  removeImage() {
    this.LogoImage = null;
    this.logoPreview = null;
  }

  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageBlob: any = '';
  onProfileImageChange(event: any): void {
    this.imageChangedEvent = event
    this.openModal()
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBlob = event.blob
    this.croppedImage = event.objectUrl
  }

  onDone() {
    this.profilePreview = this.croppedImage
    this.profileImage = new File([this.croppedImageBlob], 'profile.png', {
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

  removeProfileImage() {
    this.profileImage = null;
    this.profilePreview = null;
  }



  onSubmitBasicInfo() {
    if (this.besicInfoForm.invalid) {
      this.besicInfoForm.markAllAsTouched();
      return;
    }

    this.loading = true
    let formData = new FormData();
    formData.append('name', this.besicInfoForm.get('name')?.value);
    formData.append('last_name', this.besicInfoForm.get('lastName')?.value);
    formData.append('clinic_name', this.besicInfoForm.get('clinic_name')?.value || '');
    formData.append('clinic_description', this.besicInfoForm.get('clinic_description')?.value || '');
    formData.append('language', 'en');
    formData.append('org_number', this.besicInfoForm.get('org_number')?.value || '');
    // formData.append('hsa_id', this.besicInfoForm.get('hsa_id')?.value || '');
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
            this.toster.success(this.translate.instant('profileUpdateSuccess'));
            this.service.get<any>(`solo_doctor/getDoctorProfileByStatus/1`).pipe(
              takeUntil(this.destroy$)
            ).subscribe(res => {
              if (res.success) {
                this.service._soloDoctorProfile.set(res.data);
              }
            })
          } else {
            this.currentStep++;
            this.getProfile(this.currentStep + 1)
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
            this.toster.success(this.translate.instant('profileUpdateSuccess'));
          } else {
            this.currentStep++;
            this.getProfile(this.currentStep + 1)
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
            this.toster.success(this.translate.instant('profileUpdateSuccess'));
          } else {
            this.currentStep++;
            this.getProfile(this.currentStep + 1)
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

    if (this.treatmentsArray.controls.some((t: any) => t.get('selected')?.value && (t.get('price')?.invalid || t.get('sub_treatments')?.controls.some((sub: any) => sub.get('selected')?.value && sub.get('price')?.invalid)))) {
      this.toster.warning('Please enter price for the treatment and sub treatments');
      return;
    }

    if (this.ExpertiseForm.invalid) {
      this.ExpertiseForm.markAllAsTouched();
      return
    }
    this.loading = true

    const selectedTreatments = this.treatmentsArray.controls.filter(t => t.get('selected')?.value).map((t: any) => ({
      treatment_id: t.get('id')?.value,
      price: t.get('price')?.value,
      sub_treatments: t.get('sub_treatments')?.controls.filter((sub: any) => sub.get('selected')?.value).map((sub: any) => ({
        sub_treatment_id: sub.get('id')?.value,
        sub_treatment_price: sub.get('price')?.value,
      })) ?? [],
    }));

    let formData: any = {
      treatments: selectedTreatments,
      skin_type_ids: this.ExpertiseForm.value.skin_types.join(','),
      surgery_ids: this.ExpertiseForm.value.surgeries.join(','),
      device_ids: this.ExpertiseForm.value.devices.join(','),
    };

    this.service.post<any, any>('solo_doctor/add_expertise', formData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          if (this.isEdit) {
            this.toster.success(this.translate.instant('profileUpdateSuccess'));
          } else {
            this.currentStep++;
            this.getProfile(this.currentStep + 1)
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

    if (this.availabilityForm.invalid) {
      this.availabilityForm.markAllAsTouched();
      return;
    }

    const transformed = this.transformFormValue(this.availabilityForm.value.clinic_timing);

    const transformedFormData = {
      availability: transformed,
      fee_per_session: this.availabilityForm.value.fee_per_session,
      slot_time: this.availabilityForm.value.slot_time,
      same_for_all: this.availabilityForm.value.sameForAllDays ? 0 : 1,
    };

    this.loading = true
    let formData = transformedFormData;

    if (this.isEdit) {
      this.service.post<any, any>('doctor/createDoctorAvailability', formData).pipe(
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
                lastName: data.last_name,
                clinic_name: data.clinic.clinic_name,
                clinic_description: data.clinic.clinic_description,
                email: data.email,
                // ivo_registration_number: data.clinic.ivo_registration_number,
                org_number: data.clinic.org_number
              })
              this.contactForm.patchValue({
                mobile_number: data.clinic.mobile_number,
                city: data.clinic.location.city,
                state: data.clinic.location.state,
                street_address: data.clinic.location.street_address,
                zip_code: data.clinic.location.zip_code,
                latitude: data.clinic.location.latitude,
                longitude: data.clinic.location.longitude,
                website_url: data.clinic.website_url !== 'null' ? data.clinic.website_url : ''
              })
              this.selectedLocation = data?.clinic.address
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
                website_url: data.clinic.website_url !== 'null' ? data.clinic.website_url : ''
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
              this.selectedTreatments = data.clinic?.treatments.map((item: any) => ({
                id: item.treatment_id,
                name: item.treatment_name_en,
                price: item.price,
                selected: true,
                sub_treatments: item.sub_treatments.map((sub: any) => ({
                  id: sub.sub_treatment_id,
                  name: sub.sub_treatment_name_en,
                  price: sub.sub_treatment_price,
                  selected: true,
                })),
              }))

              this.getDevices();

              // Patch data as before
              data.clinic?.treatments.forEach((item: any) => {
                this.treatmentsArray.controls.forEach((t: any, index: number) => {
                  if (t.get('id')?.value === item.treatment_id) {
                    t.get('selected')?.setValue(true);
                    t.get('price')?.setValue(item.price);
                    t.get('sub_treatments')?.controls.forEach((sub: any) => {
                      if (item.sub_treatments.find((s: any) => s.sub_treatment_id === sub.get('id')?.value)) {
                        sub.get('selected')?.setValue(true);
                        sub.get('price')?.setValue(item.sub_treatments.find((s: any) => s.sub_treatment_id === sub.get('id')?.value)?.sub_treatment_price);
                      } else {
                        sub.get('selected')?.setValue(false);
                        sub.get('price')?.setValue('');
                      }
                    });
                  }
                });
              });

              // Now move selected treatments to top
              if (this.treatmentsArray && this.treatmentsArray.controls) {
                const controls = this.treatmentsArray.controls;

                // Sorted: selected first, then unselected (stable)
                controls.sort((a: any, b: any) => {
                  const aSelected = a.get('selected')?.value ? 1 : 0;
                  const bSelected = b.get('selected')?.value ? 1 : 0;
                  return bSelected - aSelected;
                });
              }
              this.ExpertiseForm.patchValue({
                skin_types: data.clinic?.skin_types.map((item: any) => item.skin_type_id),
                surgeries: data.clinic?.surgeries_level.map((item: any) => item.surgery_id),
                devices: data.clinic?.clinicDevices.map((item: any) => item.device_id),
              })
              break;

            case 5:
              this.availabilityForm.patchValue({
                fee_per_session: data.clinic.doctorSessions[0].fee_per_session || 0,
                slot_time: data.clinic.doctorSessions[0].slot_time.toString(),
                sameForAllDays: data.clinic.doctorSessions[0].same_for_all == 0 ? true : false,
              });
              this.patchOperationHours(data.clinic.operation_hours);
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

  patchOperationHours(operation_hours: any[] | undefined) {
    const clinicTimingArray = this.availabilityForm.get('clinic_timing') as FormArray;

    operation_hours?.forEach((dayData) => {
      const dayIndex = this.daysOfWeek.findIndex(
        d => d.toLowerCase() === dayData.day_of_week.toLowerCase()
      );
      if (dayIndex === -1) return;
      const dayGroup = clinicTimingArray.at(dayIndex) as FormGroup;
      dayGroup.patchValue({
        active: dayData.is_closed == 0
      });
      const sessionsArray = dayGroup.get('sessions') as FormArray;
      sessionsArray.clear()
      sessionsArray.push(
        this.fb.group({
          start_time: this.convertTime(dayData.open_time),
          end_time: this.convertTime(dayData.close_time)
        })
      );
    });
  }

  convertTime(time: any): any {
    const [hours, minutes, seconds] = time.split(':').map(Number);

    const utcDate = new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));

    const localHours = String(utcDate.getHours()).padStart(2, '0');
    const localMinutes = String(utcDate.getMinutes()).padStart(2, '0');

    return `${localHours}:${localMinutes}`;
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
  recommendedCollapseStates: boolean[] = [];
  toggleRecommendedCollapse(recommendedCollapseStates: boolean[], index: number) {
    recommendedCollapseStates[index] = !recommendedCollapseStates[index];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
