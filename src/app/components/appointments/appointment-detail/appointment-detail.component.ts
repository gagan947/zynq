import { Component, effect } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { CommonModule, Location } from '@angular/common';
import { ZegoService } from '../../../services/zego.service';
import { LoaderService } from '../../../services/loader.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
  constructor(private service: CommonService, public location: Location, private zegoService: ZegoService, private loader: LoaderService, private router: Router, private route: ActivatedRoute) {
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

  openChat(chatId: string) {
    this.router.navigate(['../../chat-management'], { queryParams: { chatId }, relativeTo: this.route });
  }
}
