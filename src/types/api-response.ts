export interface ApiErrorDetail {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export interface ApiSuccessResponse<TData> {
  ok: true;
  data: TData;
}

export interface ApiErrorResponse {
  ok: false;
  error: ApiErrorDetail;
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;
