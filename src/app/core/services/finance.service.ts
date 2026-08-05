import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  constructor(private api: ApiService) {}

  getFeeSchedules(params?: { group_id?: string; semester_id?: string }): Observable<any> {
    return this.api.get<any>('fees', params);
  }

  createFeeSchedule(payload: any): Observable<any> {
    return this.api.post<any>('fees', payload);
  }

  deleteFeeSchedule(id: number): Observable<any> {
    return this.api.delete<any>(`fees/${id}`);
  }

  getPayments(params?: { student_id?: string; search?: string }): Observable<any> {
    return this.api.get<any>('payments', params);
  }

  recordPayment(payload: any): Observable<any> {
    return this.api.post<any>('payments', payload);
  }

  getReceipt(receiptNumber: string): Observable<any> {
    return this.api.get<any>(`payments/receipt/${receiptNumber}`);
  }
}
