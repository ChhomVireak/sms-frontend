import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  constructor(private api: ApiService) {}

  getExams(params?: { group_id?: string; subject_id?: string; category?: string; status?: string }): Observable<any> {
    return this.api.get<any>('exams', params);
  }

  createExam(examData: any): Observable<any> {
    return this.api.post<any>('exams', examData);
  }

  updateExam(id: number, examData: any): Observable<any> {
    return this.api.put<any>(`exams/${id}`, examData);
  }

  deleteExam(id: number): Observable<any> {
    return this.api.delete<any>(`exams/${id}`);
  }
}
