import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { passwordMatchValidator, passwordMismatchValidator, strongPasswordValidator } from '../../validators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  Form!: FormGroup
  isShowCurrentPassword: boolean = false;
  isShowNewPassword: boolean = false;
  isShowConfPassword: boolean = false;
  loading: boolean = false
  constructor(private service: CommonService, private toster: NzMessageService, public location: Location, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
  }
  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.Form = new FormGroup({
      current_password: new FormControl('', Validators.required),
      newPassword: new FormControl('', [Validators.required, strongPasswordValidator]),
      confPassword: new FormControl('', Validators.required),
    }, {
      validators: [
        passwordMatchValidator(),
        passwordMismatchValidator()
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
      current_password: this.Form.value.current_password,
      new_password: this.Form.value.newPassword
    }
    this.service.post<any, any>('webuser/change-password', formData).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.toster.success(res.message);
          this.Form.reset();
          // this.router.navigate(['/']);
          this.loading = false
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
