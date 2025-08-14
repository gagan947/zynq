import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../../../services/common.service';
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderService } from '../../../../services/loader.service';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [CommonModule, NzSelectModule, FormsModule],
  templateUrl: './orders-management.component.html',
  styleUrl: './orders-management.component.css'
})
export class OrdersManagementComponent {
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  private destroy$ = new Subject<void>();
  ordersList: any[] = [];
  shipmentStatus: any;
  purchaseId: number | null = null
  loading: boolean = false
  constructor(private service: CommonService, private toster: NzMessageService, private router: Router, private route: ActivatedRoute, private loader: LoaderService) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.loader.show()
    this.service.get('doctor/payments/get-purchased-products').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.ordersList = res.data.products;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
