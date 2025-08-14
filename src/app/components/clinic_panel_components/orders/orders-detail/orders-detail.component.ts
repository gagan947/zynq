import { Component, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SocketService } from '../../../../services/socket.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../../../services/common.service';
import { LoaderService } from '../../../../services/loader.service';
import { ZegoService } from '../../../../services/zego.service';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-orders-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-detail.component.html',
  styleUrl: './orders-detail.component.css'
})
export class OrdersDetailComponent {
  private destroy$ = new Subject<void>();
  orderId = this.service._order;
  orderData: any
  constructor(private service: CommonService, public location: Location, private zegoService: ZegoService, private loader: LoaderService, private router: Router, private route: ActivatedRoute, private socketService: SocketService) {
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
