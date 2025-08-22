import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommonService } from '../../services/common.service';
import { LoaderService } from '../../services/loader.service';
import { CommonModule } from '@angular/common';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-ratings-reviews',
  standalone: true,
  imports: [CommonModule, NzRateModule, FormsModule],
  templateUrl: './ratings-reviews.component.html',
  styleUrl: './ratings-reviews.component.css'
})
export class RatingsReviewsComponent {
  @ViewChild('date') date!: ElementRef<HTMLInputElement>;
  @ViewChild('search') search!: ElementRef<HTMLInputElement>;
  ratingReviews$!: Observable<any>
  ratingReviewsList: any;
  orgRatingReviewsList: any;
  searchTerm: string = '';
  selectedDate: string = '';
  feedbackDetail: any
  constructor(private srevice: CommonService, public auth: AuthService, private router: Router, private route: ActivatedRoute, private loader: LoaderService, private toster: NzMessageService) {
  }

  ngOnInit(): void {
    this.loader.show();
    this.ratingReviews$ = this.srevice.get('doctor/reviews-ratings').pipe(
      tap((response: any) => {
        this.ratingReviewsList = response.data;
        this.orgRatingReviewsList = response.data;
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
    this.selectedDate = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters() {
    this.ratingReviewsList = this.orgRatingReviewsList.filter((item: {
      full_name: string;
      created_at: string;
    }) => {
      const matchSearch =
        !this.searchTerm ||
        item.full_name?.toLowerCase().includes(this.searchTerm)
      const matchDate =
        !this.selectedDate || item.created_at?.includes(this.selectedDate);
      return matchSearch && matchDate
    });
  }

  exportTableToCSV() {
    const table = document.getElementById("myTable") as HTMLTableElement;
    if (this.ratingReviewsList.length == 0) {
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
    downloadLink.download = "Ratings-&-Reviews.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
  }
}
