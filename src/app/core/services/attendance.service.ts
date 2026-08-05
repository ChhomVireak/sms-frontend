import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  constructor(private api: ApiService) {}

  getAttendance(params?: { group_id?: string; subject_id?: string; date?: string; student_id?: string }): Observable<any> {
    return this.api.get<any>('attendance', params);
  }

  getAttendanceStats(): Observable<any> {
    return this.api.get<any>('attendance/stats');
  }

  markAttendance(payload: { group_id: string; subject_id: string; date: string; records: any[] }): Observable<any> {
    return this.api.post<any>('attendance', payload);
  }
}
