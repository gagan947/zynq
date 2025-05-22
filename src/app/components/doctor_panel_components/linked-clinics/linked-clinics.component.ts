import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { CommonModule } from '@angular/common';
import { LinkedClinics } from '../../../models/linked_clinics';

@Component({
  selector: 'app-linked-clinics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './linked-clinics.component.html',
  styleUrl: './linked-clinics.component.css'
})
export class LinkedClinicsComponent {
  clinics$!: Observable<LinkedClinics>;

  constructor(private apiService: CommonService) { }
  ngOnInit() {
    this.clinics$ = this.apiService.get<any>(`doctor/get_linked_clinics`);
  }
}
