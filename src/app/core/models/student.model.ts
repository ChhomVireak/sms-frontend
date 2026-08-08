export interface Student {
  student_id: number;
  custom_student_id: string;
  user_id?: number;
  group_id?: number;
  first_name: string;
  last_name: string;
  gender: 'MALE' | 'FEMALE';
  dob: string;
  phone?: string;
  image?: string;
  imageError?: boolean;
  photo?: string;
  parent_name?: string;
  parent_phone?: string;
  previous_school?: string;
  academic_year_level?: number;
  current_semester?: number;
  reexam_status?: string;
  is_retained?: boolean;
  enrollment_date: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'GRADUATED';
  group_name?: string;
  group_code?: string;
  program_name?: string;
  program_code?: string;
  degree?: string;
  generation?: string;
  shift?: string;
  fee_status?: string;
  email?: string;
}

export interface StudentGroup {
  group_id: number;
  group_code: string;
  group_name: string;
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING';
  max_capacity: number;
  student_count?: number;
}
