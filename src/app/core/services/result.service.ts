import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  constructor(private api: ApiService) {}

  getResults(params?: { exam_id?: string; student_id?: string; group_id?: string }): Observable<any> {
    return this.api.get<any>('results', params);
  }

  getStudentGrades(studentId?: number | string): Observable<any> {
    const endpoint = studentId ? `results/student/${studentId}` : 'results/student';
    return this.api.get<any>(endpoint);
  }

  saveResults(payload: { exam_id: string | number; scores: any[] }): Observable<any> {
    return this.api.post<any>('results', payload);
  }
}
