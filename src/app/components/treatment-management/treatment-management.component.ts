import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Product, ProductResponse } from '../../models/products';
import { Observable, tap } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-treatment-management',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './treatment-management.component.html',
  styleUrl: './treatment-management.component.css'
})
export class TreatmentManagementComponent {

  treatmentList$!: Observable<ProductResponse>
  treatmentId: string | undefined;
  treatmentList: Product[] = [];
  orgTreatmentsList: Product[] = [];
  status: string = '';
  type: number | null = null;
  imagePreview: string = 'assets/img/np_pro.jpg';
  searchTerm: string = '';
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  constructor(private service: CommonService, private toster: NzMessageService, private loader: LoaderService,
    private translate: TranslateService
  ) {
    this.translate.use(localStorage.getItem('lang') || 'en');
  }

  ngOnInit(): void {
    this.getProductList()
  }

  getProductList() {
    this.loader.show();
    this.treatmentList$ = this.service.get('clinic/get-all-products').pipe(tap((resp: any) => {
      if (resp.success) {
        this.orgTreatmentsList = resp.data;
        this.treatmentList = [...this.orgTreatmentsList];
        this.loader.hide();
      }
    }));
  }

  opanDeleteModal(productId: string) {
    this.treatmentId = productId;
  }

  deleteTreatment() {
    this.loader.show();
    this.service.delete<any>(`clinic/delete-treatment/${this.treatmentId}`).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.toster.success(resp.message)
          this.getProductList()
          this.closeButton.nativeElement.click();
          this.treatmentId = undefined;
          this.loader.hide();
        } else {
          this.toster.error(resp.message)
          this.loader.hide();
        }
      },
      error: (error) => {
        this.toster.error(error);
        this.loader.hide();
      }
    })
  }

  openModal(imageUrl: string | undefined) {
    if (imageUrl) {
      this.imagePreview = imageUrl
    }
  }

  toggleHideProduct(item: Product) {
    this.loader.show();
    this.service.update(`clinic/product/toggle-hide/${item.product_id}`, {}).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.toster.success(resp.message)
          item.is_hidden = item.is_hidden == 1 ? 0 : 1;
          this.loader.hide();
        } else {
          this.toster.error(resp.message)
          this.loader.hide();
        }
      },
      error: (error) => {
        this.toster.error(error);
        this.loader.hide();
      }
    })
  }

  getBgColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return '#FFECB3';
      case 'APPROVED':
        return '#C8E6C9';
      case 'REJECTED':
        return '#FFCDD2';
      default:
        return '#FFFFFF';
    }
  }

  getTextColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return '#EF6C00';
      case 'APPROVED':
        return '#2E7D32';
      case 'REJECTED':
        return '#D32F2F';
      default:
        return '#000000';
    }
  }

  filterByStatus(event: any) {
    this.status = event.target.value;
    this.applyFilters();
  }


  filterByType(event: any) {
    this.type = event.target.value;
    this.applyFilters();
  }

  search(event: any) {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.applyFilters();
  }

  applyFilters() {
    this.treatmentList = this.orgTreatmentsList.filter((item: Product) => {
      const matchSearch =
        !this.searchTerm ||
        item.name?.toLowerCase().includes(this.searchTerm)

      const matchStatus =
        !this.status || item.approval_status == this.status;

      const matchType =
        !this.type || item.is_hidden == this.type;

      return matchSearch && matchStatus && matchType;
    });
  }


}
