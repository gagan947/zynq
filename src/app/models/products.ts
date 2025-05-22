export interface ProductImage {
      product_image_id: string;
      product_id: string;
      image: string;
      created_at: string;
      updated_at: string;
}

export interface Product {
      product_id: string;
      clinic_id: string;
      name: string;
      price: string;
      rating: number;
      short_description: string;
      full_description: string;
      feature_text: string;
      size_label: string;
      benefit_text: string;
      how_to_use: string;
      created_at: string;
      updated_at: string;
      ingredients: string;
      stock: number;
      is_deleted: number;
      product_images: ProductImage[];
}

export interface ProductResponse {
      success: boolean;
      status: number;
      message: string;
      data: Product[];
}
