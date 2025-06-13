export interface Treatment {
      treatment_id: string;
      name: string;
}

export interface TreatmentResponse {
      success: boolean;
      status: number;
      message: string;
      data: Treatment[];
}

export interface SkinType {
      skin_type_id: string;
      name: string;
}

export interface SkinTypeResponse {
      success: boolean;
      status: number;
      message: string;
      data: SkinType[];
}

export interface SecurityLevel {
      severity_level_id: string;
      level: string;
}

export interface SecurityLevelResponse {
      success: boolean;
      status: number;
      message: string;
      data: SecurityLevel[];
}

export interface EquipmentType {
      equipment_id: string;
      name: string;
}

export interface EquipmentTypeResponse {
      success: boolean;
      status: number;
      message: string;
      data: EquipmentType[];
}

export interface CertificationType {
      certification_type_id: string;
      name: string;
      created_at: string;
      updated_at: string;
      file_name: string;
}

export interface CertificateTypeResponse {
      success: boolean;
      status: number;
      message: string;
      data: CertificationType[];
}
