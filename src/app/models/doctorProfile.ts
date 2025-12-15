export interface DoctorProfileResponse {
  success: boolean;
  status: number;
  message: string;
  data: DoctorProfile;
}

export interface DoctorProfile {
  id: string;
  email: string;
  password: string;
  show_password: string;
  jwt_token: string;
  reset_token: string | null;
  reset_token_expiry: string | null;
  fcm_token: string | null;
  role_id: string;
  language: string;
  on_boarding_status: number;
  created_at: string;
  is_password_set: number;
  role_name: string;
  doctor_id: string;
  zynq_user_id: string;
  name: string;
  last_name: string;
  specialization: string | null;
  employee_id: string | null;
  experience_years: string | null;
  rating: string | null;
  fee_per_session: string;
  session_duration: string;
  currency: string;
  phone: string;
  age: string;
  address: string;
  biography: string;
  gender: string;
  profile_image: string;
  updated_at: string;
  education: any[];
  experience: any[];
  treatments: any[];
  skinTypes: any[];
  severityLevels: any[];
  availability: any[];
  certifications: any[];
  completionPercentage: number;
  surgery: any[]
  skinCondition: any[]
  devices: any[]
}
