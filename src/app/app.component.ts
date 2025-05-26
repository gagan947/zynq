import { ChangeDetectorRef, Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LoaderService } from './services/loader.service';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'zynq-app';
  showLoader = false;
  private subscription!: Subscription;
  constructor(private router: Router, private loaderService: LoaderService, private cdr: ChangeDetectorRef, private notificationService: NotificationService) {
  }
  ngOnInit() {

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        this.notificationService.requestPermission()
      }
    });

    this.subscription = this.loaderService.showLoader$.subscribe(value => {
      this.showLoader = value;
      this.cdr.detectChanges();
    });
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.notificationService.listenForMessages();
        const existingScript = document.querySelector('script[src="assets/js/main.js"]');
        if (existingScript) {
          existingScript.remove();
        }
        const scriptElement = document.createElement('script');
        scriptElement.src = 'assets/js/main.js';
        scriptElement.async = true;
        document.body.appendChild(scriptElement);
      }
    });
  }
}
