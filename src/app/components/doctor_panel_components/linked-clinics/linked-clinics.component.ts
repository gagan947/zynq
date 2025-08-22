import { Component } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { CommonModule } from '@angular/common';
import { ClinicProfile, LinkedClinics } from '../../../models/linked_clinics';
import { LoaderService } from '../../../services/loader.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-linked-clinics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './linked-clinics.component.html',
  styleUrl: './linked-clinics.component.css'
})
export class LinkedClinicsComponent {
  clinics$!: Observable<LinkedClinics>;

  constructor(private apiService: CommonService, private loaderService: LoaderService, private toastr: NzMessageService) { }
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

  exportTableToCSV() {
    const table = document.getElementById("myTable") as HTMLTableElement;

    if (this.clinicList.length == 0) {
      this.toastr.warning("No data found to export!");
      return;
    }

    let csv: string[] = [];

    for (let i = 0; i < table.rows.length; i++) {
      let row: string[] = [];
      const cols = table.rows[i].cells;

      for (let j = 0; j < cols.length; j++) {
        const headerText = table.rows[0].cells[j].innerText.trim();
        if (headerText === 'Action') {
          continue;
        }
        row.push('"' + cols[j].innerText.replace(/"/g, '""') + '"');
      }

      csv.push(row.join(","));
    }
    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    const downloadLink = document.createElement("a");
    downloadLink.download = "Clinics.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
  }
}
