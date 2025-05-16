import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NoWhitespaceDirective } from '../../../../validators';

@Component({
  selector: 'app-clinic-setup',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './clinic-setup.component.html',
  styleUrl: './clinic-setup.component.css'
})
export class ClinicSetupComponent {
  Form!: FormGroup

  constructor(private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.inItForm();
  }

  inItForm() {
    this.Form = this.fb.group({
      clinic_name: ['', [Validators.required, NoWhitespaceDirective.validate]],
      org_number: ['', [Validators.required, NoWhitespaceDirective.validate]],
      zynq_user_id: ['', [Validators.required, NoWhitespaceDirective.validate]],
      email: ['', [Validators.required, Validators.email]],
      mobile_number: ['', [Validators.required, NoWhitespaceDirective.validate]],
      address: [''],
      street_address: [''],
      city: [''],
      state: [''],
      zip_code: [''],
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
          open: [''],
          close: ['']
        })
      }),

      website_url: [''],
      clinic_description: [''],

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
      logo: [null],
      legal_document: [null],
      certificates: [null]
    });
  }

  onSubmit() {
  }
}
