import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { SupportTicket, SupportTicketResponse } from '../../../../models/tikets';
import { LoaderService } from '../../../../services/loader.service';
import { NzMessageService } from 'ng-zorro-antd/message';
@Component({
  selector: 'app-tikets-list',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './tikets-list.component.html',
  styleUrl: './tikets-list.component.css'
})
export class TiketsListComponent {
  tickets$!: Observable<SupportTicketResponse>
  tickets: SupportTicket[] = [];
  originalTickets: SupportTicket[] = [];
  activeTab: string = '';
  @ViewChild('date') date!: ElementRef<HTMLInputElement>;
  @ViewChild('search') search!: ElementRef<HTMLInputElement>;

  constructor(private srevice: CommonService, public auth: AuthService, private router: Router, private route: ActivatedRoute, private loader: LoaderService, private toster: NzMessageService) {
    this.activeTab = sessionStorage.getItem('activeTab') || '';
    // this.loader.show();
    if (this.auth.getRoleName() == 'doctor' && this.activeTab == '' || this.activeTab == 'admin') {
      this.tickets$ = this.srevice.get<SupportTicketResponse>(`doctor/get-support-tickets-by-doctor-id`).pipe(
        tap((response: SupportTicketResponse) => {
          this.tickets = response.data;
          this.originalTickets = response.data;
          this.loader.hide();
        }, error => {
          this.loader.hide();
        }),
      )
    } else if (this.auth.getRoleName() == 'clinic' && this.activeTab == '' || this.activeTab == 'me' || this.auth.getRoleName() == 'solo-doctor') {
      this.tickets$ = this.srevice.get<SupportTicketResponse>(`clinic/get-support-tickets`).pipe(
        tap((response: SupportTicketResponse) => {
          this.tickets = response.data;
          this.originalTickets = response.data;
          this.loader.hide();
        }, error => {
          this.loader.hide();
        })
      );
    } else if (this.auth.getRoleName() == 'clinic' && this.activeTab == 'doctor') {
      this.tickets$ = this.srevice.get<SupportTicketResponse>(`clinic/get-support-tickets-to-clinic`).pipe(
        tap((response: SupportTicketResponse) => {
          this.tickets = response.data;
          this.originalTickets = response.data;
          this.loader.hide();
        }, error => {
          this.loader.hide();
        })
      );
    } else if (this.auth.getRoleName() == 'doctor' && this.activeTab == 'clinic') {
      this.tickets$ = this.srevice.get<SupportTicketResponse>(`doctor/get-support-tickets-by-doctor-id-to-clinic`).pipe(
        tap((response: SupportTicketResponse) => {
          this.tickets = response.data;
          this.originalTickets = response.data;
          this.loader.hide();
        }, error => {
          this.loader.hide();
        })
      );
    }
  }

  viewTicket(ticket: SupportTicket) {
    this.srevice._supportTicket.set(ticket);
    sessionStorage.setItem('supportTicket', JSON.stringify(ticket));
    this.router.navigate(['detail'], { relativeTo: this.route });
  }

  filterBy(type: string) {
    this.activeTab = type;
    sessionStorage.setItem('activeTab', this.activeTab);
    this.loader.show();
    this.search.nativeElement.value = '';
    this.date.nativeElement.value = '';
    if (type == 'admin') {
      this.tickets$ = this.srevice.get<SupportTicketResponse>(`doctor/get-support-tickets-by-doctor-id`).pipe(
        tap((response: SupportTicketResponse) => {
          this.tickets = response.data;
          this.originalTickets = response.data;
          this.loader.hide();
        }, error => {
          this.loader.hide();
        })
      );
    } else if (type == 'clinic') {
      this.tickets$ = this.srevice.get<SupportTicketResponse>(`doctor/get-support-tickets-by-doctor-id-to-clinic`).pipe(
        tap((response: SupportTicketResponse) => {
          this.tickets = response.data;
          this.originalTickets = response.data;
          this.loader.hide();
        }, error => {
          this.loader.hide();
        })
      );
    } else if (type == 'doctor') {
      this.tickets$ = this.srevice.get<SupportTicketResponse>(`clinic/get-support-tickets-to-clinic`).pipe(
        tap((response: SupportTicketResponse) => {
          this.tickets = response.data;
          this.originalTickets = response.data;
          this.loader.hide();
        }, error => {
          this.loader.hide();
        })
      );
    } else if (type == 'me') {
      this.tickets$ = this.srevice.get<SupportTicketResponse>(`clinic/get-support-tickets`).pipe(
        tap((response: SupportTicketResponse) => {
          this.tickets = response.data;
          this.originalTickets = response.data;
          this.loader.hide();
        }, error => {
          this.loader.hide();
        })
      );
    }
  }

  searchTickets(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    if (searchTerm) {
      this.tickets = this.originalTickets.filter(ticket =>
        (ticket.issue_title.toLowerCase().includes(searchTerm) || ticket.clinic?.clinic_name.toLowerCase().includes(searchTerm) || ticket.doctor?.name.toLowerCase().includes(searchTerm) || ticket.clinic?.email.toLowerCase().includes(searchTerm) || ticket.doctor?.email.toLowerCase().includes(searchTerm)) && ticket.created_at.includes(this.date.nativeElement.value)
      );
    } else if (this.date.nativeElement.value) {
      this.tickets = this.originalTickets.filter(ticket => ticket.created_at.includes(this.date.nativeElement.value));
    } else {
      this.tickets = [...this.originalTickets];
    }
  }

  filterByDate(event: Event) {
    const date = (event.target as HTMLInputElement).value;
    if (date) {
      this.tickets = this.originalTickets.filter(ticket => (ticket.created_at.includes(date) && (ticket.issue_title.toLowerCase().includes(this.search.nativeElement.value.toLowerCase()) || ticket.clinic?.clinic_name.toLowerCase().includes(this.search.nativeElement.value.toLowerCase()) || ticket.doctor?.name.toLowerCase().includes(this.search.nativeElement.value.toLowerCase()) || ticket.clinic?.email.toLowerCase().includes(this.search.nativeElement.value.toLowerCase()) || ticket.doctor?.email.toLowerCase().includes(this.search.nativeElement.value.toLowerCase()))));
    } else if (this.search.nativeElement.value) {
      this.tickets = this.originalTickets.filter(ticket => ticket.issue_title.toLowerCase().includes(this.search.nativeElement.value.toLowerCase()) || ticket.clinic?.clinic_name.toLowerCase().includes(this.search.nativeElement.value.toLowerCase()) || ticket.doctor?.name.toLowerCase().includes(this.search.nativeElement.value.toLowerCase()) || ticket.clinic?.email.toLowerCase().includes(this.search.nativeElement.value.toLowerCase()) || ticket.doctor?.email.toLowerCase().includes(this.search.nativeElement.value.toLowerCase()));
    } else {
      this.tickets = [...this.originalTickets];
    }
  }

  exportTableToCSV() {
    const table = document.getElementById("myTable") as HTMLTableElement;

    if (this.tickets.length == 0) {
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
    downloadLink.download = "Help-&-Support.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
  }
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   