import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
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
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
declare var bootstrap: any;
@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [NzSelectModule, CommonModule, FormsModule, NzTabsModule, ReactiveFormsModule, RouterLink, NgxIntlTelInputModule, ImageCropperComponent, TranslateModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {
  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  certificateURl = environment.certificateUrl;
  @Input() isEdit: boolean = false; // default value
  personalForm!: FormGroup;
  availabilityForm!: FormGroup;
  Form!: FormGroup;
  daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  sessionDuration: string[] = ['15', '30', '45', '60', '75', '90', '105', '120']
  imagePreview: string | null = null;
  profileImage: any;
  certificates: any[] = [{
    type: null,
    file: null
  }];
  treatments: any[] = [];
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
  maxDate: Date = new Date();
  clinicSkinTypes: { [index: number]: any[] } = {};
  clinicSurgeries: { [index: number]: any[] } = {};
  clinicDevices: { [index: number]: any[] } = {};
  availableSlots: { [index: number]: any[] } = {};
  selectedTreatments: any[] = [];
  dropdownOpen: boolean = false;
  loading: boolean = false
  SearchCountryField = SearchCountryField
  CountryISO = CountryISO;
  selectedCountry = CountryISO.Sweden
  preferredCountries: CountryISO[] = [CountryISO.Sweden];
  selectedIndex: number = 0
  invitedClinics: any[] = [];
  selectedSlot: { [index: number]: any[] } = {};
  profileData: any = {};
  selectedDay: { [index: number]: any[] } = {};
  constructor(private fb: FormBuilder, private loaderService: LoaderService, private apiService: CommonService, private toster: NzMessageService, private router: Router, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
  }

  ngOnInit(): void {
    this.personalForm = this.fb.group({
      fullName: ['', [Validators.required, NoWhitespaceDirective.validate]],
      lastName: [''],
      phone: ['', [Validators.required, Validators.min(0)]],
      address: ['', [Validators.required, NoWhitespaceDirective.validate]],
      biography: ['', [Validators.required, NoWhitespaceDirective.validate]]
    });

    this.Form = this.fb.group({
      clinics: this.fb.array([])
    })

    this.getCertificaTeypes();
    this.loadFormData();
  }

  get clinicsArray(): FormArray {
    return this.Form.get('clinics') as FormArray;
  }

  get treatmentsArray(): FormArray {
    return this.clinicsArray.at(this.selectedIndex).get('treatments') as FormArray;
  }

  subTreatments(i: number): FormArray {
    return this.treatmentsArray.at(i).get('sub_treatments') as FormArray;
  }

  createTreatmentForm(t: any) {
    return this.fb.group({
      id: t.treatment_id,
      name: t.name,
      selected: false,
      price: t.total_price,
      sub_treatments: this.fb.array(
        t.sub_treatments?.length > 0 ? t.sub_treatments.map((sub: any) =>
          this.fb.group({
            id: sub.sub_treatment_id,
            name: sub.name,
            selected: false,
            price: sub.price,
          })
        ) : []
      ),
    });
  }

  buildClinicsForm(response: any[]) {
    const clinicsFA = this.clinicsArray;
    clinicsFA.clear();
    response.forEach(clinic => {
      clinicsFA.push(
        this.fb.group({
          clinic_id: [clinic.clinic_id],
          clinic_name: [clinic.clinic_name],
          fee_per_session: ['', [Validators.required, this.allowedPriceValidator.bind(this)]],
          slot_time: ['', [Validators.required]],
          treatments: this.fb.array([]),
          devices: [[]],
          skin_types: [[]],
          surgeries: [[]]
        })
      );
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

    const children = this.subTreatments(i)?.controls;
    const anySelected = children?.some(c => c.get('selected')?.value);

    if (anySelected) {
      parent.get('selected')?.setValue(true, { emitEvent: false });
      parentPrice.disable();
      this.updateParentTotal(i);
    } else {
      parent.get('selected')?.setValue(false, { emitEvent: false });
      parentPrice.enable();
      parentPrice.setValue('');
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

    const total = this.subTreatments(i)?.controls
      ?.filter(sub => sub.get('selected')?.value)
      ?.reduce((sum: number, sub: AbstractControl) => sum + Number(sub.get('price')?.value || 0), 0);

    parentPrice.setValue(total || 0);
  }


  getControl(group: any, controlName: string): FormControl {
    return group.get(controlName) as FormControl;
  }

  getChildControl(parentIndex: number, childIndex: number, controlName: string): FormControl {
    return this.subTreatments(parentIndex).at(childIndex).get(controlName) as FormControl;
  }

  loadFormData() {
    // this.loaderService.show();
    this.apiService.get<DoctorProfileResponse>('doctor/get_profile').subscribe(res => {
      if (res.success == false) {
        return;
      }
      const data = res.data;
      this.profileData = data;
      this.invitedClinics = data?.clinics;
      this.buildClinicsForm(data?.clinics);
      this.getTreatments(data.clinics[0].clinic_id, 0)
      this.getSkinTypes(data.clinics[0].clinic_id)
      this.getSurgeries(data.clinics[0].clinic_id)
      this.getAvailableSlots(data.clinics[0].clinic_id, 0, data.clinics[0].doctor_slot_time ? data.clinics[0].doctor_slot_time : null);
      this.personalForm.patchValue({
        fullName: data.name,
        lastName: data.last_name,
        phone: data.phone,
        address: data.address,
        biography: data.biography
      });

      if (data.profile_image != null && data.profile_image != '') {
        this.imagePreview = data.profile_image;
      }

      this.patchClinicWiseData(data, 0);


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

  currentStep = 0;
  steps = [
    { id: 'Personal', label: 'PersonalDetails' },
    { id: 'Education', label: 'EducationExperience' },
    { id: 'Expertise', label: 'Expertise' }
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

  onSubmitPersonal() {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    };
    this.loading = true;
    const formData = new FormData();
    formData.append('name', this.personalForm.value.fullName);
    formData.append('last_name', this.personalForm.value.lastName);
    formData.append('phone', this.personalForm.value.phone.e164Number);
    formData.append('address', this.personalForm.value.address);
    formData.append('biography', this.personalForm.value.biography);
    // formData.append('language', localStorage.getItem('lang') || 'en');
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
        this.loading = false;
      }
    });
  };

  onExpertiseSubmit() {
    // const isAnyTreatmentSelected = this.treatmentsArray.controls.some(t => t.get('selected')?.value);

    // if (!isAnyTreatmentSelected) {
    //   this.toster.warning(this.translate.instant('PleaseSelectAtLeastOneTreatmentForEveryClinic'));
    //   return;
    // }

    // if (this.clinicsArray.invalid) {
    //   this.toster.warning(this.translate.instant('pleaseFillAllRequiredFields'));
    //   this.clinicsArray.markAllAsTouched();
    //   return;
    // }

    // if (Object.keys(this.selectedSlot).length === 0) {
    //   this.toster.warning(this.translate.instant('pleaseSelectAtLeastOneSlot'));
    //   return;
    // }

    this.loading = true;

    let formData: any = {
      treatments: [],
      clinic_id: [],
      skin_type_ids: [],
      surgery_ids: [],
      device_ids: [],
      availability: [],
      doctor_slot_time: [],
      fee_per_session: [],
    };

    this.clinicsArray.value.forEach((clinic: any) => {
      formData.clinic_id.push(clinic.clinic_id);
      formData.skin_type_ids.push(clinic.skin_types);
      formData.surgery_ids.push(clinic.surgeries);
      formData.device_ids.push(clinic.devices);
      formData.doctor_slot_time.push(clinic.slot_time ? clinic.slot_time : null);
      formData.fee_per_session.push(clinic.fee_per_session ? clinic.fee_per_session : null);
      formData.treatments.push(clinic.treatments.filter((t: { selected: boolean; }) => t.selected).map((t: any) => ({
        treatment_id: t.id,
        price: t.price || 0,
        sub_treatments: t.sub_treatments.filter((sub: any) => sub.selected).map((sub: any) => ({
          sub_treatment_id: sub.id,
          sub_treatment_price: sub.price || 0,
        })) ?? [],
      })));
    });
    formData.availability = Object.values(this.selectedSlot);

    this.apiService.post<any, any>('doctor/add_expertise', formData).subscribe({
      next: (resp) => {
        if (resp.success == true) {
          this.router.navigate(['/doctor/my-profile']);
          this.loading = false;
        }
      },
      error: (error) => {
        this.loading = false;
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
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageBlob: any = '';
  onProfileImage(event: any): void {
    this.imageChangedEvent = event
    this.openModal()
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBlob = event.blob
    this.croppedImage = event.objectUrl
  }

  onDone() {
    this.imagePreview = this.croppedImage
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

  removePreview(index: number, id: any) {
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

  getTreatments(clinicId: string, clinicIndex: number) {
    const clinicGroup = this.clinicsArray.at(clinicIndex);
    const treatmentsFA = clinicGroup.get('treatments') as FormArray;

    if (treatmentsFA.length > 0) {
      return;
    }

    this.apiService
      .get<TreatmentResponse>(`doctor/get-clinic-mapped-treatments/${clinicId}`)
      .subscribe(res => {
        res.data.treatments.forEach((t: any) => {
          treatmentsFA.push(this.createTreatmentForm(t));
        });
      });
  }

  getSkinTypes(clinicId: string) {
    this.apiService.get<SkinTypeResponse>(`doctor/get-skin-types/${clinicId}`).subscribe((res) => {
      this.clinicSkinTypes[this.selectedIndex] = res.data
    });
  }

  getSurgeries(clinicId: string) {
    this.apiService.get<any>(`doctor/get-surgery/${clinicId}`).subscribe((res) => {
      this.clinicSurgeries[this.selectedIndex] = res.data
    });
  }

  getAvailableSlots(clinicId: string, clinicIndex: number, slotDuration?: string) {
    let formData: any = {
      clinic_id: clinicId,
    }
    if (slotDuration) {
      formData['slot_time'] = slotDuration;
    }
    this.apiService.post<any, any>(`doctor/generate-slots`, formData).subscribe((res) => {
      this.availableSlots[clinicIndex] = this.sortDays(res.data)
    });
  }

  getDevices() {
    let clinicId = this.invitedClinics[this.selectedIndex].clinic_id;
    const treatmentIds = this.selectedTreatments?.map(t => t.id);
    this.apiService.get<any>(`doctor/get-devices/${clinicId}?treatment_ids=${treatmentIds?.join(',')}`).subscribe((res) => {
      this.clinicDevices[this.selectedIndex] = res.data
      const availableDeviceIds = this.clinicDevices[this.selectedIndex].map((device: any) => device.id);
      const selectedDeviceIds = this.Form.value.devices || [];
      const validSelectedDevices = selectedDeviceIds?.filter((id: any) => availableDeviceIds.includes(id));
      this.Form.get('devices')?.setValue(validSelectedDevices);
      this.Form.get('devices')?.updateValueAndValidity();
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

  locations: any[] = [];
  selectedLocation: any = null;

  searchLocation(event: any) {
    this.apiService.get<any>(`clinic/search-location?input=${event.target.value.trim()}`).subscribe((res) => {
      this.locations = res.data
    })
  }

  selectLocation(location: any) {
    this.selectedLocation = location;
    this.personalForm.patchValue({
      address: location
    })
    this.locations = [];
  }

  recommendedCollapseStates: boolean[] = [];
  toggleRecommendedCollapse(recommendedCollapseStates: boolean[], index: number) {
    recommendedCollapseStates[index] = !recommendedCollapseStates[index];
  }

  clinicSelectionChange(index: number) {
    this.selectedIndex = index;
    this.getTreatments(this.invitedClinics[index].clinic_id, index)
    this.getSkinTypes(this.invitedClinics[index].clinic_id)
    this.getSurgeries(this.invitedClinics[index].clinic_id)
    this.getAvailableSlots(this.invitedClinics[index].clinic_id, index)
    this.patchClinicWiseData(this.profileData, index)
  }

  convertTime(time: any): any {
    const [hours, minutes, seconds] = time.split(':').map(Number);

    const utcDate = new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));

    const localHours = String(utcDate.getHours()).padStart(2, '0');
    const localMinutes = String(utcDate.getMinutes()).padStart(2, '0');

    return `${localHours}:${localMinutes}`;
  }

  sortDays(data: any[]) {
    return data.sort(
      (a, b) => this.daysOfWeek.indexOf(a.day) - this.daysOfWeek.indexOf(b.day)
    );
  }

  selectSlot(day: any, slot: any) {
    if (!this.selectedSlot[this.selectedIndex]) {
      this.selectedSlot[this.selectedIndex] = [];
    }

    const clinicSlots = this.selectedSlot[this.selectedIndex];
    let dayEntry = clinicSlots.find(d => d.day === day);

    if (!dayEntry) {
      dayEntry = {
        day,
        session: []
      };
      clinicSlots.push(dayEntry);
    }

    const index = dayEntry.session.findIndex(
      (s: { start_time: any; end_time: any; }) =>
        s.start_time === slot.start_time &&
        s.end_time === slot.end_time
    );

    if (index > -1) {
      dayEntry.session.splice(index, 1);
      if (dayEntry.session.length === 0) {
        this.selectedSlot[this.selectedIndex] =
          clinicSlots.filter(d => d.day !== day);
      }
    } else {
      dayEntry.session.push(slot);
      dayEntry.session.sort((a: { start_time: string; }, b: { start_time: any; }) =>
        a.start_time.localeCompare(b.start_time)
      );
    }
  }


  changeSlotDuration(event: any) {
    this.getAvailableSlots(this.invitedClinics[this.selectedIndex].clinic_id, this.selectedIndex, event)
  }

  patchClinicWiseData(data: any, index: number) {
    setTimeout(() => {
      this.selectedTreatments = data.clinics[index].treatments?.map((item: any) => ({
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

      data.clinics[index].treatments?.forEach((item: any) => {
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

      if (this.treatmentsArray && this.treatmentsArray.controls) {
        const controls = this.treatmentsArray.controls;

        controls.sort((a: any, b: any) => {
          const aSelected = a.get('selected')?.value ? 1 : 0;
          const bSelected = b.get('selected')?.value ? 1 : 0;
          return bSelected - aSelected;
        });
      }
      this.clinicsArray.at(this.selectedIndex).patchValue({
        skin_types: data.clinics[index].skinTypes?.map((item: any) => item.skin_type_id),
        surgeries: data.clinics[index].surgeries?.map((item: any) => item.surgery_id),
        devices: data.clinics[index].devices?.map((item: any) => item.device_id),
        fee_per_session: data.clinics[index].fee_per_session,
        slot_time: data.clinics[index].doctor_slot_time.toString(),
      })
      this.selectedDay[index] = data.clinics[index].slots.map((item: any) => item.day);
      this.selectedSlot[index] = data.clinics[index].slots.map((item: any) => { return { day: item.day, session: item.session } });
    }, 1000);
  }

  selectDay(event: any, day: any) {
    if (event.target.checked) {
      this.selectedDay[this.selectedIndex].push(day);
    } else {
      this.selectedDay[this.selectedIndex] = this.selectedDay[this.selectedIndex].filter(d => d !== day);
      this.selectedSlot[this.selectedIndex] = this.selectedSlot[this.selectedIndex]?.filter(d => d.day !== day);
    }
  }

  isSelectedSlot(day: any, slot: any) {
    const clinicSlots = this.selectedSlot[this.selectedIndex];
    const dayEntry = clinicSlots?.find(d => d.day === day);
    return dayEntry?.session.some((s: any) => s.start_time === slot.start_time && s.end_time === slot.end_time);
  }
}
