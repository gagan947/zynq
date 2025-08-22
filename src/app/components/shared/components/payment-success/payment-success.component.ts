import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent {

  redirectUrl: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      const appointmentId = params['appointment_id'];
      const baseUrl = params['redirect_url'];

      if (sessionId) {
        this.redirectUrl = `${baseUrl}?session_id=${sessionId}`;
        console.log(this.redirectUrl);
      } else if (appointmentId) {
        this.redirectUrl = `${baseUrl}?appointment_id=${appointmentId}`;
        console.log(this.redirectUrl);
      } else {
        this.redirectUrl = baseUrl;
      }
    });
  }


}
