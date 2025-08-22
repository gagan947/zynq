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

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const baseUrl = params['redirect_url'];
      this.redirectUrl = baseUrl;
    });
  }


}
