// Dashboard data types for TypeScript type checking

export interface Appointment {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
  patientId: string;
  doctorId: string;
  patient: {
    id: string;
    name: string;
    age?: number;
    gender?: string;
  };
}

export interface Assessment {
  id: string;
  type: string;
  score: number;
  comments?: string;
  patientId: string;
  assessedOn: string;
  patient: {
    name: string;
  };
}

export interface PatientsByGender {
  male: number;
  female: number;
  other: number;
}

export interface AppointmentByDay {
  date: string;
  count: number;
}

export interface AssessmentScore {
  patient: string;
  type: string;
  score: number;
}

export interface DashboardStats {
  totalPatients: number;
  upcomingAppointments: number;
  appointmentsToday: number;
  recentAssessments: number;
  patientsByGender: PatientsByGender;
  appointmentsByDay: AppointmentByDay[];
  assessmentScores: AssessmentScore[];
  success?: boolean;
}