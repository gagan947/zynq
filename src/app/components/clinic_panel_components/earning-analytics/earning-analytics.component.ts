import { Component } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-earning-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './earning-analytics.component.html',
  styleUrl: './earning-analytics.component.css'
})
export class EarningAnalyticsComponent {
  private destroy$ = new Subject<void>();
  status: string = 'Appointmens';
  data: any
  constructor(private service: CommonService, private toster: NzMessageService) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.service.get('doctor/earnings').pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.data = res.data || {};
    });
  }

  filterByType(type: string) {
    this.status = type;
  }

  exportTableToCSV() {

    let table;
    if (this.status === 'Appointmens') {
      table = document.getElementById("myTable2") as HTMLTableElement;
      if (this.data.appointments.length == 0) {
        this.toster.warning("No data found to export!");
        return;
      }
    } else {
      table = document.getElementById("myTable") as HTMLTableElement;
      if (this.data.products.length == 0) {
        this.toster.warning("No data found to export!");
        return;
      }
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
    downloadLink.download = "Earnings.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
