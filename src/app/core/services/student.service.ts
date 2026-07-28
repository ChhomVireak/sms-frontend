import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(private api: ApiService) {}

  getStudents(params?: { search?: string; groupId?: string; status?: string; page?: number; limit?: number }): Observable<any> {
    return this.api.get<any>('students', params);
  }

  getStudentById(id: number | string): Observable<any> {
    return this.api.get<any>(`students/${id}`);
  }

  createStudent(studentData: FormData | any): Observable<any> {
    return this.api.post<any>('students', studentData);
  }

  updateStudent(id: number | string, studentData: FormData | any): Observable<any> {
    return this.api.put<any>(`students/${id}`, studentData);
  }

  deleteStudent(id: number | string): Observable<any> {
    return this.api.delete<any>(`students/${id}`);
  }
}
