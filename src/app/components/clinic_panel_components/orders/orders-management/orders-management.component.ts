import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../../../services/common.service';
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from '../../../../services/loader.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [CommonModule, NzSelectModule, FormsModule, TranslateModule],
  templateUrl: './orders-management.component.html',
  styleUrl: './orders-management.component.css'
})
export class OrdersManagementComponent {
  @ViewChild('date') date!: ElementRef<HTMLInputElement>;
  @ViewChild('search') search!: ElementRef<HTMLInputElement>;
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  private destroy$ = new Subject<void>();
  ordersList: any[] = [];
  shipmentStatus: any;
  purchaseId: number | null = null
  loading: boolean = false
  originalAppointments: any[] = [];
  status: string = '';
  type: string = '';
  searchTerm: string = '';
  selectedDate: string = '';
  constructor(private service: CommonService, private toster: NzMessageService, private router: Router, private route: ActivatedRoute, private loader: LoaderService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.loader.show()
    this.service.get('doctor/payments/get-purchased-products').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.ordersList = this.originalAppointments = res.data.products;
      this.loader.hide()
    });
  }

  editOrder(item: any) {
    this.shipmentStatus = item.shipment_status
    this.purchaseId = item.purchase_id
  }

  viewOrder(item: any) {
    this.service._order.set(item.purchase_id);
    sessionStorage.setItem('order', JSON.stringify(item.purchase_id));
    this.router.navigate(['detail'], { relativeTo: this.route });
  }

  searchFilter(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.applyFilters();
  }

  filterByDate(event: Event) {
    this.selectedDate = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }


  filterByStatus(event: any) {
    this.status = event.target.value;
    this.applyFilters();
  }

  applyFilters() {
    this.ordersList = this.originalAppointments.filter((item: any) => {
      const matchSearch =
        !this.searchTerm ||
        item.user.name?.toLowerCase().includes(this.searchTerm)

      const matchDate =
        !this.selectedDate || item.purchase_date.includes(this.selectedDate);

      const matchStatus =
        !this.status || item.shipment_status === this.status;

      return matchSearch && matchDate && matchStatus;
    });
  }

  updateShipmentStatus() {
    this.loading = true
    let formdata = {
      purchase_id: this.purchaseId?.toString(),
      shipment_status: this.shipmentStatus
    }
    this.service.update('clinic/update-shipment-status', formdata).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.getData();
          this.closeButton.nativeElement.click();
          this.purchaseId = null
          this.loading = false
        } else {
          this.toster.error(res.message)
          this.loading = false
        }
      },
      error: (err: any) => {
        this.toster.error(err)
        this.loading = false
      }
    });
  }

  getBgColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return '#FFECB3';
      case 'SHIPPED':
        return '#BBDEFB';
      case 'DELIVERED':
        return '#C8E6C9';
      default:
        return '#FFFFFF';
    }
  }

  getTextColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return '#EF6C00';
      case 'SHIPPED':
        return '#1565C0';
      case 'DELIVERED':
        return '#2E7D32';
      default:
        return '#000000';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  exportTableToCSV() {
    const table = document.getElementById("myTable") as HTMLTableElement;
    if (this.ordersList.length == 0) {
      this.toster.warning(this.translate.instant("No data found to export!"));
      return;
    }

    let csv: string[] = [];

    for (let i = 0; i < table.rows.length; i++) {
      let row: string[] = [];
      const cols = table.rows[i].cells;

      for (let j = 0; j < cols.length; j++) {
        const headerText = table.rows[0].cells[j].innerText.trim();
        if (headerText === 'Action' || headerText === 'Product Image') {
          continue;
        }
        row.push('"' + cols[j].innerText.replace(/"/g, '""') + '"');
      }

      csv.push(row.join(","));
    }
    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    const downloadLink = document.createElement("a");
    downloadLink.download = "Orders.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
  }
}
