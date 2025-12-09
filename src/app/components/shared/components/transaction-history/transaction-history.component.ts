import { Component, ElementRef, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { CommonService } from '../../../../services/common.service';
import { LoaderService } from '../../../../services/loader.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.css'
})
export class TransactionHistoryComponent {
  @ViewChild('date') date!: ElementRef<HTMLInputElement>;
  @ViewChild('search') search!: ElementRef<HTMLInputElement>;
  ratingReviews$!: Observable<any>
  faqList: any;
  orgFaqList: any;
  searchTerm: string = '';
  selectedCategory: string = '';
  feedbackDetail: any;
  roleName: string | null = null;
  totalAmount: number = 0;
  constructor(private srevice: CommonService, public auth: AuthService, private loader: LoaderService, private toster: NzMessageService, private authService: AuthService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    this.roleName = this.authService.getRoleName();
  }

  ngOnInit(): void {
    this.loader.show();
    this.ratingReviews$ = this.srevice.get('doctor/wallet-history').pipe(
      tap((response: any) => {
        this.faqList = response.data;
        this.orgFaqList = response.data;
        this.totalAmount = this.orgFaqList.reduce((total: number, item: any) => Number(total) + Number(item.amount), 0);
        this.loader.hide();
      }, error => {
        this.loader.hide();
      })
    );
  }


  searchFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.applyFilters();
  }

  filterByDate(event: Event) {
    this.selectedCategory = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters() {
    this.faqList = this.orgFaqList.filter((item: any) => {
      const matchSearch =
        !this.searchTerm ||
        item.details?.user?.name?.toLowerCase().includes(this.searchTerm) || item.details?.user_name?.toLowerCase().includes(this.searchTerm)
      const matchDate =
        !this.selectedCategory || item.order_type?.includes(this.selectedCategory);
      return matchSearch && matchDate
    });
  }

  filterByType(event: Event) {
    this.selectedCategory = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  exportTableToCSV() {
    const table = document.getElementById("myTable") as HTMLTableElement;
    if (this.faqList.length == 0) {
      this.toster.warning(this.translate.instant("No data found to export!"));
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
    downloadLink.download = "Transactions.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
  }
}
