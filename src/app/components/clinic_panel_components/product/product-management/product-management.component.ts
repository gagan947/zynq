import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Product, ProductResponse } from '../../../../models/products';
import { LoaderService } from '../../../../services/loader.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.css'
})
export class ProductManagementComponent {
  productslist$!: Observable<ProductResponse>
  ProductId: string | undefined;
  productsList: Product[] = [];
  orgProductsList: Product[] = [];
  status: string = '';
  type: number | null = null;
  imagePreview: string = 'assets/img/np_pro.jpg';
  searchTerm: string = '';
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  constructor(private router: Router, private service: CommonService, private toster: NzMessageService, private loader: LoaderService,
    private translate: TranslateService
  ) {
    this.translate.use(localStorage.getItem('lang') || 'en');
  }

  ngOnInit(): void {
    this.getProductList()
  }

  getProductList() {
    this.loader.show();
    this.productslist$ = this.service.get('clinic/get-all-products').pipe(tap((resp: any) => {
      if (resp.success) {
        this.orgProductsList = resp.data;
        this.productsList = [...this.orgProductsList];
        this.loader.hide();
      }
    }));
  }

  opanDeleteModal(productId: string) {
    this.ProductId = productId;
  }

  deleteProduct() {
    this.loader.show();
    this.service.delete<any>(`clinic/delete-product/${this.ProductId}`).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.toster.success(resp.message)
          this.getProductList()
          this.closeButton.nativeElement.click();
          this.ProductId = undefined;
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

  exportTableToCSV() {
    const table = document.getElementById("myTable") as HTMLTableElement;
    if (this.productsList.length == 0) {
      this.toster.warning(this.translate.instant("No data found to export!"));
      return;
    }

    let csv: string[] = [];

    for (let i = 0; i < table.rows.length; i++) {
      let row: string[] = [];
      const cols = table.rows[i].cells;

      for (let j = 0; j < cols.length; j++) {
        const headerText = table.rows[0].cells[j].innerText.trim();
        if (headerText === 'Action' || headerText === 'Product Image') {
          continue;
        }
        row.push('"' + cols[j].innerText.replace(/"/g, '""') + '"');
      }

      csv.push(row.join(","));
    }
    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    const downloadLink = document.createElement("a");
    downloadLink.download = "Products.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
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
    this.productsList = this.orgProductsList.filter((item: Product) => {
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
