import { Component, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
  providers: [DatePipe]
})
export class NotificationsComponent {
  @ViewChild('closeButton') closeButton: ElementRef<HTMLButtonElement> | undefined
  @ViewChild('closeButton2') closeButton2: ElementRef<HTMLButtonElement> | undefined
  notificationList = this.service._notifications
  loading: boolean = false
  private destroy$ = new Subject<void>();
  notificationId: any
  constructor(public service: CommonService, private datePipe: DatePipe, private router: Router, private route: ActivatedRoute, private toster: NzMessageService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    effect(() => {
      this.notificationList()
    })
  }

  formatDate(timestamp: string | Date): string {
    const date = new Date(timestamp); // ensure it's a Date object
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return this.datePipe.transform(date, 'medium') || '';
    }
  }

  navigate(item: any) {
    switch (item.type) {
      case 'APPOINTMENT':
        this.service._Appointment.set(item.type_id);
        sessionStorage.setItem('Appointment', JSON.stringify(item.appointment_id));
        this.router.navigate(['../appointments/details'], { relativeTo: this.route });
        break;

      case 'CALLBACK':
        this.service._Appointment.set(item.type_id);
        sessionStorage.setItem('Appointment', JSON.stringify(item.appointment_id));
        this.router.navigate(['../appointments/details'], { relativeTo: this.route });
        break;

      case 'CHAT':
        this.router.navigate(['../doctors'], { relativeTo: this.route });
        break;

      case 'PURCHASE':
        this.router.navigate(['../doctors'], { relativeTo: this.route });
        break;

      case 'REVIEW':
        this.router.navigate(['../ratings-reviews'], { relativeTo: this.route });
        break;
    }
  }

  deleteAllNotifications() {
    this.loading = true
    this.service.delete('webuser/notifications').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false
        this.closeButton?.nativeElement.click()
        this.toster.success(res.message)
        this.service._notifications.set(null)
      },
      error: (error) => {
        this.loading = false
        this.toster.error(error)
      }
    })
  }

  deleteNotification() {
    this.loading = true
    this.service.delete(`webuser/notifications/${this.notificationId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false
        this.closeButton2?.nativeElement.click()
        this.toster.success(res.message)
        this.service._notifications.update(list =>
          list.filter((item: { notification_id: any; }) => item.notification_id !== this.notificationId)
        );
      },
      error: (error) => {
        this.loading = false
        this.toster.error(error)
      }
    })
  }
}
