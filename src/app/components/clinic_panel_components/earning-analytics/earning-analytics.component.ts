import { Component } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-earning-analytics',
  standalone: true,
  imports: [],
  templateUrl: './earning-analytics.component.html',
  styleUrl: './earning-analytics.component.css'
})
export class EarningAnalyticsComponent {
  private destroy$ = new Subject<void>();

  constructor(private service: CommonService) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.service.get('doctor/payments/get-booked-appointments').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      console.log(res);
    });
  }
}
