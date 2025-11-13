import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoaderService } from '../../../services/loader.service';
import { AuthService } from '../../../services/auth.service';
import { Treatment } from '../../../models/clinic-profile';
import { TreatmentResponse } from '../../../models/clinic-onboarding';
import { NoWhitespaceDirective } from '../../../validators';
import { Product } from '../../../models/products';
declare var bootstrap: any;

@Component({
  selector: 'app-add-treatment',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NzSelectModule, NzUploadModule, ImageCropperComponent, TranslateModule],
  templateUrl: './add-treatment.component.html',
  styleUrl: './add-treatment.component.css'
})
export class AddTreatmentComponent {

  Form!: FormGroup;
  treatmentId: string | undefined;
  submitted: boolean = false;
  concerns: any[] = [];
  treatmetData: Product | undefined;
  selectedBenefits: string[] = [];
  selectedDevices: string[] = [];
  selectedTerms: string[] = [];
  @ViewChild('benefitsInput') benefitsInput!: ElementRef<HTMLButtonElement>;
  @ViewChild('devicesInput') devicesInput!: ElementRef<HTMLButtonElement>;
  @ViewChild('tremsInput') tremsInput!: ElementRef<HTMLButtonElement>;

  constructor(private router: Router, private service: CommonService, private toster: NzMessageService, private fb: FormBuilder, public location: Location, private route: ActivatedRoute, private loader: LoaderService, private auth: AuthService, private translate: TranslateService) {
    this.Form = this.fb.group({
      name: ['', [Validators.required, NoWhitespaceDirective.validate]],
      classification_type: ['', [Validators.required]],
      full_description: ['', [Validators.required, NoWhitespaceDirective.validate, Validators.maxLength(500)]],
      is_device: [true, [Validators.required]],
      concerns: [[], [Validators.required]],
    });

    this.route.queryParams.subscribe(param => {
      this.treatmentId = param['id'];
      if (this.treatmentId) {
        this.getTreatmentById();
      }
    })
  }

  ngOnInit(): void {
    this.getTreatments();
  }

  getTreatments() {
    this.service.get<TreatmentResponse>(`doctor/get-allconcerns`).subscribe((res) => {
      this.concerns = res.data
    });
  }

  addBenefits(feature: string) {
    if (!this.selectedBenefits.includes(feature)) {
      if (feature.trim() != '') {
        this.selectedBenefits.push(feature.trim());
        this.benefitsInput.nativeElement.value = '';
      }
    } else {
      this.toster.error('Feature already added');
    }
  }

  removeBenefits(index: number) {
    this.selectedBenefits.splice(index, 1);
  }

  addDevices(feature: any) {
    if (!this.selectedDevices.includes(feature)) {
      if (feature.trim() != '') {
        this.selectedDevices.push(feature.trim());
        this.devicesInput.nativeElement.value = '';
      }
    } else {
      this.toster.error('Feature already added');
    }
  }

  removeDevices(index: any) {
    this.selectedDevices.splice(index, 1);
  }

  addTerms(feature: any) {
    if (!this.selectedTerms.includes(feature)) {
      if (feature.trim() != '') {
        this.selectedTerms.push(feature.trim());
        this.tremsInput.nativeElement.value = '';
      }
    } else {
      this.toster.error('Feature already added');
    }
  }

  removeTerms(index: any) {
    this.selectedTerms.splice(index, 1);
  }

  onSubmit() {
    this.submitted = true;
    if (this.Form.invalid) {
      this.Form.markAllAsTouched();
      return;
    }

    this.loader.show();

    const payload: any = {
      name: this.Form.value.name,
      swedish: this.Form.value.name,
      classification_type: this.Form.value.classification_type,
      benefits_en: this.selectedBenefits.join(),
      benefits_sv: this.selectedBenefits.join(),
      description_en: this.Form.value.full_description,
      description_sv: this.Form.value.full_description,
      source: 'old',
      is_device: true,
      concerns: this.Form.value.concerns || [],
      device_name: this.selectedDevices || [],
      "embeddings": [
        -0.633076012134552
      ],
    };

    if (this.treatmentId) {
      payload.treatment_id = this.treatmentId;
    }

    const apiUrl = 'doctor/treatment';

    this.service.post(apiUrl, payload).subscribe({
      next: (res: any) => {
        this.loader.hide();
        if (res.success) {
          this.toster.success(res.message);
          // Optional redirect
          this.router.navigate(['/solo-doctor/treatments']);
        } else {
          this.toster.error(res.message);
        }
      },
      error: (err) => {
        this.loader.hide();
        this.toster.error(err);
      }
    });
  }


  getTreatmentById() {
    let formData = {
      treatment_id: this.treatmentId
    }
    this.service.post('clinic/get-treatment-by-id', formData).subscribe((res: any) => {
      if (res.success) {
        this.treatmetData = res.data;
        this.Form.patchValue(this.treatmetData || {});
        this.Form.patchValue({ treatments: this.treatmetData?.treatments.map((item: any) => item.treatment_id) });


        this.selectedDevices = this.treatmetData?.feature_text.split(',') || [];
        this.selectedBenefits = this.treatmetData?.benefit_text.split(',') || [];
      } else {
        this.toster.error(res.message);
      }
    }, (error) => {
      this.toster.error(error);
    })
  };


}
