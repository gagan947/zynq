import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './orders-management.component.html',
  styleUrl: './orders-management.component.css'
})
export class OrdersManagementComponent {
  private destroy$ = new Subject<void>();

  constructor(private service: CommonService) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.service.get('doctor/payments/get-purchased-products').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      console.log(res);
    });
  }
}
