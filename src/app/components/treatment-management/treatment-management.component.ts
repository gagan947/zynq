import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Product } from '../../models/products';
import { Observable, tap } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoaderService } from '../../services/loader.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-treatment-management',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './treatment-management.component.html',
  styleUrl: './treatment-management.component.css'
})
export class TreatmentManagementComponent {
  treatmentList$!: Observable<any>
  treatmentId: string | undefined;
  treatmentList: any[] = [];
  orgTreatmentsList: any[] = [];
  status: string = '';
  type: number | null = null;
  imagePreview: string = 'assets/img/np_pro.jpg';
  searchTerm: string = '';
  userId: any;
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  constructor(private service: CommonService, private toster: NzMessageService, private loader: LoaderService,
    private translate: TranslateService,
    private authService: AuthService
  ) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    this.userId = this.authService.getUserInfo().id;
  }

  ngOnInit(): void {
    this.getProductList()
  }

  getProductList() {
    this.loader.show();
    this.treatmentList$ = this.service.get('doctor/get-all-treatments').pipe(tap((resp: any) => {
      if (resp.success) {
        this.orgTreatmentsList = resp.data.ALL;
        this.treatmentList = [...this.orgTreatmentsList];
        this.loader.hide();
      }
    }));
  }

  opanDeleteModal(treatmentId: string) {
    this.treatmentId = treatmentId;
  }

  deleteTreatment() {
    this.loader.show();
    this.service.delete<any>(`clinic/treatment/${this.treatmentId}`).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.toster.success(resp.message)
          this.getProductList()
          this.closeButton.nativeElement.click();
          this.treatmentId = undefined;
          this.loader.hide();
        } else {
          this.toster.error(resp.message)
          this.loader.hide();
        }
      },
      error: (error) => {
        this.toster.error(error);
        this.loader.hide();
      }
    })
  }

  openModal(imageUrl: string | undefined) {
    if (imageUrl) {
      this.imagePreview = imageUrl
    }
  }


  getBgColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return '#FFECB3';
      case 'APPROVED':
        return '#C8E6C9';
      case 'REJECTED':
        return '#FFCDD2';
      default:
        return '#FFFFFF';
    }
  }

  getTextColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return '#EF6C00';
      case 'APPROVED':
        return '#2E7D32';
      case 'REJECTED':
        return '#D32F2F';
      default:
        return '#000000';
    }
  }

  filterByStatus(event: any) {
    this.status = event.target.value;
    this.applyFilters();
  }


  // filterByType(event: any) {
  //   this.type = event.target.value;
  //   this.applyFilters();
  // }

  search(event: any) {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.applyFilters();
  }

  applyFilters() {
    this.treatmentList = this.orgTreatmentsList.filter((item: Product) => {
      const matchSearch =
        !this.searchTerm ||
        item.name?.toLowerCase().includes(this.searchTerm)

      const matchStatus =
        !this.status || item.approval_status == this.status;

      return matchSearch && matchStatus;
    });
  }

  exportTableToCSV() {
    const table = document.getElementById("myTable") as HTMLTableElement;
    if (this.treatmentList.length == 0) {
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
    downloadLink.download = "Treatments.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
  }
}
