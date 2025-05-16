import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-clinic-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './clinic-profile.component.html',
  styleUrl: './clinic-profile.component.css'
})
export class ClinicProfileComponent {
  Form!: FormGroup

  constructor(private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.inItForm();
  }

  inItForm() {
    this.Form = this.fb.group({
      clinic_name: ['', Validators.required],
      org_number: ['', Validators.required],
      zynq_user_id: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile_number: ['', Validators.required],
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
          open: ['', Validators.required],
          close: ['', Validators.required]
        }),
        tuesday: this.fb.group({
          open: ['', Validators.required],
          close: ['', Validators.required]
        }),
        wednesday: this.fb.group({
          open: ['', Validators.required],
          close: ['', Validators.required]
        }),
        thursday: this.fb.group({
          open: ['', Validators.required],
          close: ['', Validators.required]
        }),
        friday: this.fb.group({
          open: ['', Validators.required],
          close: ['', Validators.required]
        }),
        saturday: this.fb.group({
          open: ['', Validators.required],
          close: ['', Validators.required]
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
}
