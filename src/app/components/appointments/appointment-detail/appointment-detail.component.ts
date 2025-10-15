import { Component, effect } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { CommonModule, Location } from '@angular/common';
import { ZegoService } from '../../../services/zego.service';
import { LoaderService } from '../../../services/loader.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SocketService } from '../../../services/socket.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-detail.component.html',
  styleUrl: './appointment-detail.component.css'
})
export class AppointmentDetailComponent {
  private destroy$ = new Subject<void>();
  appointment = this.service._Appointment;
  appointmentData: any;
  imagePreview: string = 'assets/img/np_pro.jpg';
  recommendedTreatments: any = [];
  suggestedTreatment: any = [];
  isApplyDiscount: boolean = false;
  discountType: string = 'SEK';
  totalAmount: number = 0;
  discountAmount: number = 0;
  netAmount: number = 0;
  discount: number = 0;
  loading: boolean = false
  constructor(private service: CommonService, public location: Location, private zegoService: ZegoService, private loader: LoaderService, private router: Router, private route: ActivatedRoute, private socketService: SocketService) {
    effect(() => {
      this.appointment();
    });
    if (!this.appointment()) {
      this.service._Appointment.set(JSON.parse(sessionStorage.getItem('Appointment') || ''));
    }
  }

  ngOnInit(): void {
    this.getAppointmentDetails()

  }
  openModal(imageUrl: string | undefined) {
    if (imageUrl) {
      this.imagePreview = imageUrl
    }
  }

  async startCall(appointment_id: string) {
    const targetUser = {
      userID: this.appointmentData.user_id.replace(/-/g, ''), userName: this.appointmentData.full_name,
    };
    this.zegoService.sendCall(targetUser, appointment_id);
  }

  getRecommendedTreatments(user_id: any) {
    this.service.get('doctor/get-recommended-treatments/' + user_id).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      this.recommendedTreatments = res.data;
    });
  }

  onAllCheckboxChange(event: any) {
    if (event.target.checked) {
      this.suggestedTreatment = this.recommendedTreatments.map((item: any) => ({
        treatment_id: item.treatment_id,
        price: item.max_price
      }));
    } else {
      this.suggestedTreatment = [];
    }

    this.totalAmount = this.netAmount = this.suggestedTreatment.reduce((total: number, _item: any) => total + Number(_item.price), 0);
  }

  onCheckboxChange(item: any, event: any) {
    if (event.target.checked) {
      this.suggestedTreatment.push({
        treatment_id: item.treatment_id,
        price: item.max_price
      });
    } else {
      this.suggestedTreatment = this.suggestedTreatment.filter(
        (t: any) => t.treatment_id !== item.treatment_id
      );
    }

    this.totalAmount = this.netAmount = this.suggestedTreatment.reduce((total: number, _item: any) => total + Number(_item.price), 0);
  }

  isIndeterminate() {
    return (
      this.suggestedTreatment.length > 0 &&
      this.suggestedTreatment.length < this.recommendedTreatments.length
    );
  }

  isAllSelected() {
    return (
      this.suggestedTreatment.length === this.recommendedTreatments.length &&
      this.recommendedTreatments.length > 0
    );
  }

  isChecked(item: any) {
    return this.suggestedTreatment.some(
      (t: any) => t.treatment_id === item.treatment_id
    );
  }


  calculateDiscount() {
    if (!this.discount || this.totalAmount === null) {
      this.discountAmount = 0;
      this.netAmount = this.totalAmount;
      return;
    }

    if (this.discountType === 'SEK') {
      this.discountAmount = this.discount;
      this.netAmount = this.totalAmount - this.discountAmount;
    } else {
      this.discountAmount = (this.totalAmount * this.discount) / 100;
      this.netAmount = this.totalAmount - this.discountAmount;
    }

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
      discount_type: this.discountType,
      discount_value: this.discountAmount,
      treatments: this.suggestedTreatment
    }
    this.service.post('doctor/appointment-draft', formData).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      this.closeVideoRightSidebar()
      this.loading = false
    }, error => {
      this.loading = false
    })
  }
  getAppointmentDetails() {
    this.loader.show()
    this.service.post('doctor/getMyAppointmentById', { appointment_id: this.appointment() }).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      this.appointmentData = res.data;
      this.loader.hide()
      this.getRecommendedTreatments(this.appointmentData.user_id)
    }, error => {
      this.loader.hide()
    });
  }

  openChat(chatId: number) {
    this.socketService.setChatId(+chatId);
    this.router.navigate(['../../chat-management'], { relativeTo: this.route });
  }

  downloadPDF(pdfUrl: string) {
    const fileName = this.getCleanFileName(pdfUrl);
    fetch(pdfUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  getCleanFileName(pdfUrl: string): string {
    if (!pdfUrl) return '';
    const fileName = pdfUrl.split('/').pop() || '';
    const withoutPrefix = fileName.replace(/^[^-]+-/, '');
    return withoutPrefix.replace(/_\d{8}_\d{6}\.pdf$/, '.pdf');
  }
  closeVideoRightSidebar() {
    document.getElementsByClassName('ct_video_call_right_sie_bar')[0].classList.remove('show');
    const element = document.getElementsByClassName('H6djxujDyBWSH05jmS1c')[0] as HTMLElement;
    element.style.setProperty('width', '100vw', 'important');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
