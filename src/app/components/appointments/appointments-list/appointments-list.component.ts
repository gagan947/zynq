import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { AuthService } from '../../../services/auth.service';
import { LoaderService } from '../../../services/loader.service';
import { Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css'
})
export class AppointmentsListComponent {
  @ViewChild('date') date!: ElementRef<HTMLInputElement>;
  @ViewChild('search') search!: ElementRef<HTMLInputElement>;
  appointments$!: Observable<any>
  appointment: any;
  originalAppointments: any;
  status: string = '';
  searchTerm: string = '';
  selectedDate: string = '';
  constructor(private srevice: CommonService, public auth: AuthService, private router: Router, private route: ActivatedRoute, private loader: LoaderService) {
  }

  ngOnInit(): void {
    this.loader.show();
    this.appointments$ = this.srevice.get('doctor/getMyAppointments').pipe(
      tap((response: any) => {
        this.appointment = response.data;
        this.originalAppointments = response.data;
        this.filterByStatus('Scheduled');
        this.loader.hide();
      }, error => {
        this.loader.hide();
      })
    );
  }


  viewDetails(item: any) {
    this.srevice._Appointment.set(item.appointment_id);
    sessionStorage.setItem('Appointment', JSON.stringify(item.appointment_id));
    this.router.navigate(['details'], { relativeTo: this.route });
  }

  searchFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.applyFilters();
  }

  filterByDate(event: Event) {
    this.selectedDate = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  filterByStatus(status: string) {
    this.status = status;
    this.applyFilters();
  }

  applyFilters() {
    this.appointment = this.originalAppointments.filter((item: {
      full_name: string;
      clinic_name: string;
      start_time: string;
      status: string;
    }) => {
      const matchSearch =
        !this.searchTerm ||
        item.full_name.toLowerCase().includes(this.searchTerm) ||
        item.clinic_name?.toLowerCase().includes(this.searchTerm);

      const matchDate =
        !this.selectedDate || item.start_time.includes(this.selectedDate);

      const matchStatus =
        !this.status || item.status === this.status;

      return matchSearch && matchDate && matchStatus;
    });
  }
}
