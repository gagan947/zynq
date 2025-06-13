import { ClinicProfile } from "./clinic-profile";
import { DoctorProfile } from "./doctorProfile";

export interface SupportTicket {
      support_ticket_id: string;
      clinic_id: string | null;
      doctor_id: string | null;
      issue_title: string;
      issue_description: string;
      user_id: string | null;
      admin_response: string | null;
      responded_at: string | null;
      created_at: string;
      updated_at: string;
      clinic_response: string | null;
      clinic?: ClinicProfile;
      doctor?: DoctorProfile;
      ticket_id: string;
}

export interface SupportTicketResponse {
      success: boolean;
      status: number;
      message: string;
      data: SupportTicket[];
}
