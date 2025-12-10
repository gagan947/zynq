import { Component, effect } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { SocketService } from '../../../services/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-suggest-treatment',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './suggest-treatment.component.html',
  styleUrl: './suggest-treatment.component.css'
})
export class SuggestTreatmentComponent {
  private destroy$ = new Subject<void>();
  appointment = this.service._Appointment;
  appointmentData: any;
  recommendedTreatments: any = [];
  suggestedTreatment: Treatment[] = [];
  isApplyDiscount: boolean = false;
  recommendedCollapseStates: boolean[] = [];
  discountType: string = 'SEK';
  totalAmount: number = 0;
  discountAmount: number = 0;
  netAmount: number = 0;
  discount: number = 0;
  loading: boolean = false
  collapseStates: boolean[] = [];

  constructor(private service: CommonService, private socketService: SocketService, private translate: TranslateService, private toastr: NzMessageService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    effect(() => {
      this.appointmentData = this.service._appointmentData();
      if (this.appointmentData) {
        this.getRecommendedTreatments(this.appointmentData.doctor_id)
      }
    });
  }

  ngOnInit(): void {
    this.socketService.onAppoinmentstart()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.appointmentData = res;
        this.service.isReloadAppointmentData.set(false);
        this.getRecommendedTreatments(res.doctor_id)
        document.getElementsByClassName('ct_video_call_right_sie_bar')[0].classList.add('show');
      });
  }

  getRecommendedTreatments(doctor_id: any) {
    this.service.get('doctor/get-recommended-treatments/' + doctor_id).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      this.recommendedTreatments = res.data;
    });
  }

  onAllCheckboxChange(event: any) {
    this.suggestedTreatment = [];
    if (event.target.checked) {
      this.recommendedTreatments.forEach((parentItem: any) => {
        if (parentItem.sub_treatments && parentItem.sub_treatments.length > 0) {
          this.suggestedTreatment.push({
            treatment_id: parentItem.treatment_id,
            price: parentItem.sub_treatments.reduce((total: any, sub: any) => total + Number(sub.price), 0) || parentItem.price,
            sub_treatments: parentItem.sub_treatments.map((sub: any) => {
              return {
                sub_treatment_id: sub.sub_treatment_id,
                price: Number(sub.price)
              }
            })
          });
        } else {
          this.suggestedTreatment.push({
            treatment_id: parentItem.treatment_id,
            price: parentItem.sub_treatments.reduce((total: any, sub: any) => total + Number(sub.price), 0) || parentItem.price,
            sub_treatments: []
          });
        }
      });
    }
    this.updateTotalAmount();
  }

  onParentCheckboxChange(parentItem: any, event: any) {
    if (event.target.checked) {
      this.suggestedTreatment.push({
        treatment_id: parentItem.treatment_id,
        price: parentItem.sub_treatments.reduce((total: any, sub: any) => total + Number(sub.price), 0) || parentItem.price,
        sub_treatments: parentItem.sub_treatments.map((sub: any) => {
          return {
            sub_treatment_id: sub.sub_treatment_id,
            price: Number(sub.price)
          }
        })
      })
    } else {
      this.suggestedTreatment = this.suggestedTreatment.filter((t: any) => t.treatment_id !== parentItem.treatment_id);
    }
    this.updateTotalAmount();
  }

  onSubCheckboxChange(subItem: any, parentItem: any, event: any) {
    if (event.target.checked) {
      if (!this.suggestedTreatment.some((t: any) => t.treatment_id === parentItem.treatment_id)) {
        this.suggestedTreatment.push({
          treatment_id: parentItem.treatment_id,
          price: Number(subItem.price),
          sub_treatments: [
            {
              sub_treatment_id: subItem.sub_treatment_id,
              price: Number(subItem.price),
            }
          ]
        });
      } else {
        this.suggestedTreatment = this.suggestedTreatment.map((t: any) => {
          if (t.treatment_id === parentItem.treatment_id) {
            t.price += Number(subItem.price);
            t.sub_treatments.push({
              sub_treatment_id: subItem.sub_treatment_id,
              price: Number(subItem.price),
            });
          }
          return t;
        });
      }
    } else {
      this.suggestedTreatment = this.suggestedTreatment.filter((t: any) => {
        if (t.treatment_id === parentItem.treatment_id) {
          t.price -= Number(subItem.price);
          t.sub_treatments = t.sub_treatments.filter((sub: any) => sub.sub_treatment_id !== subItem.sub_treatment_id);
          return t.sub_treatments.length > 0;
        }
        return true;
      });
    }
    this.updateTotalAmount();
  }

  private updateTotalAmount() {
    this.totalAmount = this.suggestedTreatment.reduce((total: any, item: any) => total + Number(item.price), 0);
    this.discountAmount = this.totalAmount * (this.discount / 100);
    this.netAmount = this.totalAmount - this.discountAmount;
  }

  isIndeterminate() {
    return (
      this.suggestedTreatment.length > 0 &&
      this.suggestedTreatment.length < this.recommendedTreatments.length
    );
  }

  isParentIndeterminate(item: any) {
    const parent = this.recommendedTreatments.find((t: any) => t.treatment_id === item.treatment_id);
    if (!parent) return false;
    const subTreatments = parent.sub_treatments || [];
    const selectedSubs = subTreatments.filter((sub: any) => this.isSubChecked(sub, item));
    return selectedSubs.length > 0 && selectedSubs.length < subTreatments.length;
  }

  isAllSelected() {
    return (
      this.suggestedTreatment.length === this.recommendedTreatments.length &&
      this.recommendedTreatments.length > 0
    );
  }

  isChecked(item: any) {
    const isDirectlySelected = this.suggestedTreatment.some(
      (t: any) => t.treatment_id === item.treatment_id && (item.parent_id ? t.parent_id === item.parent_id : !t.parent_id)
    );

    if (isDirectlySelected) {
      return true;
    }

    const parent = this.recommendedTreatments.find((t: any) => t.treatment_id === item.treatment_id);
    if (parent && parent.sub_treatments && parent.sub_treatments.length > 0) {
      return parent.sub_treatments.every((sub: any) =>
        this.suggestedTreatment.some((t: any) => t.treatment_id === sub.treatment_id && t.parent_id === parent.treatment_id)
      );
    }
    return false;
  }

  isSubChecked(item: any, parentItem: any) {
    const parent = this.suggestedTreatment.find((t: any) => t.treatment_id === parentItem.treatment_id);
    if (!parent) return false;
    return parent.sub_treatments.some((sub: any) => sub.sub_treatment_id === item.sub_treatment_id);
  }

  errorMessage: string = '';
  calculateDiscount() {
    this.errorMessage = '';

    if (!this.discount || this.totalAmount === null) {
      this.discountAmount = 0;
      this.netAmount = this.totalAmount ?? 0;
      return;
    }

    if (this.discountType === 'SEK' && this.discount > this.totalAmount) {
      this.errorMessage = 'Discount amount cannot exceed total amount.';
      this.discount = this.totalAmount;
    }

    if (this.discountType === 'PERCENTAGE' && this.discount > 100) {
      this.errorMessage = 'Discount percentage cannot exceed 100%.';
      this.discount = 100;
    }

    if (this.discountType === 'SEK') {
      this.discountAmount = this.discount;
    } else {
      this.discountAmount = (this.totalAmount * this.discount) / 100;
    }

    this.netAmount = this.totalAmount - this.discountAmount;

    if (this.netAmount < 0) {
      this.netAmount = 0;
    }
  }

  toggleDiscount(event: any) {
    if (!this.isApplyDiscount) {
      this.discount = 0;
      this.discountAmount = 0;
      this.netAmount = this.totalAmount;
    }
  }

  suggestTreatments() {
    this.loading = true
    let formData = {
      user_id: this.appointmentData.user_id,
      clinic_id: this.appointmentData.clinic_id,
      report_id: this.appointmentData.report_id,
      origin_appointment_id: this.appointmentData.appointment_id,
      discount_type: this.discountType,
      discount_value: this.discount,
      treatments: this.suggestedTreatment
    }
    this.service.post('doctor/appointment-draft', formData).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      if (this.service.isReloadAppointmentData()) {
        this.service.isReloadSuggestedTreatments.set(true);
        this.toastr.success(res.message);
      }
      this.closeVideoRightSidebar()
      this.suggestedTreatment = [];
      this.discount = 0;
      this.discountAmount = 0;
      this.netAmount = 0;
      this.discountType = 'SEK';
      this.isApplyDiscount = false;
      this.totalAmount = 0;
      this.errorMessage = '';
      this.loading = false
    }, error => {
      this.loading = false
    })
  }

  closeVideoRightSidebar() {
    document.getElementsByClassName('ct_video_call_right_sie_bar')[0].classList.remove('show');
    const element = document.getElementsByClassName('H6djxujDyBWSH05jmS1c')[0] as HTMLElement;
    const element2 = document.getElementsByClassName('BYpXSnOHfrC2td4QRijO')[0] as HTMLElement;
    if (element) {
      element.style.setProperty('width', '100vw', 'important');
    }
    if (element2) {
      element2.style.setProperty('width', '100vw', 'important');
    }
  }

  toggleRecommendedCollapse(recommendedCollapseStates: boolean[], index: number) {
    recommendedCollapseStates[index] = !recommendedCollapseStates[index];
  }
}

export interface Treatment {
  treatment_id: string;
  price: number;
  sub_treatments: subTreatment[];
}

export interface subTreatment {
  sub_treatment_id: string;
  price: number;
}