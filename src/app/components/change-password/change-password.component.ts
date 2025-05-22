import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { Router, RouterLink } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { passwordMatchValidator, passwordMismatchValidator, strongPasswordValidator } from '../../validators';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  Form!: FormGroup
  isShowCurrentPassword: boolean = false;
  isShowNewPassword: boolean = false;
  isShowConfPassword: boolean = false;
  constructor(private service: CommonService, private router: Router, private toster: NzMessageService) { }
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
        } else {
          this.toster.error(res.message);
        }
      },
      error: (error) => {
        this.toster.error(error);
      }
    })
  }
}
