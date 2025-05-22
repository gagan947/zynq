export interface ClinicProfileResponse {
      success: boolean;
      status: number;
      message: string;
      data: ClinicProfile;
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
      ivo_registration_number: string;
      hsa_id: string;
      onboarding_token: string | null;
      profile_completion_percentage: number;
      form_stage: number;
      created_at: string;
      updated_at: string;
      email_sent_at: string | null;
      email_sent_count: number;
      fee_range: string;
      website_url: string;
      clinic_description: string;
      clinic_logo: string;
      language: string;
      location: ClinicLocation;
      treatments: Treatment[];
      operation_hours: ClinicOperationHour[];
      equipments: Equipment[];
      skin_types: SkinType[];
      severity_levels: SeverityLevel[];
      documents: ClinicDocument[];
}

export interface ClinicLocation {
      clinic_location_id: string;
      clinic_id: string;
      street_address: string;
      city: string;
      state: string;
      zip_code: string;
      latitude: string;
      longitude: string;
      created_at: string;
      updated_at: string;
}

export interface Treatment {
      treatment_id: string;
      name: string;
}

export interface ClinicOperationHour {
      clinic_operation_hours_id: string;
      clinic_id: string;
      day_of_week: string;
      open_time: string;
      close_time: string;
      created_at: string;
      updated_at: string;
      is_closed: number;
}

export interface Equipment {
      equipment_id: string;
      name: string;
}

export interface SkinType {
      skin_type_id: string;
      name: string;
}

export interface SeverityLevel {
      severity_level_id: string;
      level: string;
}

export interface ClinicDocument {
      clinic_document_id: string;
      clinic_id: string;
      document_type: string;
      file_url: string;
      certification_type_id: string | null;
      created_at: string;
      updated_at: string;
}
