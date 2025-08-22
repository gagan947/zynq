import { Component } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { LoaderService } from '../../../services/loader.service';
import { ZegoService } from '../../../services/zego.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solo-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solo-dashboard.component.html',
  styleUrl: './solo-dashboard.component.css'
})
export class SoloDashboardComponent {
  appointments$!: Observable<any>
  appointment: any;
  date = new Date();
  dashboardData: any;
  private destroy$ = new Subject<void>();
  constructor(private socketService: SocketService, private loader: LoaderService, private srevice: CommonService, private zegoService: ZegoService, private router: Router, private route: ActivatedRoute) {
    this.socketService.userConnected();
  }

  ngOnInit(): void {
    this.getAppointments();
    this.getData();
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
    this.router.navigate(['/solo-doctor/appointments/details'], { relativeTo: this.route });
  }

  getData() {
    this.loader.show()
    this.srevice.get('doctor/dashboard').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.dashboardData = res.data;
      this.loader.hide()
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
