import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { Product } from '../../../../models/products';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CurrencyPipe } from '@angular/common';
declare var $: any;
@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
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
  constructor(private service: CommonService, private route: ActivatedRoute, private toster: NzMessageService) {
    this.route.queryParams.subscribe(param => {
      this.productId = param['id'];
      if (this.productId) {
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
      } else {
        this.toster.error(res.message);
      }
    }, (error) => {
      this.toster.error(error);
    })
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      $(".ct_dot").eq(0).addClass("active");
      var owl = $(".ct_product_detail_slider");
      owl.owlCarousel({
        items: 1,
        loop: true,
        autoplay: false,
        autoplayTimeout: 3000,
        dots: false,
        nav: false,
      });
      owl.on("changed.owl.carousel", (event: any) => {
        var currentIndex = event.item.index - event.relatedTarget._clones.length / 2;
        $(".ct_dot").removeClass("active");
        $(".ct_dot").eq(currentIndex).addClass("active");
      });
    }, 200);
    // this.loading = false
  }

  slide(index: any) {
    $(".ct_product_detail_slider").trigger("to.owl.carousel", [index, 300]);
  }

}
