import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private api: ApiService) {}

  getNotifications(): Observable<any> {
    return this.api.get<any>('notifications');
  }

  createNotification(payload: any): Observable<any> {
    return this.api.post<any>('notifications', payload);
  }

  deleteNotification(id: number): Observable<any> {
    return this.api.delete<any>(`notifications/${id}`);
  }
}
