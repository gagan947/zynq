import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { AuthService } from '../../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoginResponse } from '../../../models/login';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  Form!: FormGroup;
  isPasswordVisible: boolean = false;
  loading: boolean = false;
  public publicRoleId: string = '';
  selectedLang: string = 'en';
  constructor(private router: Router, private srevice: CommonService, private toster: NzMessageService, private auth: AuthService, private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    this.translate.use(localStorage.getItem('lang') || 'en');
    this.selectedLang = localStorage.getItem('lang') || 'en';
  }

  ngOnInit(): void {
    sessionStorage.clear();
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
        password: this.Form.value.password,
        fcm_token: localStorage.getItem('fcm_token') || ''
      }

      this.srevice.post<LoginResponse, any>('webuser/login', formData).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.auth.setValues(resp.data.jwt_token, resp.data.role_id, resp.data);
            if (resp.data.role_id == '2fc0b43c-3196-11f0-9e07-0e8e5d906eef') {  // Clinic
              if (resp.data.is_onboarded === 1) {
                this.router.navigateByUrl('/clinic')
              } else if (resp.data.is_password_set === 0) {
                this.router.navigateByUrl('/set-password')
              } else {
                this.router.navigateByUrl('/clinic/profile-setup')
              }
            } else if (resp.data.role_id == '3677a3e6-3196-11f0-9e07-0e8e5d906eef') { // Doctor
              if (resp.data.on_boarding_status == 4) {
                this.router.navigateByUrl('/doctor')
              } else if (resp.data.is_password_set === 0) {
                this.router.navigateByUrl('/set-password')
              } else {
                this.router.navigateByUrl('/doctor/profile-setup')
              }
            } else if (resp.data.role_id == '407595e3-3196-11f0-9e07-0e8e5d906eef') {  // Solo Doctor
              if (resp.data.is_onboarded === 1) {
                this.router.navigateByUrl('/solo-doctor')
              } else if (resp.data.is_password_set === 0) {
                this.router.navigateByUrl('/set-password')
              } else {
                this.router.navigateByUrl('/solo-doctor/profile-setup')
              }
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

  onCustomLangChange(lang: any) {
    this.selectedLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }
}

