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
  imagePreview: string = 'assets/img/np_pro.jpg';
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

  search(event: any) {
    const searchValue = event.target.value.trim().toLowerCase();
    if (searchValue) {
      this.productsList = this.orgProductsList.filter(list =>
        list.name.toLowerCase().includes(searchValue) || list.name.toLowerCase().includes(searchValue)
      );
    } else {
      this.productsList = [...this.orgProductsList];
    }
  }

  openModal(imageUrl: string | undefined) {
    if (imageUrl) {
      this.imagePreview = imageUrl
    }
  }

  exportTableToCSV() {
    const table = document.getElementById("myTable") as HTMLTableElement;
    if (this.productsList.length == 0) {
      this.toster.warning("No data found to export!");
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
}
