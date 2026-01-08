import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { DoctorProfileResponse } from '../../../models/doctorProfile';
import { Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../services/loader.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
  selector: 'app-dr-profile',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, TranslateModule, NzTabsModule],
  templateUrl: './dr-profile.component.html',
  styleUrl: './dr-profile.component.css'
})
export class DrProfileComponent {
  doctorProfile$!: Observable<DoctorProfileResponse>;
  selectedIndex = 0;
  collapseStates: boolean[] = [];
  constructor(private apiService: CommonService, private loaderService: LoaderService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
  }

  ngOnInit() {
    this.loaderService.show();
    this.doctorProfile$ = this.apiService.get<DoctorProfileResponse>('doctor/get_profile').pipe(tap(() => setTimeout(() => this.loaderService.hide(), 100)));
  }

  mapDoctorAvailability(data: any[]): any[] {
    const grouped: { [key: string]: any[] } = {};

    data.forEach(item => {
      const day = item.day.toLowerCase();

      if (!grouped[day]) {
        grouped[day] = [];
      }

      grouped[day].push({
        start_time: item.start_time,
        end_time: item.end_time,
        slot_duration: +item.slot_duration,
        start_time_utc: item.start_time_utc,
        end_time_utc: item.end_time_utc
      });
    });

    return Object.keys(grouped).map(day => ({
      day,
      slots: grouped[day]
    }));
  }

  convertTime(time: any): any {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const utcDate = new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));
    const localHours = String(utcDate.getHours()).padStart(2, '0');
    const localMinutes = String(utcDate.getMinutes()).padStart(2, '0');
    return `${localHours}:${localMinutes}`;
  }

  toggleCollapse(collapseStates: boolean[], index: number) {
    collapseStates[index] = !collapseStates[index];
  }

  clinicSelectionChange(index: number) {
    this.selectedIndex = index;
  }

  shortSlots(slots: any[]): any[] {
    return [...slots].sort((a, b) => a.start_time.localeCompare(b.start_time));
  }
}
