import { Component, effect, ViewChild } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { LoaderService } from '../../../services/loader.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexStroke, ApexFill, ApexGrid, ApexTheme } from 'ng-apexcharts';


// export type ChartOptions = {
//   series: ApexAxisChartSeries;
//   chart: ApexChart;
//   xaxis: ApexXAxis;
//   yaxis: ApexYAxis;
//   stroke: ApexStroke;
//   fill: ApexFill;
//   grid: ApexGrid;
//   theme: ApexTheme;
// };


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  clinicProfile = this.service._clinicProfile;
  dashboardData: any;
  private destroy$ = new Subject<void>();
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: any;

  constructor(private service: CommonService, private loader: LoaderService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    effect(() => {
      this.clinicProfile();
    });
  }

  ngOnInit() {
    this.getData();
    this.initializeChart()
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


  initializeChart() {
    this.chartOptions = {
      series: [
        {
          name: "Revenue",
          data: [1200, 1700, 1400, 2100, 1900, 2400, 2500] // placeholder
        },
      ],
      chart: {
        type: "area",
        height: 300,
        toolbar: { show: false },
      },
      xaxis: {
        categories: ["01", "05", "10", "15", "20", "25", "30"],
        labels: {
          style: {
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        min: 0,
        max: 2600,
        tickAmount: 4,
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      grid: {
        borderColor: "#e7e7e7",
        strokeDashArray: 3,
      },
      theme: {
        mode: "light",
      },
    };
  }

  updateChart(categories: string[], data: number[]) {
    this.chartOptions.series = [
      {
        name: "Revenue",
        data,
      },
    ];
    this.chartOptions.xaxis = { categories };
  }
}
