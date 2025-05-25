export type Patient = {
  id: string;
  name: string;
  age?: number;
  gender?: string;
};

export type Appointment = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
  patient: Patient;
};

export type Assessment = {
  id: string;
  type: string;
  score: number;
  assessedOn: string;
  patientId: string;
  patient: Patient;
};

export type DashboardStats = {
  totalPatients: number;
  upcomingAppointments: number;
  appointmentsToday: number;
  recentAssessments: number;
  patientsByGender: { male: number; female: number; other: number };
  appointmentsByDay: { date: string; count: number }[];
  assessmentScores: { patient: string; type: string; score: number }[];
};