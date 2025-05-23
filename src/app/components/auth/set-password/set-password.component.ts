import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { passwordMatchValidator, strongPasswordValidator } from '../../../validators';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.css'
})
export class SetPasswordComponent {
  Form!: FormGroup
  isShowCurrentPassword: boolean = false;
  isShowNewPassword: boolean = false;
  isShowConfPassword: boolean = false;
  constructor(private service: CommonService, private router: Router, private toster: NzMessageService, public location: Location) { }
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
    let formData = {
      new_password: this.Form.value.newPassword
    }
    this.service.post<any, any>('webuser/set-password', formData).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.toster.success(res.message);
          this.Form.reset();
          this.router.navigate(['/clinic/profile-setup']);
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
