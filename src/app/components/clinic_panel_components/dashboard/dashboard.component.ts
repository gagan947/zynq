import { Component, effect } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { LoaderService } from '../../../services/loader.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  clinicProfile = this.service._clinicProfile;
  dashboardData: any;
  private destroy$ = new Subject<void>();

  constructor(private service: CommonService, private loader: LoaderService) {
    effect(() => {
      this.clinicProfile();
    });
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.loader.show()
    this.service.get('doctor/dashboard').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.dashboardData = res.data;
      this.loader.hide()
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
