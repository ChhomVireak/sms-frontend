export interface Teacher {
  teacher_id: number;
  custom_teacher_id: string;
  employee_id?: string;
  user_id?: number;
  first_name: string;
  last_name: string;
  gender: 'MALE' | 'FEMALE';
  dob?: string;
  phone: string;
  image?: string;
  email?: string;
  address?: string;
  nationality?: string;
  specialization?: string;
  faculty?: string;
  department?: string;
  hire_date: string;
  employment_type?: string;
  status?: string;
  class_count?: number;
  account_status?: string;
  payroll_status?: string;
  assigned_subject_ids?: any;
  assigned_group_ids?: any;
  salary_rate?: number;
  teaching_hours?: number;
}

export interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  department?: string;
  teachers_count?: number;
  classes_count?: number;
}

export interface Room {
  room_id: number;
  room_number: string;
  building?: string;
  capacity?: number;
}
