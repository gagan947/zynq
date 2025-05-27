export interface LinkedClinics {
    success: boolean;
    status: number;
    message: string;
    data: ClinicProfile[];
  }
  
  export interface ClinicProfile {
    clinic_id: string;
    zynq_user_id: string;
    clinic_name: string;
    org_number: string;
    email: string;
    mobile_number: string;
    address: string;
    is_invited: number;
    is_active: number;
    onboarding_token: string | null;
    profile_completion_percentage: number;
    created_at: string;
    updated_at: string;
    email_sent_at: string | null;
    email_sent_count: number;
    fee_range: string; // e.g., '{"min":200,"max":800}'
    website_url: string;
    clinic_description: string;
    clinic_logo: string;
    language: string;
    form_stage: number;
    ivo_registration_number: string;
    hsa_id: string;
    is_onboarded: number;
    zip_code: string;
    city: string;
    state: string;
    street_address: string;
  }
  