import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { AuthService } from '../../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoginResponse } from '../../../models/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  Form!: FormGroup;
  isPasswordVisible: boolean = false;
  loading: boolean = false;

  constructor(private router: Router, private srevice: CommonService, private toster: NzMessageService, private auth: AuthService) {

  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.Form = new FormGroup({
      email: new FormControl(localStorage.getItem('SavedEmail') || '', [Validators.required, Validators.email]),
      password: new FormControl(localStorage.getItem('SavedPassword') || '', Validators.required),
    })
  }

  onSubmit() {
    this.Form.markAllAsTouched();
    if (this.Form.valid) {
      this.loading = true;

      let formData = {
        email: this.Form.value.email,
        password: this.Form.value.password
      }

      this.srevice.post<LoginResponse, any>('webuser/login', formData).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.auth.setToken(resp.data.jwt_token, resp.data.role_id);
            localStorage.setItem('userInfo', JSON.stringify(resp.data));
            if (resp.data.role_id == '2fc0b43c-3196-11f0-9e07-0e8e5d906eef') {
              if (resp.data.is_onboarded === 1) {
                this.router.navigateByUrl('/clinic')
              } else {
                this.router.navigateByUrl('/clinic/profile-setup')
              }
            } else if (resp.data.role_id == '3677a3e6-3196-11f0-9e07-0e8e5d906eef') {
              this.router.navigateByUrl('/doctor/profile-setup')
            }
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
    }
  }
}

