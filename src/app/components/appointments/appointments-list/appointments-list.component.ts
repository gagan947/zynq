import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { AuthService } from '../../../services/auth.service';
import { LoaderService } from '../../../services/loader.service';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, NzDatePickerModule, FormsModule],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css',
})
export class AppointmentsListComponent {
  @ViewChild('date') date!: ElementRef<HTMLInputElement>;
  @ViewChild('search') search!: ElementRef<HTMLInputElement>;
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLInputElement>;
  private destroy$ = new Subject<void>();
  appointments$!: Observable<any>
  appointment: any;
  originalAppointments: any;
  status: string = '';
  type: string = '';
  searchTerm: string = '';
  selectedDate: string = '';
  allSlots: any;
  slotDate = new Date();
  slots: any = [];
  selectedSlot: any;
  appointment_id: any;
  userData: any
  loading: boolean = false
  constructor(private srevice: CommonService, public auth: AuthService, private router: Router, private route: ActivatedRoute, private loader: LoaderService, private toster: NzMessageService) {
  }

  ngOnInit(): void {
    this.getAppointments();
    this.userData = JSON.parse(localStorage.getItem('userInfo') || '{}');
    this.getAllSlots()
  }

  getAppointments() {
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

  getAllSlots() {
    this.srevice.get('doctor/future-slots').pipe(
      takeUntil(this.destroy$)
    ).subscribe((response: any) => {
      this.allSlots = response.data;
    })
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


  filterByType(event: any) {
    this.type = event.target.value;
    this.applyFilters();
  }

  applyFilters() {
    this.appointment = this.originalAppointments.filter((item: {
      type: string;
      full_name: string;
      clinic_name: string;
      start_time: string;
      status: string;
    }) => {
      const matchSearch =
        !this.searchTerm ||
        item.full_name?.toLowerCase().includes(this.searchTerm) ||
        item.clinic_name?.toLowerCase().includes(this.searchTerm);

      const matchDate =
        !this.selectedDate || item.start_time.includes(this.selectedDate);

      const matchStatus =
        !this.status || item.status === this.status;

      const matchType =
        !this.type || item.type === this.type;

      return matchSearch && matchDate && matchStatus && matchType;
    });
  }

  onChange(event: any) {
    let selectedDateStr: string;
    if (typeof event === 'string') {
      selectedDateStr = new Date(event).toISOString().split('T')[0];
    } else {
      selectedDateStr = event.toISOString().split('T')[0];
    }
    this.slots = this.allSlots.filter((slot: { start_time: string | number | Date; }) => {
      const slotDateStr = new Date(slot.start_time).toISOString().split('T')[0];
      return slotDateStr === selectedDateStr;
    });
  }

  selectSlot(slot: any) {
    if (slot.status === 'booked') {
      return
    } else {
      this.selectedSlot = slot
    }
  }

  schedule() {
    const formData = {
      appointment_id: this.appointment_id,
      doctor_id: this.userData.id,
      start_time: this.selectedSlot.start_time,
      end_time: this.selectedSlot.end_time,
    }
    this.loading = true
    this.srevice.update('doctor/appointment/reschedule', formData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        if (response.success == true) {
          this.loading = false
          this.closeButton.nativeElement.click();
          this.toster.success(response.message)
          this.getAppointments()
          this.getAllSlots()
        } else {
          this.loading = false
          this.toster.error(response.message)
        }
      },
      error: (error) => {
        this.loading = false
        this.toster.error(error)
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  convertTime(time: any): any {
    const localTime = new Date(time).toLocaleString();
    return localTime
  }

  exportTableToCSV() {
    const table = document.getElementById("myTable") as HTMLTableElement;
    if (this.appointment.length == 0) {
      this.toster.warning("No data found to export!");
      return;
    }

    let csv: string[] = [];

    for (let i = 0; i < table.rows.length; i++) {
      let row: string[] = [];
      const cols = table.rows[i].cells;

      for (let j = 0; j < cols.length; j++) {
        const headerText = table.rows[0].cells[j].innerText.trim();
        if (headerText === 'Action') {
          continue;
        }
        row.push('"' + cols[j].innerText.replace(/"/g, '""') + '"');
      }

      csv.push(row.join(","));
    }
    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    const downloadLink = document.createElement("a");
    downloadLink.download = "Appointments.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
  }
}
