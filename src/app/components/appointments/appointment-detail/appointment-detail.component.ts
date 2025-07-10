import { Component, effect } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { CommonModule, Location } from '@angular/common';
import { ZegoService } from '../../../services/zego.service';
import { LoaderService } from '../../../services/loader.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './appointment-detail.component.html',
  styleUrl: './appointment-detail.component.css'
})
export class AppointmentDetailComponent {
  appointment = this.service._Appointment;
  appointmentData: any;
  imagePreview: string = 'assets/img/doctor.png';
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

  getAppointmentDetails() {
    this.loader.show()
    this.service.post('doctor/getMyAppointmentById', { appointment_id: this.appointment() }).subscribe((res: any) => {
      this.appointmentData = res.data;
      this.loader.hide()
    }, error => {
      this.loader.hide()
    });
  }

  openChat(chatId: number) {
    this.socketService.setChatId(+chatId);
    // this.router.navigate(['../../chat-management']);
    this.router.navigate(['../../chat-management'], {  relativeTo: this.route });
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
    const withoutPrefix = fileName.replace(/^[^-]+-/, ''); // Remove prefix before hyphen
    return withoutPrefix.replace(/_\d{8}_\d{6}\.pdf$/, '.pdf'); // Remove timestamp before .pdf
  }
}
