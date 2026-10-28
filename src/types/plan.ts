export interface SubscriptionPlan {
  id: number;
  planCode: string;
  planName: string;
  frequencyValue: number;
  frequencyUnit: string;
  visitCount: number;
  maintenanceType: string | null;
  discountPercentage: number;
  loyaltyPointsMultiplier: number;
  active: boolean;
  activeSubscribersCount: number;
  createdAt: string;
  updatedAt?: string; // Opcional porque viene en el detalle o creaciones
}

// Interfaz para la respuesta paginada de planes
export interface SubscriptionPlanResponse {
  data: SubscriptionPlan[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

// Interfaz para la respuesta de un solo plan (ej. GET /subscription-plans/{id})
export interface SingleSubscriptionPlanResponse {
  data: SubscriptionPlan;
}

export interface SubscriptionPlanParams {
  active?: boolean;
  search?: string;
  frequency_unit?: string;
  limit?: number;
  page?: number;
}

// Payload para Crear un plan (POST)
export interface CreateSubscriptionPlanDTO {
  plan_code: string;
  plan_name: string;
  frequency_value: number;
  frequency_unit: string;
  visit_count: number;
  maintenance_type?: string;
  discount_percentage?: number | string;
  loyalty_points_multiplier?: number | string;
  active?: boolean;
}

// Payload para Actualizar un plan (PUT / PATCH)
export interface UpdateSubscriptionPlanDTO extends Partial<CreateSubscriptionPlanDTO> {}

// Tipos para los clientes (subscribers) suscritos a un plan
export interface Subscriber {
  id: number;
  legalName: string;
  tradeName: string;
  taxId: string;
  nrc: string;
  phone: string;
  status: string;
  currentPlanName: string;
  cashBalance: number;
  loyaltyPoints: number;
  createdAt: string;
}

export interface SubscriberResponse {
  data: Subscriber[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface SubscriberParams {
  limit?: number;
  page?: number;
}
