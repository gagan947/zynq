import { CurrencyPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { CarouselComponent, CarouselModule } from 'ngx-owl-carousel-o';
import { CommonService } from '../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-view-treatment',
  standalone: true,
  imports: [CurrencyPipe, CarouselModule, NzRateModule, FormsModule, TranslateModule],
  templateUrl: './view-treatment.component.html',
  styleUrl: './view-treatment.component.css'
})
export class ViewTreatmentComponent {


  productId: string | undefined;
  productData: any | undefined
  selectedSizes: string[] = [];
  selectedFeatures: string[] = []
  selectedBenefits: string[] = []
  selectedIngredients: string[] = []
  @ViewChild('mainCarousel', { static: false }) mainCarousel!: CarouselComponent;


  goToSlide(index: number): void {
    const slideId = `slide-${index}`;
    this.mainCarousel?.to(slideId);
  }

  constructor(private service: CommonService, private route: ActivatedRoute, private toster: NzMessageService, private loader: LoaderService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
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
