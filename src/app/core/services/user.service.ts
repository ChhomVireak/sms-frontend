import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private api: ApiService) {}

  getUsers(params?: { role?: string; search?: string }): Observable<any> {
    return this.api.get<any>('users', params);
  }

  createUser(userData: any): Observable<any> {
    return this.api.post<any>('users', userData);
  }

  updateUserStatus(id: number, status: string): Observable<any> {
    return this.api.patch<any>(`users/${id}/status`, { status });
  }

  deleteUser(id: number): Observable<any> {
    return this.api.delete<any>(`users/${id}`);
  }
}
