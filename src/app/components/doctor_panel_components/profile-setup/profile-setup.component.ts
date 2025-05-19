import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzSelectModule } from 'ng-zorro-antd/select';
@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [RouterLink,NzSelectModule, CommonModule, ReactiveFormsModule],
  templateUrl: './profile-setup.component.html',
  styleUrl: './profile-setup.component.css'
})
export class ProfileSetupComponent {
  personalForm!: FormGroup;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {}


  ngOnInit(): void {
    this.personalForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      age: ['', [Validators.required, Validators.min(1)]],
      gender: ['', Validators.required],
      profileImage: [null, Validators.required]
    });

    this.loadFormData();
  }

  loadFormData() {
    // this.http.get<any>('https://your-api.com/personal-info').subscribe(data => {
    //   this.personalForm.patchValue({
    //     fullName: data.fullName,
    //     email: data.email,
    //     phone: data.phone,
    //     age: data.age,
    //     gender: data.gender
    //   });
    // });
  };


  currentStep = 0;

  steps = [
    { id: 'Personal', label: 'Personal Details' },
    { id: 'Education', label: 'Education & Experience' },
    { id: 'Expertise', label: 'Expertise' },
    { id: 'Fee', label: 'Fee & Availability' }
  ];

  get progress(): string {
    return ((this.currentStep + 1) / this.steps.length) * 100 + '%';
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  onSubmitPersonal(){
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    }
  }
}
