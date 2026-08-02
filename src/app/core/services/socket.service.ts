import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private eventSubject = new Subject<{ event: string; payload: any }>();

  constructor() {
    this.connect();
  }

  private connect(): void {
    const url = 'https://sms-backend-6b23.onrender.com';
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    this.socket.on('connect', () => {
      console.log('⚡ [Realtime Client] Connected to Socket.io server:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.warn('⚠️ [Realtime Client] Disconnected from Socket.io server');
    });

    // Listen to real-time events
    const realTimeEvents = [
      'faculty_created', 'faculty_updated', 'faculty_deleted',
      'program_created', 'program_updated', 'program_deleted',
      'curriculum_created', 'curriculum_updated', 'curriculum_deleted',
      'scores_published', 'exam_created', 'attendance_marked', 'notification_received'
    ];

    realTimeEvents.forEach(evt => {
      this.socket.on(evt, (payload: any) => {
        console.log(`📡 [Realtime Event Received] ${evt}`, payload);
        this.eventSubject.next({ event: evt, payload });
      });
    });
  }

  // Subscribe to all real-time events
  onRealtimeEvent(): Observable<{ event: string; payload: any }> {
    return this.eventSubject.asObservable();
  }

  // Subscribe to specific event name
  onEvent(eventName: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(eventName, (data: any) => observer.next(data));
    });
  }
}
