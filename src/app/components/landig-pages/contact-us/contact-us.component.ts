import { Component } from '@angular/core';
import { LandingHeaderComponent } from "../landing-header/landing-header.component";
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [LandingHeaderComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent {
  contactForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private service: CommonService, private toster: NzMessageService) {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: [''],
      phone_number: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.contactForm.value;

    this.service.post('api/contact-us', formData).subscribe({
      next: (res: any) => {
        console.log('Success:', res);
        this.toster.success(res.message);
        this.contactForm.reset();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.toster.error('Something went wrong. Please try again.');
        this.isSubmitting = false;
      }
    });
  }
}
