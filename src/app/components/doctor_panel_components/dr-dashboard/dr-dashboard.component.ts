import { Component } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { CommonService } from '../../../services/common.service';
import { ZegoService } from '../../../services/zego.service';
import { LoaderService } from '../../../services/loader.service';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './dr-dashboard.component.html',
  styleUrl: './dr-dashboard.component.css'
})
export class DrDashboardComponent {
  appointments$!: Observable<any>
  appointment: any;
  date = new Date();
  dashboardData: any;
  private destroy$ = new Subject<void>();
  constructor(private socketService: SocketService, private loader: LoaderService, private srevice: CommonService, private router: Router, private route: ActivatedRoute, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
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
    this.router.navigate(['/doctor/appointments/details'], { relativeTo: this.route });
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

