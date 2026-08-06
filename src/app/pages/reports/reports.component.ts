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

        <div *ngIf="!loading && reportData.length > 0" class="overflow-x-auto overflow-y-auto max-h-[550px] custom-scrollbar border-b border-[#1f2937]">
          <table class="w-full text-left border-collapse">
            <thead class="bg-[#111827] text-gray-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 shadow-md">
              <tr>
                <th class="p-3 border-b border-[#1f2937] text-center w-12 bg-[#111827]">#</th>
                <th *ngFor="let k of getHeaders()" class="p-3 border-b border-[#1f2937] bg-[#111827]">
                  {{ formatHeader(k) }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]">
              <tr *ngFor="let row of paginatedReportData; let idx = index" class="hover:bg-[#111827]/50 transition-colors">
                <td class="p-3 text-center text-gray-400 font-mono text-[11px]">{{ startIndex + idx }}</td>
                <td *ngFor="let k of getHeaders()" class="p-3 font-mono">
                  <ng-container [ngSwitch]="getStatusBadgeType(row[k])">
                    <span *ngSwitchCase="'success'" class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">{{ row[k] }}</span>
                    <span *ngSwitchCase="'danger'" class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">{{ row[k] }}</span>
                    <span *ngSwitchCase="'warning'" class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">{{ row[k] }}</span>
                    <span *ngSwitchDefault>{{ row[k] }}</span>
                  </ng-container>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls Bar -->
        <div *ngIf="!loading && reportData.length > 0" class="p-4 bg-[#111827] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1f2937]">
          <div class="flex items-center gap-3 text-gray-400 text-xs">
            <span>Showing <strong class="text-white">{{ startIndex }}</strong> to <strong class="text-white">{{ endIndex }}</strong> of <strong class="text-white">{{ reportData.length }}</strong> entries</span>
            <div class="flex items-center gap-1.5 ml-2">
              <span>Per page:</span>
              <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="bg-[#1e293b] border border-[#1f2937] text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-emerald-500">
                <option *ngFor="let opt of pageSizeOptions" [value]="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button (click)="goToPage(1)" [disabled]="currentPage === 1" class="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold">
              <i class="fa-solid fa-angles-left"></i>
            </button>
            <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1" class="px-3 py-1 rounded bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold">
              <i class="fa-solid fa-angle-left mr-1"></i> Prev
            </button>
            
            <span class="px-3 py-1 text-xs font-bold text-emerald-400 bg-[#1e293b] rounded border border-emerald-900/50">
              Page {{ currentPage }} of {{ totalPages }}
            </span>

            <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages" class="px-3 py-1 rounded bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold">
              Next <i class="fa-solid fa-angle-right ml-1"></i>
            </button>
            <button (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages" class="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold">
              <i class="fa-solid fa-angles-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #0f172a;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #059669;
    }
  `]
})
export class ReportsComponent implements OnInit {
  activeCategory: 'academic' | 'attendance' | 'financial' | 'enrollment' | 'exam' | 'teacher' = 'academic';
  activeSubReport = 'academic_gpa';
  loading = false;

  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];

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
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.reportData = [];
        this.currentPage = 1;
        this.loading = false;
      }
    });
  }

  get paginatedReportData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reportData.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil((this.reportData?.length || 0) / this.pageSize) || 1;
  }

  get startIndex(): number {
    return this.reportData.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.reportData.length);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  getStatusBadgeType(val: any): string {
    if (val === null || val === undefined) return 'default';
    const str = String(val).toUpperCase();
    if (['PAID', 'COMPLETED', 'PRESENT', 'PASSED'].includes(str)) return 'success';
    if (['UNPAID', 'FAILED', 'ABSENT', 'RETAINED'].includes(str)) return 'danger';
    if (['PENDING', 'PARTIAL', 'LATE', 'REEXAM'].includes(str)) return 'warning';
    return 'default';
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

    const printWindow = window.open('', '_blank', 'width=1150,height=850');
    if (!printWindow) {
      this.toast.error('Pop-up blocked. Please allow pop-ups for printing.');
      return;
    }

    const headers = this.getHeaders();
    const title = this.activeSubReport.replace(/_/g, ' ').toUpperCase();
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const refNumber = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    let tableRowsHtml = '';
    this.reportData.forEach((row, idx) => {
      const isEven = idx % 2 === 0;
      tableRowsHtml += `<tr style="background-color: ${isEven ? '#ffffff' : '#f8fafc'};">`;
      tableRowsHtml += `<td style="border: 1px solid #cbd5e1; padding: 7px 10px; text-align: center; font-weight: 600; color: #64748b;">${idx + 1}</td>`;
      headers.forEach(h => {
        let val = row[h] ?? '';
        let cellContent = String(val);

        // Render status badges with clean colors
        const strVal = String(val).toUpperCase();
        if (['PAID', 'COMPLETED', 'PRESENT', 'PASSED'].includes(strVal)) {
          cellContent = `<span style="background-color: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">${val}</span>`;
        } else if (['UNPAID', 'FAILED', 'ABSENT', 'RETAINED'].includes(strVal)) {
          cellContent = `<span style="background-color: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">${val}</span>`;
        } else if (['PENDING', 'PARTIAL', 'LATE', 'REEXAM'].includes(strVal)) {
          cellContent = `<span style="background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">${val}</span>`;
        }

        tableRowsHtml += `<td style="border: 1px solid #cbd5e1; padding: 7px 10px;">${cellContent}</td>`;
      });
      tableRowsHtml += `</tr>`;
    });

    let headerColsHtml = `<th style="border: 1px solid #0f172a; padding: 9px 10px; text-align: center; width: 40px;">#</th>`;
    headers.forEach(h => {
      headerColsHtml += `<th style="border: 1px solid #0f172a; padding: 9px 10px; text-align: left;">${this.formatHeader(h).toUpperCase()}</th>`;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>EduTrack SMS — ${title} REPORT</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              @page { size: A4 landscape; margin: 12mm 10mm; }
              .no-print { display: none !important; }
            }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 24px;
              background-color: #ffffff;
              font-size: 11.5px;
            }
            .report-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px double #0284c7;
              padding-bottom: 14px;
              margin-bottom: 16px;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .brand-logo {
              width: 44px;
              height: 44px;
              background: linear-gradient(135deg, #0284c7, #0d9488);
              color: #ffffff;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 22px;
              font-weight: bold;
            }
            .brand-title {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.5px;
              margin: 0;
            }
            .brand-subtitle {
              font-size: 11px;
              color: #64748b;
              margin: 2px 0 0 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .doc-info {
              text-align: right;
              font-size: 11px;
              color: #475569;
            }
            .doc-info strong {
              color: #0f172a;
            }
            .report-title-bar {
              background: #f1f5f9;
              border-left: 4px solid #0284c7;
              padding: 10px 14px;
              border-radius: 0 6px 6px 0;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .report-title {
              font-size: 15px;
              font-weight: 700;
              color: #0369a1;
              margin: 0;
            }
            .filter-chips {
              display: flex;
              gap: 10px;
              font-size: 11px;
            }
            .chip {
              background: #ffffff;
              border: 1px solid #cbd5e1;
              padding: 3px 8px;
              border-radius: 4px;
              color: #334155;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            thead th {
              background-color: #0f172a !important;
              color: #ffffff !important;
              font-size: 10.5px;
              letter-spacing: 0.5px;
            }
            .signature-section {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .sig-box {
              text-align: center;
              width: 200px;
            }
            .sig-line {
              margin-top: 50px;
              border-bottom: 1px solid #94a3b8;
            }
            .sig-title {
              font-size: 11px;
              font-weight: 600;
              color: #334155;
              margin-top: 6px;
            }
            .footer-notice {
              margin-top: 24px;
              padding-top: 10px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div class="brand">
              <div class="brand-logo">E</div>
              <div>
                <h1 class="brand-title">EduTrack SMS</h1>
                <p class="brand-subtitle">School Management & Academic Information System</p>
              </div>
            </div>
            <div class="doc-info">
              <div>Ref No: <strong>${refNumber}</strong></div>
              <div>Date Generated: <strong>${currentDate}</strong></div>
              <div>Total Records: <strong>${this.reportData.length}</strong></div>
            </div>
          </div>

          <div class="report-title-bar">
            <h2 class="report-title">${title} REPORT</h2>
            <div class="filter-chips">
              <span class="chip"><strong>Group:</strong> ${this.filters.group_id}</span>
              <span class="chip"><strong>Program:</strong> ${this.filters.program_id}</span>
              <span class="chip"><strong>Semester:</strong> ${this.filters.semester}</span>
              <span class="chip"><strong>Year:</strong> ${this.filters.academic_year}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>${headerColsHtml}</tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <div class="signature-section">
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-title">Prepared By (Registrar)</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-title">Verified By (Department Head)</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-title">Approved By (School Director)</div>
            </div>
          </div>

          <div class="footer-notice">
            Confidential Document — Generated automatically by EduTrack SMS. Authorized academic copy.
          </div>

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
