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
import { NoWhitespaceDirective } from '../../../validators';

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
  benefits: any[] = [];
  devices: any[] = [];
  terms: any[] = [];
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
      benefits_ids: [[], [Validators.required]],
      device_ids: [[]],
      like_wise_terms_ids: [[], [Validators.required]],
    });

    this.route.queryParams.subscribe(param => {
      this.treatmentId = param['id'];
    })
  }

  ngOnInit(): void {
    this.getConcerns();
    this.getSubTreatments();
    this.getBenefits();
    this.getDevices();
    this.getTerms();
    if (this.treatmentId) {
      this.getTreatmentById();
    }

    this.Form.get('is_device')?.valueChanges.subscribe((value) => {
      if (value) {
        this.Form.get('device_ids')?.setValidators([Validators.required]);
        this.Form.get('device_ids')?.updateValueAndValidity();
      } else {
        this.Form.get('device_ids')?.clearValidators();
        this.Form.get('device_ids')?.updateValueAndValidity();
      }
    });
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

  getBenefits() {
    this.service.get<any>(`doctor/benefit`).subscribe((res) => {
      this.benefits = res.data
    });
  }

  getDevices() {
    this.service.get<any>(`doctor/device`).subscribe((res) => {
      this.devices = res.data
    });
  }

  getTerms() {
    this.service.get<any>(`doctor/likewiseterms`).subscribe((res) => {
      this.terms = res.data
    });
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
      benefits_ids: this.Form.value.benefits_ids || [],
      description_en: this.Form.value.full_description,
      is_device: this.Form.value.is_device,
      concerns_ids: this.Form.value.concerns || [],
      like_wise_terms_ids: this.Form.value.like_wise_terms_ids || [],
      sub_treatments: this.Form.value.sub_treatments || [],
    };
    if (this.Form.value.is_device) {
      payload.device_ids = this.Form.value.device_ids || [];
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
          benefits_ids: this.treatmetData?.benefits_en_ids.split(','),
          like_wise_terms_ids: this.treatmetData?.like_wise_terms_ids.split(','),
          device_ids: this.treatmetData?.device_name_ids.split(','),
        });

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
