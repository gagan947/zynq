import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Product, ProductResponse } from '../../../../models/products';

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
  constructor(private router: Router, private service: CommonService, private toster: NzMessageService) { }

  ngOnInit(): void {
    this.getProductList()
  }

  getProductList() {
    this.productslist$ = this.service.get('clinic/get-all-products').pipe(tap((resp: any) => {
      if (resp.success) {
        this.orgProductsList = resp.data;
        this.productsList = [...this.orgProductsList];
      }
    }));
  }

  opanDeleteModal(productId: string) {
    this.ProductId = productId;
  }

  deleteProduct() {
    this.service.delete<any>(`clinic/delete-product/${this.ProductId}`).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.toster.success(resp.message)
          this.getProductList()
          this.closeButton.nativeElement.click();
          this.ProductId = undefined;
        } else {
          this.toster.error(resp.message)
        }
      },
      error: (error) => {
        this.toster.error(error);
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
