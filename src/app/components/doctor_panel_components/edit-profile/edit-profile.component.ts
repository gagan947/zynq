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
declare var bootstrap: any;
@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [NzSelectModule, CommonModule, FormsModule, ReactiveFormsModule, RouterLink, NgxIntlTelInputModule, ImageCropperComponent, TranslateModule],
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
  sessionDuration: string[] = ['15 Mins', '30 Mins', '45 Mins', '60 Mins', '75 Mins', '90 Mins', '105 Mins', '120 Mins']
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
  skintypes: SkinType[] = []
  maxDate: Date = new Date();
  surgeries: any[] = []
  devices: any[] = []
  selectedTreatments: any[] = [];
  dropdownOpen: boolean = false;
  loading: boolean = false
  SearchCountryField = SearchCountryField
  CountryISO = CountryISO;
  selectedCountry = CountryISO.Sweden
  preferredCountries: CountryISO[] = [CountryISO.Sweden];
  constructor(private fb: FormBuilder, private loaderService: LoaderService, private apiService: CommonService, private toster: NzMessageService, private router: Router, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
  }


  ngOnInit(): void {
    this.personalForm = this.fb.group({
      fullName: ['', [Validators.required, NoWhitespaceDirective.validate]],
      phone: ['', [Validators.required, Validators.min(0)]],
      address: ['', [Validators.required, NoWhitespaceDirective.validate]],
      biography: ['']
    });

    this.Form = this.fb.group({
      treatments: this.fb.array([]),
      skin_types: [[]],
      surgeries: [[]],
      devices: [[]],
    })

    this.availabilityForm = this.fb.group({
      sameForAllDays: [true],
      fee_per_session: ['', [Validators.required, Validators.min(0)]],
      days: this.fb.array(this.daysOfWeek.map(() => this.createDay()))
    });

    this.getCertificaTeypes();
    this.getTreatments();
    this.getSkinTypes();
    this.getSurgeries();
    // this.getDevices();
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
    this.loadFormData();
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


  onTreatmentSelectChange(i: number) {
    const parent = this.treatmentsArray.at(i);
    const parentPrice = parent.get('price') as FormControl;
    const children = this.subTreatments(i)?.controls;

    if (parent.get('selected')?.value) {
      parent.get('price')?.setValidators([Validators.required]);
      parent.get('price')?.updateValueAndValidity();
      children?.forEach((sub: AbstractControl) => {
        sub.get('selected')?.setValue(true, { emitEvent: false });
        sub.get('price')?.setValidators([Validators.required]);
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
            price: [t.price, Validators.required],
            sub_treatments: this.fb.array(
              (t.sub_treatments || []).map((sub: any) =>
                this.fb.group({
                  id: sub.id,
                  name: sub.name,
                  selected: true,
                  price: [sub.price, Validators.required],
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
      child.get('price')?.setValidators([Validators.required]);
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
      this.apiService._doctorProfile.set(data);
      this.personalForm.patchValue({
        fullName: data.name,
        phone: data.phone,
        address: data.address,
        biography: data.biography
      });
      if (data.profile_image != null && data.profile_image != '') {
        this.imagePreview = data.profile_image;
      }
      this.selectedTreatments = data?.treatments.map((item: any) => ({
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

      data.treatments.forEach((item: any) => {
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
      this.Form.patchValue({
        skin_types: data?.skinTypes.map((item: any) => item.skin_type_id),
        surgeries: data?.surgery.map((item: any) => item.surgery_id),
        devices: data?.devices.map((item: any) => item.device_id),
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
    { id: 'Expertise', label: 'Expertise' },
    { id: 'Fee', label: 'FeeAvailability' }
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
    formData.append('phone', this.personalForm.value.phone.e164Number);
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

    if (this.treatmentsArray.controls.some((t: any) => t.get('price')?.invalid || t.get('sub_treatments')?.controls.some((sub: any) => sub.get('price')?.invalid))) {
      this.toster.warning('Please enter price for the treatment and sub treatments');
      return;
    }

    if (this.Form.invalid) {
      this.Form.markAllAsTouched();
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

    let formData = {
      treatments: selectedTreatments,
      skin_type_ids: this.Form.value.skin_types.join(','),
      surgery_ids: this.Form.value.surgeries.join(','),
      device_ids: this.Form.value.devices.length > 0 ? this.Form.value.devices.join(',') : "",
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

  getTreatments() {
    this.apiService.get<TreatmentResponse>(`clinic/get-treatments?language=${localStorage.getItem('lang')}`).subscribe((res) => {
      this.treatments = res.data
      this.initTreatments(this.treatments);
    });
  }


  getSkinTypes() {
    this.apiService.get<SkinTypeResponse>(`clinic/get-skin-types`).subscribe((res) => {
      this.skintypes = res.data
    });
  }

  getSurgeries() {
    this.apiService.get<any>(`clinic/get-surgery`).subscribe((res) => {
      this.surgeries = res.data
    });
  }

  getDevices() {
    const treatmentIds = this.selectedTreatments.map(t => t.id);
    this.apiService.get<any>(`clinic/get-devices?treatment_ids=${treatmentIds.join(',')}`).subscribe((res) => {
      this.devices = res.data
      const availableDeviceIds = this.devices.map((device: any) => device.id);
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
}
