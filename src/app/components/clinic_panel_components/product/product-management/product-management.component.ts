import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Product, ProductResponse } from '../../../../models/products';
import { LoaderService } from '../../../../services/loader.service';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.css'
})
export class ProductManagementComponent {
  productslist$!: Observable<ProductResponse>
  ProductId: string | undefined;
  productsList: Product[] = [];
  orgProductsList: Product[] = [];
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  constructor(private router: Router, private service: CommonService, private toster: NzMessageService, private loader: LoaderService) { }

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
}
