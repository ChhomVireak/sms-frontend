import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-student-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'My Attendance History'" 
                [subtitle]="'Student Portal / Class Attendance History Log'"></app-navbar>

    <div class="p-8 space-y-6 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Top Attendance Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ATTENDANCE RATE</span>
          <h3 class="text-3xl font-extrabold text-emerald-400 mt-2">
            {{ attendanceRate !== null ? attendanceRate + '%' : 'N/A' }}
          </h3>
          <div class="w-full bg-[#111827] h-2 rounded-full mt-2 overflow-hidden border border-[#1f2937]">
            <div [style.width.%]="attendanceRate || 0" class="bg-emerald-500 h-full rounded-full transition-all"></div>
          </div>
          <p class="text-[11px] text-gray-400 mt-1.5 font-semibold">
            {{ attendanceRate !== null ? '✓ Realtime Recorded Rate' : 'No records logged by teacher' }}
          </p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">PRESENT</span>
          <h3 class="text-3xl font-extrabold text-emerald-400 mt-2">{{ presentCount }} {{ presentCount === 1 ? 'Day' : 'Days' }}</h3>
          <p class="text-xs text-emerald-400 mt-1">✓ Attended class sessions</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">LATE / PERMISSION</span>
          <h3 class="text-3xl font-extrabold text-amber-400 mt-2">{{ lateCount }} {{ lateCount === 1 ? 'Day' : 'Days' }}</h3>
          <p class="text-xs text-amber-400 mt-1">Excused / Late arrivals</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ABSENT</span>
          <h3 class="text-3xl font-extrabold text-rose-400 mt-2">{{ absentCount }} {{ absentCount === 1 ? 'Day' : 'Days' }}</h3>
          <p class="text-xs text-rose-400 mt-1">Unexcused absences</p>
        </div>
      </div>

      <!-- Attendance Records Table & Date Filter -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1f2937] pb-4 gap-4">
          <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-cyan-400"></i> Class Attendance History Log
          </h3>

          <!-- Filter Bar: Date Selector & Status Filter -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1">
              <span class="text-xs text-gray-400 font-bold">DATE:</span>
              <input type="date" 
                     [(ngModel)]="selectedDate" 
                     (change)="loadAttendance()"
                     class="bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono">
            </div>

            <select [(ngModel)]="statusFilter" class="bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-bold">
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present Only</option>
              <option value="LATE">Late Only</option>
              <option value="EXCUSED">Permission / Excused Only</option>
              <option value="ABSENT">Absent Only</option>
            </select>

            <button *ngIf="selectedDate || statusFilter !== 'ALL'" (click)="clearFilters()" class="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold border border-rose-500/30 transition-all">
              Clear Filter
            </button>

            <span class="text-xs font-semibold text-gray-400 font-mono">{{ filteredLogs.length }} Logs</span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th class="pb-3">DATE</th>
                <th class="pb-3">SUBJECT</th>
                <th class="pb-3">TEACHER / LECTURER</th>
                <th class="pb-3">STATUS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50 font-mono">
              <tr *ngFor="let a of filteredLogs" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 font-bold text-white">{{ a.date | date:'dd/MM/yyyy' }}</td>
                <td class="py-3.5 font-sans font-bold text-gray-200">
                  <span>{{ a.subject_name || 'Class Subject' }}</span>
                  <span *ngIf="a.subject_code" class="block text-[10px] text-gray-400 font-mono">{{ a.subject_code }}</span>
                </td>
                <td class="py-3.5 font-sans text-gray-300">
                  {{ a.teacher_fname ? (a.teacher_fname + ' ' + (a.teacher_lname || '')) : 'Faculty' }}
                </td>
                <td class="py-3.5 font-sans">
                  <span [ngClass]="{
                    'bg-emerald-950 text-emerald-400 border-emerald-800': isStatus(a.status, 'PRESENT'),
                    'bg-rose-950 text-rose-400 border-rose-800': isStatus(a.status, 'ABSENT'),
                    'bg-amber-950 text-amber-400 border-amber-800': isStatus(a.status, 'LATE'),
                    'bg-indigo-950 text-indigo-300 border-indigo-800': isStatus(a.status, 'EXCUSED') || isStatus(a.status, 'PERMISSION')
                  }" class="px-2.5 py-1 rounded-lg border font-extrabold text-[10px] uppercase">
                    {{ (isStatus(a.status, 'EXCUSED') || isStatus(a.status, 'PERMISSION')) ? 'EXCUSED' : a.status }}
                  </span>
                </td>
              </tr>

              <tr *ngIf="filteredLogs.length === 0">
                <td colspan="4" class="py-8 text-center text-gray-500 italic font-sans">
                  {{ (selectedDate || statusFilter !== 'ALL') ? 'No attendance records found matching selected filter.' : 'No attendance records logged yet by teacher.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class StudentAttendanceComponent implements OnInit {
  attendanceLogs: any[] = [];
  selectedDate: string = '';
  statusFilter: string = 'ALL';

  constructor(private api: ApiService, private socket: SocketService) {}

  ngOnInit(): void {
    this.loadAttendance();
    this.socket.onEvent('attendance_marked').subscribe(() => this.loadAttendance());
    this.socket.onEvent('ATTENDANCE_UPDATED').subscribe(() => this.loadAttendance());
  }

  isStatus(val: string, target: string): boolean {
    return String(val || '').toUpperCase() === target;
  }

  get presentCount(): number {
    return this.attendanceLogs.filter(a => this.isStatus(a.status, 'PRESENT')).length;
  }

  get lateCount(): number {
    return this.attendanceLogs.filter(a => this.isStatus(a.status, 'LATE')).length;
  }

  get excusedCount(): number {
    return this.attendanceLogs.filter(a => this.isStatus(a.status, 'EXCUSED') || this.isStatus(a.status, 'PERMISSION')).length;
  }

  get absentCount(): number {
    return this.attendanceLogs.filter(a => this.isStatus(a.status, 'ABSENT')).length;
  }

  get attendanceRate(): number | null {
    if (this.attendanceLogs.length === 0) return null;
    const presentPlusLate = this.presentCount + this.lateCount;
    return Math.round((presentPlusLate / this.attendanceLogs.length) * 100);
  }

  get filteredLogs(): any[] {
    return this.attendanceLogs.filter(a => {
      const matchesStatus = this.statusFilter === 'ALL' || 
        (this.statusFilter === 'PRESENT' && this.isStatus(a.status, 'PRESENT')) ||
        (this.statusFilter === 'LATE' && this.isStatus(a.status, 'LATE')) ||
        (this.statusFilter === 'EXCUSED' && (this.isStatus(a.status, 'EXCUSED') || this.isStatus(a.status, 'PERMISSION'))) ||
        (this.statusFilter === 'ABSENT' && this.isStatus(a.status, 'ABSENT'));
      
      let matchesDate = true;
      if (this.selectedDate && a.date) {
        const logDateStr = new Date(a.date).toISOString().slice(0, 10);
        matchesDate = logDateStr === this.selectedDate;
      }
      return matchesStatus && matchesDate;
    });
  }

  loadAttendance(): void {
    const params: any = {};
    if (this.selectedDate) {
      params.date = this.selectedDate;
    }
    this.api.get<any>('attendance', params).subscribe({
      next: (res) => {
        this.attendanceLogs = res.data?.attendance || res.data || [];
      },
      error: () => {
        this.attendanceLogs = [];
      }
    });
  }

  clearFilters(): void {
    this.selectedDate = '';
    this.statusFilter = 'ALL';
    this.loadAttendance();
  }
}
