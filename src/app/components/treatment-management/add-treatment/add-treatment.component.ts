import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoaderService } from '../../../services/loader.service';
import { AuthService } from '../../../services/auth.service';
import { TreatmentResponse } from '../../../models/clinic-onboarding';
import { NoWhitespaceDirective } from '../../../validators';
import { Product } from '../../../models/products';

@Component({
  selector: 'app-add-treatment',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NzSelectModule, NzUploadModule, TranslateModule],
  templateUrl: './add-treatment.component.html',
  styleUrl: './add-treatment.component.css'
})
export class AddTreatmentComponent {

  Form!: FormGroup;
  treatmentId: string | undefined;
  submitted: boolean = false;
  concerns: any[] = [];
  treatmetData: any | undefined;
  selectedBenefits: string[] = [];
  selectedDevices: string[] = [];
  selectedTerms: string[] = [];
  subTreatments: any[] = [];
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
      sub_treatments: [[], [Validators.required]],
    });

    this.route.queryParams.subscribe(param => {
      this.treatmentId = param['id'];
    })
  }

  ngOnInit(): void {
    this.getConcerns();
    this.getSubTreatments();
    if (this.treatmentId) {
      this.getTreatmentById();
    }
  }

  getConcerns() {
    this.service.get<any>(`doctor/get-allconcerns`).subscribe((res) => {
      this.concerns = res.data
    });
  }

  getSubTreatments() {
    this.service.get<any>(`doctor/get-all-sub-treatments`).subscribe((res) => {
      this.subTreatments = res.data.ALL
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
      classification_type: this.Form.value.classification_type,
      benefits_en: this.selectedBenefits.join(),
      description_en: this.Form.value.full_description,
      is_device: this.Form.value.is_device,
      concerns: this.Form.value.concerns || [],
      like_wise_terms: this.selectedTerms || [],
      sub_treatments: this.Form.value.sub_treatments || [],
    };
    if (this.Form.value.is_device) {
      payload.device_name = this.selectedDevices || [];
    }
    if (this.treatmentId) {
      payload.treatment_id = this.treatmentId;
    }

    const apiUrl = 'doctor/treatment';

    this.service.post(apiUrl, payload).subscribe({
      next: (res: any) => {
        this.loader.hide();
        if (res.success) {
          this.toster.success(res.message);
          this.router.navigate(['../../treatments'], { relativeTo: this.route });
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
    this.loader.show();
    this.service.get('doctor/get-treatment-by-id?treatment_id=' + this.treatmentId).subscribe((res: any) => {
      if (res.success) {
        this.treatmetData = res.data;
        this.Form.patchValue({
          name: this.treatmetData?.name,
          classification_type: this.treatmetData?.classification_type,
          full_description: this.treatmetData?.description_en,
          is_device: this.treatmetData?.is_device == 1 ? true : false,
        });
        this.Form.patchValue({
          concerns: this.treatmetData?.concerns?.map((item: any) => item.concern_id) || [],
          sub_treatments: this.treatmetData?.sub_treatments?.map((item: any) => item.sub_treatment_id) || [],
        });
        this.selectedDevices = this.treatmetData?.device_name?.split(',') || [];
        this.selectedTerms = this.treatmetData?.like_wise_terms?.split(',') || [];
        this.selectedBenefits = this.treatmetData?.benefits_en?.split(',') || [];
        this.loader.hide();
      } else {
        this.toster.error(res.message);
        this.loader.hide();
      }
    }, (error) => {
      this.toster.error(error);
      this.loader.hide();
    })
  };


}
