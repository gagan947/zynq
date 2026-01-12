export interface DoctorResponse {
      success: boolean;
      status: number;
      message: string;
      data: Doctor[];
}

export interface Doctor {
      map_id: string;
      doctor_id: string;
      clinic_id: string;
      assigned_at: string;
      zynq_user_id: string;
      name: string;
      email: string;
      specialization: string | null;
      employee_id: string | null;
      experience_years: number | null;
      rating: number | null;
      fee_per_session: string;
      session_duration: string;
      currency: string;
      phone: string;
      age: string;
      address: string;
      biography: string | null;
      gender: string;
      profile_image: string;
      created_at: string;
      updated_at: string;
      is_invitation_accepted: number;
      treatments: DoctorTreatment[];
      availability: DoctorAvailability[];
      certifications: DoctorCertification[];
      education: DoctorEducation[];
      experience: DoctorExperience[];
      reviews: any[];
      severity_levels: DoctorSeverityLevel[];
      skin_types: DoctorSkinType[];
      on_boarding_status: number;
}

export interface DoctorAvailability {
      doctor_availability_id: string;
      doctor_id: string;
      day_of_week: string;
      start_time: string;
      end_time: string;
      created_at: string;
      updated_at: string;
}

export interface DoctorCertification {
      doctor_certification_id: string;
      doctor_id: string;
      certification_type_id: string;
      upload_path: string;
      issue_date: string | null;
      expiry_date: string | null;
      issuing_authority: string | null;
      created_at: string;
      updated_at: string;
}

export interface DoctorEducation {
      education_id: string;
      doctor_id: string;
      degree: string;
      institution: string;
      start_year: number;
      end_year: number;
      education_type: string | null;
      created_at: string;
      updated_at: string;
}

export interface DoctorExperience {
      experience_id: string;
      doctor_id: string;
      organization: string;
      designation: string;
      start_date: string;
      end_date: string;
      created_at: string;
      updated_at: string;
}

export interface DoctorSeverityLevel {
      doctor_severity_level_id: string;
      doctor_id: string;
      severity_id: string;
      created_at: string;
      updated_at: string;
}

export interface DoctorSkinType {
      doctor_skin_type_id: string;
      doctor_id: string;
      skin_type_id: string;
}

export interface DoctorTreatment {
      doctor_treatment_id: string;
      doctor_id: string;
      treatment_id: string;
      name: string;
      created_at: string;
      updated_at: string;
}
