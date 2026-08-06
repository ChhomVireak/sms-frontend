import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6 text-white text-xs">
      <!-- Header -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-emerald-400">EduTrack SMS Reports</h1>
          <p class="text-gray-400">Comprehensive Academic, Attendance, Financial, & Operational Analytics</p>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="printReport()" class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg">
            <i class="fa-solid fa-print"></i> Print / PDF
          </button>
          <button (click)="exportCSV()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg">
            <i class="fa-solid fa-file-csv"></i> Export CSV
          </button>
        </div>
      </div>

      <!-- Main Category Tabs -->
      <div class="flex flex-wrap items-center gap-2 bg-[#111827] p-2 rounded-xl border border-[#1f2937]">
        <button (click)="setCategory('academic')" [class.bg-emerald-600]="activeCategory === 'academic'" class="px-4 py-2 rounded-lg font-bold transition-all">
          <i class="fa-solid fa-graduation-cap mr-1"></i> Academic
        </button>
        <button (click)="setCategory('attendance')" [class.bg-emerald-600]="activeCategory === 'attendance'" class="px-4 py-2 rounded-lg font-bold transition-all">
          <i class="fa-solid fa-clipboard-user mr-1"></i> Attendance
        </button>
        <button (click)="setCategory('financial')" [class.bg-emerald-600]="activeCategory === 'financial'" class="px-4 py-2 rounded-lg font-bold transition-all">
          <i class="fa-solid fa-coins mr-1"></i> Financial
        </button>
        <button (click)="setCategory('enrollment')" [class.bg-emerald-600]="activeCategory === 'enrollment'" class="px-4 py-2 rounded-lg font-bold transition-all">
          <i class="fa-solid fa-building-columns mr-1"></i> Enrollment
        </button>
        <button (click)="setCategory('exam')" [class.bg-emerald-600]="activeCategory === 'exam'" class="px-4 py-2 rounded-lg font-bold transition-all">
          <i class="fa-solid fa-file-pen mr-1"></i> Exam
        </button>
        <button (click)="setCategory('teacher')" [class.bg-emerald-600]="activeCategory === 'teacher'" class="px-4 py-2 rounded-lg font-bold transition-all">
          <i class="fa-solid fa-chalkboard-user mr-1"></i> Teacher/Staff
        </button>
      </div>

      <!-- Sub-Report Sub-Tabs -->
      <div class="flex flex-wrap items-center gap-2 bg-[#1e293b] p-2 rounded-xl border border-[#1f2937]">
        <ng-container [ngSwitch]="activeCategory">
          <!-- Academic Sub-tabs -->
          <ng-container *ngSwitchCase="'academic'">
            <button (click)="setSubReport('academic_gpa')" [class.bg-emerald-500]="activeSubReport === 'academic_gpa'" class="px-3 py-1.5 rounded-md font-semibold">GPA Report</button>
            <button (click)="setSubReport('academic_ranking')" [class.bg-emerald-500]="activeSubReport === 'academic_ranking'" class="px-3 py-1.5 rounded-md font-semibold">Class Ranking</button>
            <button (click)="setSubReport('academic_reexam')" [class.bg-emerald-500]="activeSubReport === 'academic_reexam'" class="px-3 py-1.5 rounded-md font-semibold">Re-exam / Retained</button>
            <button (click)="setSubReport('academic_passfail')" [class.bg-emerald-500]="activeSubReport === 'academic_passfail'" class="px-3 py-1.5 rounded-md font-semibold">Subject Pass/Fail</button>
          </ng-container>

          <!-- Attendance Sub-tabs -->
          <ng-container *ngSwitchCase="'attendance'">
            <button (click)="setSubReport('attendance_student')" [class.bg-emerald-500]="activeSubReport === 'attendance_student'" class="px-3 py-1.5 rounded-md font-semibold">Student Summary</button>
            <button (click)="setSubReport('attendance_class')" [class.bg-emerald-500]="activeSubReport === 'attendance_class'" class="px-3 py-1.5 rounded-md font-semibold">Class Attendance Rate</button>
            <button (click)="setSubReport('attendance_teacher')" [class.bg-emerald-500]="activeSubReport === 'attendance_teacher'" class="px-3 py-1.5 rounded-md font-semibold">Teacher Check-in</button>
          </ng-container>

          <!-- Financial Sub-tabs -->
          <ng-container *ngSwitchCase="'financial'">
            <button (click)="setSubReport('financial_outstanding')" [class.bg-emerald-500]="activeSubReport === 'financial_outstanding'" class="px-3 py-1.5 rounded-md font-semibold">Outstanding Balances</button>
            <button (click)="setSubReport('financial_collection')" [class.bg-emerald-500]="activeSubReport === 'financial_collection'" class="px-3 py-1.5 rounded-md font-semibold">Payment Collection</button>
            <button (click)="setSubReport('financial_revenue')" [class.bg-emerald-500]="activeSubReport === 'financial_revenue'" class="px-3 py-1.5 rounded-md font-semibold">Revenue by Program</button>
          </ng-container>

          <!-- Enrollment Sub-tabs -->
          <ng-container *ngSwitchCase="'enrollment'">
            <button (click)="setSubReport('enrollment_class')" [class.bg-emerald-500]="activeSubReport === 'enrollment_class'" class="px-3 py-1.5 rounded-md font-semibold">Class Summary</button>
            <button (click)="setSubReport('enrollment_program')" [class.bg-emerald-500]="activeSubReport === 'enrollment_program'" class="px-3 py-1.5 rounded-md font-semibold">Program Enrollment</button>
            <button (click)="setSubReport('enrollment_faculty')" [class.bg-emerald-500]="activeSubReport === 'enrollment_faculty'" class="px-3 py-1.5 rounded-md font-semibold">Faculty Summary</button>
          </ng-container>

          <!-- Exam Sub-tabs -->
          <ng-container *ngSwitchCase="'exam'">
            <button (click)="setSubReport('exam_schedule')" [class.bg-emerald-500]="activeSubReport === 'exam_schedule'" class="px-3 py-1.5 rounded-md font-semibold">Exam Schedule</button>
            <button (click)="setSubReport('exam_room')" [class.bg-emerald-500]="activeSubReport === 'exam_room'" class="px-3 py-1.5 rounded-md font-semibold">Room Utilization</button>
          </ng-container>

          <!-- Teacher Sub-tabs -->
          <ng-container *ngSwitchCase="'teacher'">
            <button (click)="setSubReport('teacher_workload')" [class.bg-emerald-500]="activeSubReport === 'teacher_workload'" class="px-3 py-1.5 rounded-md font-semibold">Teacher Workload</button>
            <button (click)="setSubReport('teacher_payroll')" [class.bg-emerald-500]="activeSubReport === 'teacher_payroll'" class="px-3 py-1.5 rounded-md font-semibold">Payroll Summary</button>
          </ng-container>
        </ng-container>
      </div>

      <!-- Filters Panel -->
      <div class="bg-[#1e293b] p-4 rounded-xl border border-[#1f2937] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-gray-400 mb-1">Class Group</label>
          <select [(ngModel)]="filters.group_id" (change)="fetchReport()" class="w-full bg-[#111827] border border-[#1f2937] p-2 rounded-lg text-white">
            <option value="ALL">All Groups</option>
            <option *ngFor="let g of groups" [value]="g.group_id">{{ g.group_code }} — {{ g.group_name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-gray-400 mb-1">Program / Major</label>
          <select [(ngModel)]="filters.program_id" (change)="fetchReport()" class="w-full bg-[#111827] border border-[#1f2937] p-2 rounded-lg text-white">
            <option value="ALL">All Programs</option>
            <option *ngFor="let p of programs" [value]="p.program_id">{{ p.program_code }} — {{ p.program_name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-gray-400 mb-1">Semester</label>
          <select [(ngModel)]="filters.semester" (change)="fetchReport()" class="w-full bg-[#111827] border border-[#1f2937] p-2 rounded-lg text-white">
            <option value="ALL">All Semesters</option>
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
          </select>
        </div>

        <div>
          <label class="block text-gray-400 mb-1">Academic Year</label>
          <select [(ngModel)]="filters.academic_year" (change)="fetchReport()" class="w-full bg-[#111827] border border-[#1f2937] p-2 rounded-lg text-white">
            <option value="ALL">All Academic Years</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
          </select>
        </div>
      </div>

      <!-- Report Data Grid -->
      <div class="bg-[#1e293b] border border-[#1f2937] rounded-xl overflow-hidden shadow-xl">
        <div *ngIf="loading" class="p-12 text-center text-emerald-400 font-semibold">
          <i class="fa-solid fa-circle-notch fa-spin text-2xl mb-2"></i>
          <div>Loading {{ activeSubReport }} Data...</div>
        </div>

        <div *ngIf="!loading && reportData.length === 0" class="p-12 text-center text-gray-400">
          <i class="fa-solid fa-folder-open text-3xl mb-2 text-gray-500"></i>
          <div>No records found matching the current filters.</div>
        </div>

        <div *ngIf="!loading && reportData.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-[#111827] text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th *ngFor="let k of getHeaders()" class="p-3 border-b border-[#1f2937]">
                  {{ formatHeader(k) }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]">
              <tr *ngFor="let row of reportData" class="hover:bg-[#111827]/50 transition-colors">
                <td *ngFor="let k of getHeaders()" class="p-3 font-mono">
                  {{ row[k] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  activeCategory: 'academic' | 'attendance' | 'financial' | 'enrollment' | 'exam' | 'teacher' = 'academic';
  activeSubReport = 'academic_gpa';
  loading = false;

  filters = {
    group_id: 'ALL',
    program_id: 'ALL',
    semester: 'ALL',
    academic_year: 'ALL'
  };

  groups: any[] = [];
  programs: any[] = [];
  reportData: any[] = [];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadFilterDropdowns();
    this.fetchReport();
  }

  loadFilterDropdowns(): void {
    this.api.get<any>('groups').subscribe(res => this.groups = res.data?.groups || res.data || []);
    this.api.get<any>('programs').subscribe(res => this.programs = res.data?.programs || res.data || []);
  }

  setCategory(cat: 'academic' | 'attendance' | 'financial' | 'enrollment' | 'exam' | 'teacher'): void {
    this.activeCategory = cat;
    switch (cat) {
      case 'academic': this.activeSubReport = 'academic_gpa'; break;
      case 'attendance': this.activeSubReport = 'attendance_student'; break;
      case 'financial': this.activeSubReport = 'financial_outstanding'; break;
      case 'enrollment': this.activeSubReport = 'enrollment_class'; break;
      case 'exam': this.activeSubReport = 'exam_schedule'; break;
      case 'teacher': this.activeSubReport = 'teacher_workload'; break;
    }
    this.fetchReport();
  }

  setSubReport(sub: string): void {
    this.activeSubReport = sub;
    this.fetchReport();
  }

  fetchReport(): void {
    this.loading = true;
    let endpoint = '';

    switch (this.activeSubReport) {
      case 'academic_gpa':
        endpoint = `reports/academic/gpa?group_id=${this.filters.group_id}&program_id=${this.filters.program_id}&semester=${this.filters.semester}&academic_year=${this.filters.academic_year}`;
        break;
      case 'academic_ranking':
        endpoint = `reports/academic/class-ranking?group_id=${this.filters.group_id}&semester=${this.filters.semester}`;
        break;
      case 'academic_reexam':
        endpoint = `reports/academic/reexam-retained?group_id=${this.filters.group_id}&program_id=${this.filters.program_id}`;
        break;
      case 'academic_passfail':
        endpoint = `reports/academic/subject-pass-fail?semester=${this.filters.semester}&academic_year=${this.filters.academic_year}`;
        break;
      case 'attendance_student':
        endpoint = `reports/attendance/student-summary?group_id=${this.filters.group_id}`;
        break;
      case 'attendance_class':
        endpoint = `reports/attendance/class-rate`;
        break;
      case 'attendance_teacher':
        endpoint = `reports/attendance/teacher-checkin`;
        break;
      case 'financial_outstanding':
        endpoint = `reports/financial/outstanding?group_id=${this.filters.group_id}&program_id=${this.filters.program_id}`;
        break;
      case 'financial_collection':
        endpoint = `reports/financial/collection`;
        break;
      case 'financial_revenue':
        endpoint = `reports/financial/revenue-program`;
        break;
      case 'enrollment_class':
        endpoint = `reports/enrollment/class-summary`;
        break;
      case 'enrollment_program':
        endpoint = `reports/enrollment/program-enrollment`;
        break;
      case 'enrollment_faculty':
        endpoint = `reports/enrollment/faculty-summary`;
        break;
      case 'exam_schedule':
        endpoint = `reports/exam/schedule?semester=${this.filters.semester}&academic_year=${this.filters.academic_year}`;
        break;
      case 'exam_room':
        endpoint = `reports/exam/room-utilization`;
        break;
      case 'teacher_workload':
        endpoint = `reports/teacher/workload`;
        break;
      case 'teacher_payroll':
        endpoint = `reports/teacher/payroll`;
        break;
      default:
        endpoint = `reports/academic/gpa`;
    }

    this.api.get<any>(endpoint).subscribe({
      next: (res) => {
        const raw = res.data?.report || res.data?.results || [];
        this.reportData = Array.isArray(raw) ? raw : [];
        this.loading = false;
      },
      error: () => {
        this.reportData = [];
        this.loading = false;
      }
    });
  }

  getHeaders(): string[] {
    if (!this.reportData || this.reportData.length === 0) return [];
    return Object.keys(this.reportData[0]);
  }

  formatHeader(header: string): string {
    return header.replace(/_/g, ' ');
  }

  printReport(): void {
    if (!this.reportData || this.reportData.length === 0) {
      this.toast.error('No report data available to print');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (!printWindow) {
      this.toast.error('Pop-up blocked. Please allow pop-ups for printing.');
      return;
    }

    const headers = this.getHeaders();
    const title = this.activeSubReport.replace(/_/g, ' ').toUpperCase() + ' REPORT';
    const currentDate = new Date().toLocaleDateString();

    let tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:20px;">`;
    tableHtml += `<thead style="background:#f1f5f9; text-transform:uppercase;"><tr>`;
    headers.forEach(h => {
      tableHtml += `<th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">${this.formatHeader(h)}</th>`;
    });
    tableHtml += `</tr></thead><tbody>`;

    this.reportData.forEach(row => {
      tableHtml += `<tr>`;
      headers.forEach(h => {
        tableHtml += `<td style="border:1px solid #cbd5e1; padding:8px;">${row[h] ?? ''}</td>`;
      });
      tableHtml += `</tr>`;
    });
    tableHtml += `</tbody></table>`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #0284c7; font-size: 24px; }
            .header p { margin: 5px 0 0 0; color: #64748b; font-size: 13px; }
            .meta { display: flex; justify-content: space-between; font-size: 12px; color: #475569; }
            @media print {
              body { padding: 0; }
              @page { size: A4 landscape; margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>EduTrack SMS — ${title}</h1>
            <p>Official Academic & Administrative Management Report</p>
          </div>
          <div class="meta">
            <div><strong>Report Category:</strong> ${this.activeCategory.toUpperCase()}</div>
            <div><strong>Generated On:</strong> ${currentDate}</div>
            <div><strong>Total Records:</strong> ${this.reportData.length}</div>
          </div>
          ${tableHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  exportCSV(): void {
    if (!this.reportData || this.reportData.length === 0) {
      this.toast.error('No data available to export');
      return;
    }

    const headers = this.getHeaders();
    let csvStr = headers.join(',') + '\n';
    this.reportData.forEach(row => {
      csvStr += headers.map(k => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.activeSubReport}_report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
