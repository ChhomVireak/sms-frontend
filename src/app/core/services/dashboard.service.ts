import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private api: ApiService) { }

  getAdminDashboard(): Observable<any> {
    return this.api.get<any>('dashboard/admin');
  }

  getTeacherDashboard(): Observable<any> {
    return this.api.get<any>('dashboard/teacher');
  }

  getStudentDashboard(): Observable<any> {
    return this.api.get<any>('dashboard/student');
  }
}
