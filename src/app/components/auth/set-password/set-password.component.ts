import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { passwordMatchValidator, strongPasswordValidator } from '../../../validators';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.css'
})
export class SetPasswordComponent {
  Form!: FormGroup
  isShowCurrentPassword: boolean = false;
  isShowNewPassword: boolean = false;
  isShowConfPassword: boolean = false;
  loading: boolean = false
  constructor(private service: CommonService, private router: Router, private toster: NzMessageService, public location: Location, private auth: AuthService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
  }
  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.Form = new FormGroup({
      newPassword: new FormControl('', [Validators.required, strongPasswordValidator]),
      confPassword: new FormControl('', Validators.required),
    }, {
      validators: [
        passwordMatchValidator()
      ]
    });
  }

  onSubmit() {
    if (this.Form.invalid) {
      this.Form.markAllAsTouched();
      return
    }
    this.loading = true
    let formData = {
      new_password: this.Form.value.newPassword,
      language: localStorage.getItem('lang') || 'en',
    }
    this.service.post<any, any>('webuser/set-password', formData).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.toster.success(res.message);
          this.Form.reset();
          const role = this.auth.getRoleName();
          this.loading = false
          this.router.navigate([`/${role}/profile-setup`]);
        } else {
          this.toster.error(res.message);
          this.loading = false
        }
      },
      error: (error) => {
        this.toster.error(error);
        this.loading = false
      }
    })
  }
}
