export interface FeeSchedule {
  fee_schedule_id: number;
  group_id: number;
  semester_id: number;
  fee_title: string;
  amount: number;
  due_date: string;
  late_penalty_rate?: number;
  group_code?: string;
  group_name?: string;
}

export interface Payment {
  payment_id: number;
  receipt_number: string;
  student_id: number;
  fee_schedule_id: number;
  amount_paid: number;
  penalty_paid?: number;
  payment_method: 'KHQR' | 'CASH' | 'BANK_TRANSFER';
  payment_date: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial';
  first_name?: string;
  last_name?: string;
  custom_student_id?: string;
  fee_title?: string;
  group_code?: string;
}
