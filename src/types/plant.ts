export interface Plant {
  id: number;
  name: string;
  price: number;
  categoryType: string;
  imageUrl: string;
  imagePath: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlantQueryParams {
  search?: string;
  category_type?: string;
  active?: boolean;
  min_price?: number;
  max_price?: number;
  sort_by?: "id" | "name" | "price" | "category_type" | "created_at";
  sort_direction?: "asc" | "desc";
  per_page?: number;
  limit?: number;
  page?: number;
}

export interface PaginatedPlantsResponse {
  data: Plant[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface PlantDetailResponse {
  data: Plant;
}

export interface CreatePlantPayload {
  name: string;
  price: number;
  category_type?: string;
  active?: boolean;
  image?: File;
  image_url?: File;
}

export interface UpdatePlantPayload {
  name?: string;
  price?: number;
  category_type?: string;
  active?: boolean;
  image?: File;
  image_url?: File;
  remove_image?: boolean;
}
