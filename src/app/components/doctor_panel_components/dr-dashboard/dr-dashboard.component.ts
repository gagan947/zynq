import { Component } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { CommonService } from '../../../services/common.service';
import { ZegoService } from '../../../services/zego.service';
import { LoaderService } from '../../../services/loader.service';
import { Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dr-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dr-dashboard.component.html',
  styleUrl: './dr-dashboard.component.css'
})
export class DrDashboardComponent {
  appointments$!: Observable<any>
  appointment: any;
  date = new Date();
  constructor(private socketService: SocketService, private loader: LoaderService, private srevice: CommonService, private zegoService: ZegoService, private router: Router, private route: ActivatedRoute) {
    this.socketService.userConnected();
  }

  ngOnInit(): void {
    this.getAppointments();
  }

  getAppointments() {
    this.loader.show();
    this.appointments$ = this.srevice.get('doctor/getMyAppointments').pipe(
      tap((response: any) => {
        this.appointment = response.data.filter((item: any) => new Date(item.start_time).toISOString().split('T')[0] === this.date.toISOString().split('T')[0]);
        this.loader.hide();
      }, error => {
        this.loader.hide();
      })
    );
  }

  viewDetails(item: any) {
    this.srevice._Appointment.set(item.appointment_id);
    sessionStorage.setItem('Appointment', JSON.stringify(item.appointment_id));
    this.router.navigate(['/doctor/appointments/details'], { relativeTo: this.route });
  }
}
