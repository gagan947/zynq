import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { CommonService } from '../../../../services/common.service';
import { LoaderService } from '../../../../services/loader.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-list.component.html',
  styleUrl: './faq-list.component.css'
})
export class FaqListComponent {
  @ViewChild('date') date!: ElementRef<HTMLInputElement>;
  @ViewChild('search') search!: ElementRef<HTMLInputElement>;
  ratingReviews$!: Observable<any>
  categories$!: Observable<any>
  faqList: any;
  orgFaqList: any;
  searchTerm: string = '';
  selectedCategory: string = '';
  feedbackDetail: any
  constructor(private srevice: CommonService, public auth: AuthService, private router: Router, private route: ActivatedRoute, private loader: LoaderService, private toster: NzMessageService) {
  }

  ngOnInit(): void {
    this.loader.show();
    this.ratingReviews$ = this.srevice.post('doctor/get-all-faqs', {}).pipe(
      tap((response: any) => {
        this.faqList = response.data;
        this.orgFaqList = response.data;
        this.loader.hide();
      }, error => {
        this.loader.hide();
      })
    );

    this.categories$ = this.srevice.get('doctor/faq-categories').pipe(
      tap((response: any) => {
        this.loader.hide();
      }, error => {
        this.loader.hide();
      })
    );
  }

  openModal(item: any) {
    if (item) {
      this.feedbackDetail = item
    }
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
    this.faqList = this.orgFaqList.filter((item: {
      question: string;
      category: string;
    }) => {
      const matchSearch =
        !this.searchTerm ||
        item.question?.toLowerCase().includes(this.searchTerm)
      const matchDate =
        !this.selectedCategory || item.category?.includes(this.selectedCategory);
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
    downloadLink.download = "FAQ's.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
  }
}
