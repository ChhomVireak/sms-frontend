import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Teacher } from '../models/teacher.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  constructor(private api: ApiService) {}

  getTeachers(params?: { search?: string; department?: string }): Observable<any> {
    return this.api.get<any>('teachers', params);
  }

  getTeacherById(id: number | string): Observable<any> {
    return this.api.get<any>(`teachers/${id}`);
  }

  createTeacher(teacherData: FormData | any): Observable<any> {
    return this.api.post<any>('teachers', teacherData);
  }

  updateTeacher(id: number | string, teacherData: FormData | any): Observable<any> {
    return this.api.put<any>(`teachers/${id}`, teacherData);
  }

  deleteTeacher(id: number | string): Observable<any> {
    return this.api.delete<any>(`teachers/${id}`);
  }
}
