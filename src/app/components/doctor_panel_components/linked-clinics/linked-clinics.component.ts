import { Component } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { CommonModule } from '@angular/common';
import { LinkedClinics } from '../../../models/linked_clinics';
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
  ngOnInit() {
    this.loaderService.show();
    this.clinics$ = this.apiService.get<any>(`doctor/get_linked_clinics`).pipe(tap(() => setTimeout(() => this.loaderService.hide(), 100)));
  }
}
