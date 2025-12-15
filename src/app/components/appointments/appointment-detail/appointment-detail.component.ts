import { Component, effect } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { CommonModule, Location } from '@angular/common';
import { ZegoService } from '../../../services/zego.service';
import { LoaderService } from '../../../services/loader.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SocketService } from '../../../services/socket.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SuggestTreatmentComponent } from '../suggest-treatment/suggest-treatment.component';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SuggestTreatmentComponent],
  templateUrl: './appointment-detail.component.html',
  styleUrl: './appointment-detail.component.css'
})
export class AppointmentDetailComponent {
  private destroy$ = new Subject<void>();
  appointment = this.service._Appointment;
  appointmentData: any;
  imagePreview: string = 'assets/img/np_pro.jpg';
  loading: boolean = false
  collapseStates: boolean[] = [];
  suggestedCollapseStates: boolean[] = [];
  isEditSuggestedTreatments: boolean = false;
  constructor(private service: CommonService, public location: Location, private zegoService: ZegoService, private loader: LoaderService, private router: Router, private route: ActivatedRoute, private socketService: SocketService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    effect(() => {
      this.appointment();
      if (this.service.isReloadSuggestedTreatments()) {
        this.getAppointmentDetails();
      }
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
    this.service.isReloadAppointmentData.set(true);
    this.zegoService.sendCall(targetUser, appointment_id);
  }

  getAppointmentDetails() {
    this.loader.show()
    this.service.post('doctor/getMyAppointmentById', { appointment_id: this.appointment() }).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      this.appointmentData = res.data;
      this.service._appointmentData.set(this.appointmentData);
      this.service.isReloadAppointmentData.set(true);
      this.service.isReloadSuggestedTreatments.set(false);
      this.isEditSuggestedTreatments = false;
      this.loader.hide()
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

  toggleCollapse(collapseStates: boolean[], index: number) {
    collapseStates[index] = !collapseStates[index];
  }

  suggestedToggleCollapse(suggestedCollapseStates: boolean[], index: number) {
    suggestedCollapseStates[index] = !suggestedCollapseStates[index];
  }

  calculateAmount(array: any[]) {
    return array.reduce((total: any, item: any) => total + Number(item.price), 0);
  }

  calculateVATAmount(amount: number) {
    return (amount * 25) / (100 + 25);
  }

  scrollToSuggestTreatment() {
    this.isEditSuggestedTreatments = true;
    setTimeout(() => {
      const element = document.getElementById('suggestTreatmentRef');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
