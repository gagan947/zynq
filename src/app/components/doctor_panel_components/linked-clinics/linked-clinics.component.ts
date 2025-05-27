import { Component } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { CommonModule } from '@angular/common';
import { ClinicProfile, LinkedClinics } from '../../../models/linked_clinics';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-linked-clinics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './linked-clinics.component.html',
  styleUrl: './linked-clinics.component.css'
})
export class LinkedClinicsComponent {
  clinics$!: Observable<LinkedClinics>;

  constructor(private apiService: CommonService, private loaderService: LoaderService) { }
  clinicList: ClinicProfile[] = [];
  orgClinicList: ClinicProfile[] = [];

  ngOnInit() {
    this.loaderService.show();
    this.clinics$ = this.apiService.get<any>(`doctor/get_linked_clinics`).pipe(
      tap((res) => {
        this.clinicList = this.orgClinicList = res.data;
        this.loaderService.hide();
      })
    );
  }

  search(event: any) {
    const searchValue = event.target.value.trim().toLowerCase();
    if (searchValue) {
      this.clinicList = this.orgClinicList.filter(list =>
        list.clinic_name.toLowerCase().includes(searchValue) || list.email.toLowerCase().includes(searchValue)
      );
    } else {
      this.clinicList = [...this.orgClinicList];
    }
  }
}
