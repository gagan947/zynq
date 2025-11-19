import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { CarouselComponent, CarouselModule } from 'ngx-owl-carousel-o';
import { CommonService } from '../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoaderService } from '../../../services/loader.service';
import { Location } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { NoWhitespaceDirective } from '../../../validators';

@Component({
  selector: 'app-view-treatment',
  standalone: true,
  imports: [CommonModule, NzRateModule, FormsModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './view-treatment.component.html',
  styleUrl: './view-treatment.component.css'
})
export class ViewTreatmentComponent {
  Form!: FormGroup;
  treatmentId: string | undefined;
  treatmentData: any | undefined
  subTreatmentId: string | undefined;
  userId: any;
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('closeButton2') closeButton2!: ElementRef<HTMLButtonElement>;
  constructor(private service: CommonService, private fb: FormBuilder, private route: ActivatedRoute, private authService: AuthService, private toster: NzMessageService, private loader: LoaderService, private translate: TranslateService, public location: Location) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    this.userId = this.authService.getUserInfo().id;
    this.route.queryParams.subscribe(param => {
      this.treatmentId = param['id'];
      if (this.treatmentId) {
        this.loader.show();
        this.getTreatmentById();
      }
    })
    this.Form = this.fb.group({
      name: ['', [Validators.required, NoWhitespaceDirective.validate]],
    });
  }

  getTreatmentById() {
    this.loader.show();
    this.service.get('doctor/get-treatment-by-id?treatment_id=' + this.treatmentId).subscribe((res: any) => {
      if (res.success) {
        this.treatmentData = res.data;
        this.loader.hide();
      } else {
        this.toster.error(res.message);
        this.loader.hide();
      }
    }, (error) => {
      this.toster.error(error);
      this.loader.hide();
    })
  }

  onSubmit() {
    this.Form.markAllAsTouched();
    if (this.Form.valid) {
      this.loader.show();
      const formData: any = {
        treatment_id: this.treatmentId,
        name: this.Form.value.name,
      }
      if (this.subTreatmentId) {
        formData.sub_treatment_id = this.subTreatmentId;
      }

      this.service.post('doctor/sub-treatment', formData).subscribe((res: any) => {
        if (res.success) {
          this.toster.success(res.message);
          this.getTreatmentById();
          this.closeButton.nativeElement.click();
          this.subTreatmentId = undefined;
          this.Form.reset();
        } else {
          this.toster.error(res.message);
        }
        this.loader.hide();
      }, (error) => {
        this.toster.error(error);
        this.loader.hide();
      })
    }
  }

  openEditModal(item: any) {
    this.subTreatmentId = item.sub_treatment_id;
    this.Form.patchValue({
      name: item.name,
    });
  }

  opanDeleteModal(subTreatmentId: string) {
    this.subTreatmentId = subTreatmentId;
  }

  deleteSubTreatment() {
    this.loader.show();
    this.service.delete<any>(`clinic/sub_treatment/${this.subTreatmentId}`).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.toster.success(resp.message)
          this.getTreatmentById()
          this.closeButton2.nativeElement.click();
          this.subTreatmentId = undefined;
          this.loader.hide();
        } else {
          this.toster.error(resp.message)
          this.loader.hide();
        }
      },
      error: (error) => {
        this.toster.error(error);
        this.loader.hide();
      }
    })
  }
}