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
  constructor(private srevice: CommonService, public auth: AuthService, private router: Router, private route: ActivatedRoute, private loader: LoaderService) {
  }

  ngOnInit(): void {
    this.loader.show();
    this.appointments$ = this.srevice.get('doctor/getMyAppointments').pipe(
      tap((response: any) => {
        this.appointment = response.data;
        this.originalAppointments = response.data;
        this.loader.hide();
      }, error => {
        this.loader.hide();
      })
    );
  }


  searchFilter(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (searchTerm) {
      this.appointment = this.originalAppointments.filter((item: { full_name: string; clinic_name: string; start_time: string | any[]; }) =>
      (item.full_name.toLowerCase().includes(searchTerm) || item.clinic_name?.toLowerCase().includes(searchTerm) && item.start_time.includes(this.date.nativeElement.value)
      ));
    } else if (this.date.nativeElement.value) {
      this.appointment = this.originalAppointments.filter((item: { start_time: string | string[]; }) => item.start_time.includes(this.date.nativeElement.value));
    } else {
      this.appointment = [...this.originalAppointments];
    }
  }

  filterByDate(event: Event) {
    const date = (event.target as HTMLInputElement).value;
    if (date) {
      this.appointment = this.originalAppointments.filter((item: { start_time: string | string[]; full_name: string; clinic_name: string }) => (item.start_time.includes(date) && (item.full_name.toLowerCase().includes(this.search.nativeElement.value.toLowerCase()) || item.clinic_name?.toLowerCase().includes(this.search.nativeElement.value.toLowerCase())
      )));
    } else if (this.search.nativeElement.value) {
      this.appointment = this.originalAppointments.filter((item: { full_name: string; clinic_name: string; start_time: string | string[]; }) => (item.full_name.toLowerCase().includes(this.search.nativeElement.value.toLowerCase()) || item.clinic_name?.toLowerCase().includes(this.search.nativeElement.value.toLowerCase())));
    } else {
      this.appointment = [...this.originalAppointments];
    }
  }

  viewDetails(item: any) {
    this.srevice._Appointment.set(item);
    sessionStorage.setItem('Appointment', JSON.stringify(item));
    this.router.navigate(['details'], { relativeTo: this.route });
  }
}
