export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}