import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoWhitespaceDirective } from '../../../../validators';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule, Location } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from '../../../../services/common.service';
import { AuthService } from '../../../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-raise-tickets',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NzSelectModule, CommonModule],
  templateUrl: './raise-tickets.component.html',
  styleUrl: './raise-tickets.component.css'
})
export class RaiseTicketsComponent {
  Form!: FormGroup
  loading: boolean = false
  clinics$!: Observable<any>
  constructor(private fb: FormBuilder, public location: Location, private srevice: CommonService, private toster: NzMessageService, public auth: AuthService) {
    this.Form = this.fb.group({
      for: [''],
      clinic_id: [''],
      title: ['', [Validators.required, Validators.maxLength(100), NoWhitespaceDirective.validate]],
      description: ['', [Validators.required, NoWhitespaceDirective.validate]]
    });
  }

  ngOnInit() {
    if (this.auth.getRoleName() == 'doctor') {
      this.Form.get('for')?.setValidators([Validators.required]);
      this.Form.get('for')?.updateValueAndValidity();

      this.Form.get('for')?.valueChanges.subscribe((value) => {
        if (value === 'Clinic') {
          this.Form.get('clinic_id')?.setValidators([Validators.required]);
        } else {
          this.Form.get('clinic_id')?.clearValidators();
        }
      });

      this.clinics$ = this.srevice.get<any>(`doctor/get_linked_clinics`)
    }
  }

  onSubmit() {
    this.Form.markAllAsTouched();
    if (this.Form.valid) {
      this.loading = true;

      let formData: any = {
        issue_title: this.Form.value.title,
        issue_description: this.Form.value.description
      }

      let apiUrl = ''
      if (this.auth.getRoleName() == 'clinic' || this.auth.getRoleName() == 'solo-doctor') {
        apiUrl = 'clinic/create-support-ticket'
      } else if (this.Form.value.for == 'Clinic' && this.auth.getRoleName() == 'doctor') {
        apiUrl = 'doctor/create-support-ticket-to-clinic'
        formData.clinic_id = this.Form.value.clinic_id
      }
      else {
        apiUrl = 'doctor/create-support-ticket'
      }

      this.srevice.post<any, any>(apiUrl, formData).subscribe({
        next: (resp) => {
          this.loading = false;
          resp.success ? this.toster.success(resp.message) : this.toster.warning(resp.message);
          if (resp.success) {
            this.location.back();
          }
        },
        error: (err) => {
          this.loading = false;
          this.toster.error(err);
        }
      });
    }
  }
}
