import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading: boolean = false
  constructor(private fb: FormBuilder, private srevice: CommonService, private toster: NzMessageService, private router: Router) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const formData = this.forgotPasswordForm.value;
      this.srevice.post<any, any>('webuser/forgot-password', formData).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.router.navigateByUrl('/')
            this.toster.success(resp.message)
            this.loading = false;
          } else {
            this.loading = false;
            this.toster.warning(resp.message)
          }
        },
        error: (error) => {
          this.loading = false;
          this.toster.error(error);
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}
