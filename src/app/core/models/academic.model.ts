export interface AttendanceRecord {
  attendance_id?: number;
  student_id: number;
  subject_id: number;
  teacher_id?: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  flagged?: boolean;
  note?: string;
  first_name?: string;
  last_name?: string;
  custom_student_id?: string;
}

export interface Exam {
  exam_id: number;
  exam_title: string;
  subject_id: number;
  group_id: number;
  semester_id: number;
  exam_date: string;
  duration_minutes: number;
  room_id?: number;
  category?: 'Quiz' | 'Monthly Test' | 'Midterm' | 'Final Exam';
  status?: 'Active' | 'Pending' | 'Draft' | 'Published';
  subject_name?: string;
  group_code?: string;
  room_number?: string;
}

export interface AcademicResult {
  result_id?: number;
  student_id: number;
  exam_id: number;
  raw_score: number;
  letter_grade?: string;
  grade_point?: number;
  remarks?: string;
  first_name?: string;
  last_name?: string;
  custom_student_id?: string;
  exam_title?: string;
  subject_name?: string;
}

export interface TimetableSlot {
  timetable_id?: number;
  semester_id: number;
  group_id: number;
  subject_id: number;
  teacher_id: number;
  room_id: number;
  slot_id: number;
  day_of_week: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  subject_name?: string;
  teacher_fname?: string;
  teacher_lname?: string;
  group_code?: string;
  room_number?: string;
  start_time?: string;
  end_time?: string;
}
