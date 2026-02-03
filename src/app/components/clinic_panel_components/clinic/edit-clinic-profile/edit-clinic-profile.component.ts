import { CommonModule, Location } from '@angular/common';
import { Component, effect, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Subject, takeUntil } from 'rxjs';
declare var bootstrap: any;
@Component({
  selector: 'app-edit-clinic-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NzSelectModule, NzUploadModule, NgxIntlTelInputModule, ImageCropperComponent, TranslateModule],
  templateUrl: './edit-clinic-profile.component.html',
  styleUrl: './edit-clinic-profile.component.css'
})
export class EditClinicProfileComponent {
  private destroy$ = new Subject<void>();
  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  Form!: FormGroup
  treatments: Treatment[] = []
  surgeries: any[] = []
  devices: any[] = []
  skintypes: SkinType[] = []
  certificaTeypes: CertificationType[] = []
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
    { id: 'Expertise', label: 'Expertise' },
    { id: 'Operation', label: 'OperationHours' },
  ];

  stepFields = [
    ['clinic_name', 'org_number', 'zynq_user_id', 'clinic_description', 'logo', 'ivo_registration_number', 'hsa_id'],
    ['email', 'mobile_number', 'street_address', 'city', 'zip_code', 'latitude', 'longitude', 'website_url'],
    ['skin_types', 'surgeries', 'treatments'],
    ['clinic_timing', 'slot_time'],
  ];
  selectedTreatments: any[] = [];
  loading: boolean = false
  lang: string = 'en'
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  sessionDuration: string[] = ['15', '30', '45', '60', '75', '90', '105', '120']
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
    this.getTreatments();
    this.inItForm();
    this.getSkinTypes();
    this.getSurgeries();
    // this.getDevices();
  }

  inItForm() {
    this.Form = this.fb.group({
      clinic_name: ['', [Validators.required, NoWhitespaceDirective.validate]],
      org_number: [''],
      zynq_user_id: [''],
      email: ['', [Validators.required, Validators.email]],
      mobile_number: ['', [Validators.required]],
      street_address: ['', [Validators.required, NoWhitespaceDirective.validate]],
      city: ['', [Validators.required, NoWhitespaceDirective.validate]],
      zip_code: ['', [Validators.required, NoWhitespaceDirective.validate]],
      latitude: [''],
      longitude: [''],
      treatments: this.fb.array([]),
      skin_types: [[]],
      surgeries: [[]],
      devices: [[]],
      website_url: [''],
      clinic_description: ['', [Validators.required, NoWhitespaceDirective.validate, Validators.maxLength(500)]],
      language: ['en'],
      logo: [null],
      sameForAllDays: [true],
      clinic_timing: this.fb.array(this.daysOfWeek.map(() => this.createDay())),
      slot_time: ['', [Validators.required]],
    });
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

  getSessions(dayIndex: number): FormArray {
    return this.clinic_timing.at(dayIndex).get('sessions') as FormArray;
  }

  get clinic_timing(): FormArray {
    return this.Form.get('clinic_timing') as FormArray;
  }

  get treatmentsArray(): FormArray {
    return this.Form.get('treatments') as FormArray;
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
    console.log(this.selectedTreatments[i]);
  }


  getControl(group: any, controlName: string): FormControl {
    return group.get(controlName) as FormControl;
  }

  getChildControl(parentIndex: number, childIndex: number, controlName: string): FormControl {
    return this.subTreatments(parentIndex).at(childIndex).get(controlName) as FormControl;
  }

  getTreatments() {
    this.service.get<TreatmentResponse>(`clinic/get-treatments?language=${this.lang}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.treatments = res.data
      this.initTreatments(this.treatments);
    });
  }

  getSkinTypes() {
    this.service.get<SkinTypeResponse>(`clinic/get-skin-types`).subscribe((res) => {
      this.skintypes = res.data
    });
  }

  getSurgeries() {
    this.service.get<any>(`clinic/get-surgery`).subscribe((res) => {
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
      const selectedDeviceIds = this.Form.value.devices || [];
      const validSelectedDevices = selectedDeviceIds?.filter((id: any) => availableDeviceIds.includes(id));
      this.Form.get('devices')?.setValue(validSelectedDevices);
      this.Form.get('devices')?.updateValueAndValidity();
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

  transformFormValue(formValue: any[]) {
    const clinicTiming: any = {};
    const sameForAllDays = this.Form.get('sameForAllDays')?.value;

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

      const year = localDate.getUTCFullYear();
      const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(localDate.getUTCDate()).padStart(2, '0');
      const hour = String(localDate.getUTCHours()).padStart(2, '0');
      const minute = String(localDate.getUTCMinutes()).padStart(2, '0');
      const second = String(localDate.getUTCSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    };

    formValue.forEach((day: any, index: number) => {
      const dayName = this.daysOfWeek[index].toLocaleLowerCase();

      if (sameForAllDays && referenceSession) {
        clinicTiming[dayName] = {
          open: toUTCFormatted(referenceSession.start_time),
          close: toUTCFormatted(referenceSession.end_time),
          is_closed: false
        };
        return;
      }

      if (!day.sessions || day.sessions.length === 0) {
        clinicTiming[dayName] = {
          is_closed: true
        };
        return;
      }

      const session = day.sessions[0];
      clinicTiming[dayName] = {
        open: toUTCFormatted(session.start_time),
        close: toUTCFormatted(session.end_time),
        is_closed: !day.active
      };
    });

    return clinicTiming
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
    } else if (this.currentStep === 2) {
      const selectedTreatments = this.treatmentsArray.controls.filter(t => t.get('selected')?.value).map((t: any) => ({
        treatment_id: t.get('id')?.value,
        total_price: t.get('price')?.value ? t.get('price')?.value : t.get('sub_treatments')?.controls.filter((sub: any) => sub.get('selected')?.value).map((sub: any) => sub.get('price')?.value).reduce((a: any, b: any) => a + b, 0),
        sub_treatments: t.get('sub_treatments')?.controls.filter((sub: any) => sub.get('selected')?.value).map((sub: any) => ({
          sub_treatment_id: sub.get('id')?.value,
          price: sub.get('price')?.value,
        })) ?? [],
      }));
      formData.append('treatments', JSON.stringify(selectedTreatments));
      formData.append('aestheticDevices', JSON.stringify(this.Form.value.devices));
      formData.append('skin_types', JSON.stringify(this.Form.value.skin_types));
      formData.append('surgeries', JSON.stringify(this.Form.value.surgeries));
      formData.append('language', localStorage.getItem('lang') || 'en');
      formData.append('zynq_user_id', this.userInfo.id);
    } else if (this.currentStep === 3) {
      formData.append('zynq_user_id', this.userInfo.id);
      const clinicTimingData = this.transformFormValue(this.Form.value.clinic_timing);
      formData.append('slot_time', this.Form.value.slot_time);
      formData.append('clinic_timing', JSON.stringify(clinicTimingData));
      formData.append('same_for_all', this.Form.value.sameForAllDays ? '0' : '1')
    } else {
      this.Form.markAllAsTouched();
      return
    }

    this.service.post(`clinic/onboard-clinic`, formData).subscribe((res: any) => {
      if (res.success) {
        this.getClinicProfile()
        this.toster.success('Profile updated successfully');
        if (this.currentStep === 3) {
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

    setTimeout(() => {
      this.selectedTreatments = this.clinicProfile()?.treatments.map((item: any) => ({
        id: item.treatment_id,
        name: item.name,
        price: item.total_price,
        selected: true,
        sub_treatments: item.sub_treatments.map((sub: any) => ({
          id: sub.sub_treatment_id,
          name: sub.name,
          price: sub.price,
          selected: true,
        })),
      })) || [];

      this.getDevices();

      this.clinicProfile()?.treatments.forEach((item: any) => {
        this.treatmentsArray.controls.forEach((t: any, index: number) => {
          if (t.get('id')?.value === item.treatment_id) {
            t.get('selected')?.setValue(true);
            t.get('price')?.setValue(item.total_price);
            t.get('sub_treatments')?.controls.forEach((sub: any) => {
              if (item.sub_treatments.find((s: any) => s.sub_treatment_id === sub.get('id')?.value)) {
                sub.get('selected')?.setValue(true);
                sub.get('price')?.setValue(item.sub_treatments.find((s: any) => s.sub_treatment_id === sub.get('id')?.value)?.price);
              } else {
                sub.get('selected')?.setValue(false);
                sub.get('price')?.setValue('');
              }
            });
          }
        });
      });

      if (this.treatmentsArray && this.treatmentsArray.controls) {
        const controls = this.treatmentsArray.controls;

        controls.sort((a: any, b: any) => {
          const aSelected = a.get('selected')?.value ? 1 : 0;
          const bSelected = b.get('selected')?.value ? 1 : 0;
          return bSelected - aSelected;
        });
      }
    }, 1500);

    this.Form.patchValue({
      clinic_name: this.clinicProfile()?.clinic_name,
      clinic_description: this.clinicProfile()?.clinic_description,
      org_number: this.clinicProfile()?.org_number || '',
      email: this.clinicProfile()?.email,
      mobile_number: this.clinicProfile()?.mobile_number,
      city: this.clinicProfile()?.location.city,
      street_address: this.clinicProfile()?.location.street_address,
      zip_code: this.clinicProfile()?.location.zip_code,
      latitude: this.clinicProfile()?.location.latitude,
      longitude: this.clinicProfile()?.location.longitude,
      website_url: this.clinicProfile()?.website_url !== 'null' ? this.clinicProfile()?.website_url : '',
      skin_types: this.clinicProfile()?.skin_types.map((item: any) => item.skin_type_id),
      surgeries: this.clinicProfile()?.surgeries_level.map((item: any) => item.surgery_id),
      devices: this.clinicProfile()?.aestheticDevices.map((item: any) => item.id),
      slot_time: this.clinicProfile()?.slot_time.toString(),
    });

    this.Form.get('sameForAllDays')?.setValue(this.clinicProfile()?.same_for_all == 0 ? true : false);
    this.patchOperationHours(this.clinicProfile()?.operation_hours);
  }

  patchOperationHours(operation_hours: any[] | undefined) {
    const clinicTimingArray = this.Form.get('clinic_timing') as FormArray;

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

  getClinicProfile() {
    this.service.get<any>('clinic/get-profile').subscribe((resp) => {
      this.service._clinicProfile.set(resp.data);
    })
  }

  recommendedCollapseStates: boolean[] = [];
  toggleRecommendedCollapse(recommendedCollapseStates: boolean[], index: number) {
    recommendedCollapseStates[index] = !recommendedCollapseStates[index];
  }
}
