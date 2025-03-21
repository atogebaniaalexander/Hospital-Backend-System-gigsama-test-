
export interface APITokenPayload {
  email: string;
  name: string;
  doctorId: string;
  adminId: string;
  patientId: string;
}

export interface AdminModel {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface PatientModel {
  id: number;
  name: string;
  email: string;
  password: string;
}

export interface DoctorModel {
  id: number;
  name: string;
  email: string;
  password: string;
  specialty: string;
  available: boolean;
}