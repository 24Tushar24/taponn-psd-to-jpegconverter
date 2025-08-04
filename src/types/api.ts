// API Response Types
export interface Folder {
  id: string;
  product_type: string;
  name: string;
  created_at: string;
  product_count: number;
}

export interface Product {
  id: string;
  name: string;
  product_type: string;
  original_filename: string;
  file_size: number;
  created_at: string;
  status: "processing" | "completed" | "failed";
  jpeg_url?: string;
  thumbnail_url?: string;
}

export interface ProductImage {
  _id: string;
  product_type: string;
  image_url: string;
  uploaded_at: string;
  filename: string;
}

export interface UploadResponse {
  id: string;
  message: string;
  product: Product;
}

export interface ApiError {
  detail: string;
  status_code: number;
}
