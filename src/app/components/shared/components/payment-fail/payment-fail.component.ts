import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-fail',
  standalone: true,
  imports: [],
  templateUrl: './payment-fail.component.html',
  styleUrl: './payment-fail.component.css'
})
export class PaymentFailComponent {

  redirectUrl: any;
  countdown: number = 5;
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const baseUrl = params['redirect_url'];
      this.redirectUrl = baseUrl;

      this.startCountdown();
    });
  }

  startCountdown() {
    const interval = setInterval(() => {
      this.countdown--;

      if (this.countdown === 0) {
        clearInterval(interval);
        window.location.href = this.redirectUrl;
      }
    }, 1000);
  }

}
