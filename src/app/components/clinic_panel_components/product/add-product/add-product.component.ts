import { Component, ElementRef, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { NoWhitespaceDirective } from '../../../../validators';
import { Product, ProductImage } from '../../../../models/products';
import { LoaderService } from '../../../../services/loader.service';
import { AuthService } from '../../../../services/auth.service';
import { Treatment, TreatmentResponse } from '../../../../models/clinic-onboarding';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
declare var bootstrap: any;
@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NzSelectModule, NzUploadModule, ImageCropperComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {
  Form!: FormGroup
  sizes = [{ value: '100 ML' }, { value: '200 ML' }, { value: '300 ML' }, { value: '400 ML' }, { value: '500 ML' }, { value: '750 ML' }, { value: '1000 ML' }];
  selectedSizes: string[] = [];
  selectedFeatures: string[] = []
  selectedBenefits: string[] = []
  selectedIngredients: string[] = []
  productImages: File[] = [];
  previewProductImages: any[] = [];
  submitted: boolean = false;
  productId: string | undefined;
  productData: Product | undefined;
  treatments: Treatment[] = [];
  coverImage: File | null = null;
  coverPreview: string | null | undefined = null;
  @ViewChild('featureInput') featureInput!: ElementRef<HTMLButtonElement>
  @ViewChild('BenefitInput') BenefitInput!: ElementRef<HTMLButtonElement>
  @ViewChild('ingredientInput') ingredientInput!: ElementRef<HTMLButtonElement>
  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>
  constructor(private router: Router, private service: CommonService, private toster: NzMessageService, private fb: FormBuilder, public location: Location, private route: ActivatedRoute, private loader: LoaderService, private auth: AuthService) {
    this.Form = this.fb.group({
      name: ['', [Validators.required, NoWhitespaceDirective.validate]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(1)]],
      short_description: ['', [Validators.required, NoWhitespaceDirective.validate, Validators.maxLength(100)]],
      full_description: ['', [Validators.required, NoWhitespaceDirective.validate, Validators.maxLength(500)]],
      feature_text: [''],
      // size_label: [''],
      ingredients: [''],
      benefit_text: [''],
      how_to_use: ['', [Validators.required, NoWhitespaceDirective.validate]],
      treatments: [[], [Validators.required]],
      product_images: [''],
      coverImg: [null]
    })

    this.route.queryParams.subscribe(param => {
      this.productId = param['id'];
      if (this.productId) {
        this.getProductById();
      }
    })
  }

  ngOnInit(): void {
    this.getTreatments();
  }

  addFeature(feature: string) {
    if (!this.selectedFeatures.includes(feature)) {
      if (feature.trim() != '') {
        this.selectedFeatures.push(feature.trim());
        this.featureInput.nativeElement.value = '';
      }
    } else {
      this.toster.error('Feature already added');
    }
  }

  removeFeature(index: number) {
    this.selectedFeatures.splice(index, 1);
  }

  addBenefit(benifit: string) {
    if (!this.selectedBenefits.includes(benifit)) {
      if (benifit.trim() != '') {
        this.selectedBenefits.push(benifit.trim());
        this.BenefitInput.nativeElement.value = '';
      }
    } else {
      this.toster.error('Benifit already added');
    }
  }

  removeBenefit(index: number) {
    this.selectedBenefits.splice(index, 1);
  }

  addIngredient(Ingredient: string) {
    if (!this.selectedIngredients.includes(Ingredient)) {
      if (Ingredient.trim() != '') {
        this.selectedIngredients.push(Ingredient.trim());
        this.ingredientInput.nativeElement.value = '';
      }
    } else {
      this.toster.error('Ingredient already added');
    }
  }

  addSizes(size: string) {
    if (!this.selectedSizes.includes(size) && size != '') {
      this.selectedSizes.push(size);
    } else {
      this.selectedSizes.splice(this.selectedSizes.indexOf(size), 1);
    }
  }

  removeIngredient(index: number) {
    this.selectedIngredients.splice(index, 1);
  }

  onProductImage(event: any) {
    const files = event.target.files;
    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewProductImages.push(e.target.result);
      };
      reader.readAsDataURL(file);
      this.productImages.push(file);
    });
  }

  removeProductImage(index: number, image?: string) {
    if (this.productId && image) {
      const imageId = this.productData?.product_images.find((item: ProductImage) => item.image == image)?.product_image_id
      this.service.delete<any>(`clinic/delete-product-image/${imageId}`).subscribe((resp) => {
        if (resp.success) {
          this.previewProductImages.splice(index, 1);
          this.productImages.splice(index, 1);
        } else {
          // this.toster.error(resp.message)
          this.previewProductImages.splice(index, 1);
          this.productImages.splice(index, 1);
        }
      }, (error) => {
        this.previewProductImages.splice(index, 1);
        this.productImages.splice(index, 1);
      })
    } else {
      this.previewProductImages.splice(index, 1);
      this.productImages.splice(index, 1);
    }
  }

  removeCoverImage() {
    this.coverImage = null;
    this.coverPreview = null;
  }

  onSubmit() {
    this.submitted = true;
    if (this.Form.invalid || this.selectedFeatures.length == 0 || this.selectedBenefits.length == 0 || this.selectedIngredients.length == 0 || this.previewProductImages.length == 0 || !this.coverPreview) {
      this.Form.markAllAsTouched();
      return
    }
    this.loader.show();
    const formData = new FormData();
    formData.append('name', this.Form.value.name);
    formData.append('stock', this.Form.value.stock);
    formData.append('price', this.Form.value.price);
    formData.append('short_description', this.Form.value.short_description);
    formData.append('full_description', this.Form.value.full_description);
    formData.append('feature_text', this.selectedFeatures.join(','));
    formData.append('size_label', this.selectedSizes.join(','));
    formData.append('benefit_text', this.selectedBenefits.join(','));
    formData.append('ingredients', this.selectedIngredients.join(','));
    formData.append('treatment_ids', this.Form.value.treatments.join(','));
    formData.append('how_to_use', this.Form.value.how_to_use);
    for (let i = 0; i < this.productImages.length; i++) {
      formData.append('product_image', this.productImages[i]);
    }
    if (this.coverImage) {
      formData.append('cover_image', this.coverImage!)
    }

    let apiUrl = ''
    if (this.productId) {
      apiUrl = 'clinic/update-product'
      formData.append('product_id', this.productId);
    } else {
      apiUrl = 'clinic/add-product'
    }

    this.service.post(apiUrl, formData).subscribe((res: any) => {
      if (res.success) {
        this.toster.success(res.message);
        if (this.auth.getRoleName() == 'clinic') {
          this.router.navigate(['/clinic/products']);
        } else {
          this.router.navigate(['/solo-doctor/products'])
        }
        this.loader.hide()
      } else {
        this.toster.error(res.message);
        this.loader.hide()
      }
    }, (error) => {
      this.toster.error(error);
      this.loader.hide()
    })
  }

  getProductById() {
    let formData = {
      product_id: this.productId
    }
    this.service.post('clinic/get-product-by-id', formData).subscribe((res: any) => {
      if (res.success) {
        this.productData = res.data;
        this.Form.patchValue(this.productData || {});
        this.Form.patchValue({ treatments: this.productData?.treatments.map((item: any) => item.treatment_id) });
        this.productData?.product_images.forEach((element: ProductImage) => {
          this.previewProductImages.push(element.image);
        })
        this.coverPreview = this.productData?.cover_image
        this.selectedFeatures = this.productData?.feature_text.split(',') || [];
        // this.selectedSizes = this.productData?.size_label.split(',') || [];
        this.selectedBenefits = this.productData?.benefit_text.split(',') || [];
        this.selectedIngredients = this.productData?.ingredients.split(',') || [];
      } else {
        this.toster.error(res.message);
      }
    }, (error) => {
      this.toster.error(error);
    })
  };

  getTreatments() {
    this.service.get<TreatmentResponse>(`clinic/get-treatments`).subscribe((res) => {
      this.treatments = res.data
    });
  }

  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageBlob: any = '';
  onCoverImage(event: any): void {
    this.imageChangedEvent = event
    this.openModal()
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBlob = event.blob
    this.croppedImage = event.objectUrl
  }

  onDone() {
    this.coverPreview = this.croppedImage
    this.coverImage = new File([this.croppedImageBlob], 'cover.png', {
      type: 'image/png'
    })
    this.closeBtn.nativeElement.click()
  }

  openModal() {
    const modalElement = document.getElementById('ct_feedback_detail_modal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}

