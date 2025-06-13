export interface LoginResponse {
  success: boolean;
  status: number;
  message: string;
  data: LoginUserData;
}

export interface LoginUserData {
  id: string;
  email: string;
  jwt_token: string;
  reset_token?: string | null;
  reset_token_expiry?: string | null;
  fcm_token?: string | null;
  role_id: string;
  language: string;
  role_name: string;
  password?: string;        // optional, for dev/test only
  show_password?: string;
  on_boarding_status: number;  // optional, for dev/test only
}

export interface LoginUserData {
  id: string;
  email: string;
  jwt_token: string;
  reset_token?: string | null;
  reset_token_expiry?: string | null;
  fcm_token?: string | null;
  role_id: string;
  language: string;
  role_name: string;
  password?: string;        // optional, for dev/test only
  show_password?: string;
  is_onboarded?: number;
  is_password_set?: number;  // optional, for dev/test only
}
