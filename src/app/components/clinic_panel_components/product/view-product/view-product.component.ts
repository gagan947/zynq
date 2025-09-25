import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { Product } from '../../../../models/products';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CurrencyPipe, Location } from '@angular/common';
import { CarouselComponent, CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../../../services/loader.service';

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [CurrencyPipe, CarouselModule, NzRateModule, FormsModule],
  templateUrl: './view-product.component.html',
  styleUrl: './view-product.component.css'
})
export class ViewProductComponent {
  productId: string | undefined;
  productData: Product | undefined
  selectedSizes: string[] = [];
  selectedFeatures: string[] = []
  selectedBenefits: string[] = []
  selectedIngredients: string[] = []
  @ViewChild('mainCarousel', { static: false }) mainCarousel!: CarouselComponent;

  mainOptions: OwlOptions = {
    items: 1,
    loop: true,
    dots: false,
    nav: false,
    autoplay: false
  };

  thumbOptions: OwlOptions = {
    items: 6,
    margin: 10,
    dots: false,
    nav: false,
  };

  goToSlide(index: number): void {
    const slideId = `slide-${index}`;
    this.mainCarousel?.to(slideId);
  }

  constructor(private service: CommonService, private route: ActivatedRoute, private toster: NzMessageService, private loader: LoaderService, public location: Location) {
    this.route.queryParams.subscribe(param => {
      this.productId = param['id'];
      if (this.productId) {
        this.loader.show();
        this.getProductById();
      }
    })
  }

  getProductById() {
    let formData = {
      product_id: this.productId
    }
    this.service.post('clinic/get-product-by-id', formData).subscribe((res: any) => {
      if (res.success) {
        this.productData = res.data;
        this.productData?.product_images.unshift({
          image: this.productData.cover_image,
          product_image_id: '',
          product_id: '',
          created_at: '',
          updated_at: ''
        });
        this.selectedFeatures = this.productData?.feature_text.split(',') || [];
        this.selectedSizes = this.productData?.size_label.split(',') || [];
        this.selectedBenefits = this.productData?.benefit_text.split(',') || [];
        this.selectedIngredients = this.productData?.ingredients.split(',') || [];
        this.loader.hide();
      } else {
        this.toster.error(res.message);
        this.loader.hide();
      }
    }, (error) => {
      this.toster.error(error);
      this.loader.hide();
    })
  }
}
