import { Component, effect } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../../../services/common.service';
import { LoaderService } from '../../../../services/loader.service';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-orders-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './orders-detail.component.html',
  styleUrl: './orders-detail.component.css'
})
export class OrdersDetailComponent {
  private destroy$ = new Subject<void>();
  orderId = this.service._order;
  orderData: any
  constructor(private service: CommonService, public location: Location, private loader: LoaderService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    effect(() => {
      this.orderId();
    });
    if (!this.orderId()) {
      this.service._order.set(JSON.parse(sessionStorage.getItem('order') || ''));
    }
  }

  ngOnInit(): void {
    this.getOrderDetails()
  }

  getOrderDetails() {
    this.loader.show()
    this.service.get(`doctor/payments/get-purchased-products/${this.orderId()}`).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      this.orderData = res.data.products[0];
      this.loader.hide()
    }, error => {
      this.loader.hide()
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
