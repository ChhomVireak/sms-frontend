import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TimetableService {
  constructor(private api: ApiService) {}

  getTimeSlots(): Observable<any> {
    return this.api.get<any>('timetables/slots');
  }

  getTimetables(params?: { group_id?: string; teacher_id?: string; room_id?: string; semester_id?: string }): Observable<any> {
    return this.api.get<any>('timetables', params);
  }

  createTimetableSlot(payload: any): Observable<any> {
    return this.api.post<any>('timetables', payload);
  }

  deleteTimetableSlot(id: number): Observable<any> {
    return this.api.delete<any>(`timetables/${id}`);
  }
}
