import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NoWhitespaceDirective } from '../../../../validators';
import { CommonService } from '../../../../services/common.service';
import { SecurityLevel, SecurityLevelResponse, SkinType, SkinTypeResponse, Treatment, TreatmentResponse } from '../../../../models/treatments';
import { NzSelectModule } from 'ng-zorro-antd/select';
@Component({
  selector: 'app-clinic-setup',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, NzSelectModule],
  templateUrl: './clinic-setup.component.html',
  styleUrl: './clinic-setup.component.css'
})
export class ClinicSetupComponent {
  Form!: FormGroup
  treatments: Treatment[] = []
  selectedTreatments: Treatment[] = []
  filteredTreatments: Treatment[] = []
  skintypes: SkinType[] = []
  selectedSkinTypes: SkinType[] = []
  securityLevel: SecurityLevel[] = []
  selectedSecurityLevel: SecurityLevel[] = []
  days: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  submitted: boolean = false

  constructor(private fb: FormBuilder, private service: CommonService) { }

  ngOnInit(): void {
    this.inItForm();
    this.getTreatments();
    this.getSkinTypes();
    this.getSecurityLevel();
  }

  inItForm() {
    this.Form = this.fb.group({
      clinic_name: ['', [Validators.required, NoWhitespaceDirective.validate]],
      org_number: [''],
      zynq_user_id: ['', [Validators.required, NoWhitespaceDirective.validate]],
      email: ['', [Validators.required, Validators.email]],
      mobile_number: ['', [Validators.required, NoWhitespaceDirective.validate]],
      address: [''],
      street_address: ['', [Validators.required, NoWhitespaceDirective.validate]],
      city: ['', [Validators.required, NoWhitespaceDirective.validate]],
      state: ['', [Validators.required, NoWhitespaceDirective.validate]],
      zip_code: ['', [Validators.required, NoWhitespaceDirective.validate]],
      latitude: [''],
      longitude: [''],

      treatments: this.fb.array([
        this.fb.control('')
      ]),

      clinic_timing: this.fb.group({
        monday: this.fb.group({
          open: ['', [Validators.required, NoWhitespaceDirective.validate]],
          close: ['', [Validators.required, NoWhitespaceDirective.validate]]
        }),
        tuesday: this.fb.group({
          open: ['', [Validators.required, NoWhitespaceDirective.validate]],
          close: ['', [Validators.required, NoWhitespaceDirective.validate]]
        }),
        wednesday: this.fb.group({
          open: ['', [Validators.required, NoWhitespaceDirective.validate]],
          close: ['', [Validators.required, NoWhitespaceDirective.validate]]
        }),
        thursday: this.fb.group({
          open: ['', [Validators.required, NoWhitespaceDirective.validate]],
          close: ['', [Validators.required, NoWhitespaceDirective.validate]]
        }),
        friday: this.fb.group({
          open: ['', [Validators.required, NoWhitespaceDirective.validate]],
          close: ['', [Validators.required, NoWhitespaceDirective.validate]]
        }),
        saturday: this.fb.group({
          open: ['', [Validators.required, NoWhitespaceDirective.validate]],
          close: ['', [Validators.required, NoWhitespaceDirective.validate]]
        }),
        sunday: this.fb.group({
          open: ['', [Validators.required, NoWhitespaceDirective.validate]],
          close: ['', [Validators.required, NoWhitespaceDirective.validate]],
        })
      }),

      website_url: ['', [Validators.required, NoWhitespaceDirective.validate]],
      clinic_description: ['', [Validators.required, NoWhitespaceDirective.validate]],

      equipments: this.fb.array([
        this.fb.control('')
      ]),
      skin_types: this.fb.array([
        this.fb.control('')
      ]),
      severity_levels: this.fb.array([
        this.fb.control('')
      ]),

      fee_range: this.fb.group({
        min: [100],
        max: [1000]
      }),

      language: ['en'],
      logo: [null, [Validators.required]],
      legal_document: [null, [Validators.required]],
      certificates: [null]
    });
  }
  get clinicTiming(): FormGroup {
    return this.Form.get('clinic_timing') as FormGroup;
  }

  hasClinicTimingError(day: string, controlName: string, errorType: string): boolean {
    const dayGroup = this.clinicTiming.get(day) as FormGroup;
    const control = dayGroup?.get(controlName);
    return !!(control && control.touched && control.hasError(errorType));
  }

  getTreatments() {
    this.service.get<TreatmentResponse>(`clinic/get-treatments`).subscribe((res) => {
      this.treatments = res.data
    });
  }

  addTreatment(treatment: Treatment) {
    if (!this.selectedTreatments.some((item) => item.treatment_id === treatment.treatment_id)) {
      this.selectedTreatments.push(treatment);
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
  getSkinTypes() {
    this.service.get<SkinTypeResponse>(`clinic/get-skin-types`).subscribe((res) => {
      this.skintypes = res.data
    });
  }

  addSkinTypes(skinType: SkinType) {
    if (!this.selectedSkinTypes.some((item) => item.skin_type_id === skinType.skin_type_id)) {
      this.selectedSkinTypes.push(skinType);
    } else {
      this.selectedSkinTypes = this.selectedSkinTypes.filter((item) => item.skin_type_id !== skinType.skin_type_id);
    }
  }
  getSecurityLevel() {
    this.service.get<SecurityLevelResponse>(`clinic/get-severity-levels`).subscribe((res) => {
      this.securityLevel = res.data
    });
  }

  addSecurityLevel(securityLavel: SecurityLevel) {
    if (!this.selectedSecurityLevel.some((item) => item.severity_level_id === securityLavel.severity_level_id)) {
      this.selectedSecurityLevel.push(securityLavel);
    } else {
      this.selectedSecurityLevel = this.selectedSecurityLevel.filter((item) => item.severity_level_id !== securityLavel.severity_level_id);
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.Form.invalid) {
      this.Form.markAllAsTouched();
      return;
    }
  }
}
