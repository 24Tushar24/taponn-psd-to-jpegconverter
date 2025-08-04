import { Folder, Product, UploadResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

// API endpoints
export const endpoints = {
  folders: "/folders",
  products: "/products",
  productUpload: "/product/upload",
  productTypes: "/product-types",
  deleteProduct: (id: string) => `/products/${id}`,
  deleteFolder: (productType: string) => `/folders/${productType}`,
};

// API service functions
export class ApiService {
  private static baseURL = API_BASE_URL;

  // Generic request method
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...apiConfig.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Get all folders
  static async getFolders(): Promise<Folder[]> {
    return this.request(endpoints.folders);
  }

  // Get all products
  static async getProducts(): Promise<Product[]> {
    return this.request(endpoints.products);
  }

  // Get supported product types
  static async getProductTypes(): Promise<string[]> {
    return this.request(endpoints.productTypes);
  }

  // Upload PSD file
  static async uploadProduct(formData: FormData): Promise<UploadResponse> {
    const url = `${this.baseURL}${endpoints.productUpload}`;

    const response = await fetch(url, {
      method: "POST",
      body: formData, // Don't set Content-Type for FormData
    });

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Delete a product
  static async deleteProduct(id: string): Promise<void> {
    return this.request(endpoints.deleteProduct(id), {
      method: "DELETE",
    });
  }

  // Delete a folder
  static async deleteFolder(productType: string): Promise<void> {
    return this.request(endpoints.deleteFolder(productType), {
      method: "DELETE",
    });
  }
}

// Constants for file validation
export const FILE_CONSTRAINTS = {
  MAX_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "500000000"),
  ALLOWED_TYPES: process.env.NEXT_PUBLIC_ALLOWED_TYPES?.split(",") || [".psd"],
};
