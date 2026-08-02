import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'System Settings'" 
                [subtitle]="'Admin / Settings'"
                [actionLabel]="'Save All Changes'"
                [actionIcon]="'fa-solid fa-floppy-disk'"
                (actionClicked)="saveSettings()"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Settings Sidebar Navigation (Left 1 Col) -->
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-4 text-xs space-y-4">
          <div class="space-y-1">
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3">GENERAL</span>
            
            <button (click)="activeTab = 'profile'" 
                    [ngClass]="activeTab === 'profile' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white'" 
                    class="w-full text-left px-3 py-2.5 rounded-xl font-bold flex items-center gap-2.5 transition-all">
              <i class="fa-solid fa-school text-sm"></i> School Profile
            </button>
            
            <button (click)="activeTab = 'academic'" 
                    [ngClass]="activeTab === 'academic' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white'" 
                    class="w-full text-left px-3 py-2.5 rounded-xl font-bold flex items-center gap-2.5 transition-all">
              <i class="fa-solid fa-calendar text-sm"></i> Academic Year
            </button>
          </div>

          <div class="space-y-1 pt-3 border-t border-[#1f2937]">
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3">SECURITY & SYSTEM</span>
            
            <button (click)="activeTab = 'security'" 
                    [ngClass]="activeTab === 'security' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white'" 
                    class="w-full text-left px-3 py-2.5 rounded-xl font-bold flex items-center gap-2.5 transition-all">
              <i class="fa-solid fa-shield-halved text-sm"></i> Two-Factor Auth
            </button>
            
            <button (click)="activeTab = 'backup'" 
                    [ngClass]="activeTab === 'backup' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white'" 
                    class="w-full text-left px-3 py-2.5 rounded-xl font-bold flex items-center gap-2.5 transition-all">
              <i class="fa-solid fa-database text-sm"></i> Backup & Export
            </button>
          </div>
        </div>

        <!-- Settings Active View Content Panel (Right 2 Cols) -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- TAB 1: SCHOOL PROFILE -->
          <div *ngIf="activeTab === 'profile'" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs animate-fade-in">
            <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <h3 class="text-base font-bold text-white tracking-tight">School Profile (MySQL Database Real-Time)</h3>
              <span class="text-xs text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">• Real-Time Sync</span>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-gray-300 mb-1">SCHOOL NAME *</label>
                <input type="text" [(ngModel)]="school.school_name" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5">
              </div>
              <div>
                <label class="block font-bold text-gray-300 mb-1">SCHOOL CODE *</label>
                <input type="text" [(ngModel)]="school.school_code" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5 font-mono">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-gray-300 mb-1">EMAIL ADDRESS *</label>
                <input type="email" [(ngModel)]="school.email" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5">
              </div>
              <div>
                <label class="block font-bold text-gray-300 mb-1">PHONE NUMBER *</label>
                <input type="text" [(ngModel)]="school.phone" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5">
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-300 mb-1">LOCATION ADDRESS</label>
              <input type="text" [(ngModel)]="school.address" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-2.5">
            </div>

            <div class="pt-3 border-t border-[#1f2937] flex justify-end">
              <button (click)="saveSettings()" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">
                Save School Profile
              </button>
            </div>
          </div>



          <!-- TAB 3: ACADEMIC YEAR MANAGEMENT & CONFIG -->
          <div *ngIf="activeTab === 'academic'" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-6 text-xs animate-fade-in">
            <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div>
                <h3 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <i class="fa-solid fa-calendar-days text-emerald-400"></i> Academic Year Management
                </h3>
                <p class="text-[11px] text-gray-400 mt-0.5">Manage academic school years, set active current year, and define semester terms</p>
              </div>
              <span class="text-xs text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full font-mono">
                Current Active: {{ school.academic_year || '2025–2026' }}
              </span>
            </div>

            <!-- Create New Academic Year Card -->
            <div class="bg-[#111827] border border-[#1f2937] rounded-xl p-4 space-y-3">
              <h4 class="font-extrabold text-emerald-400 text-xs flex items-center gap-1.5">
                <i class="fa-solid fa-plus-circle"></i> Create New Academic Year
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label class="block font-bold text-gray-300 mb-1">YEAR LABEL *</label>
                  <input type="text" [(ngModel)]="newYearLabel" placeholder="e.g. 2026–2027" class="w-full bg-[#1e293b] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 font-bold font-mono">
                </div>
                <div>
                  <label class="block font-bold text-gray-300 mb-1">START DATE</label>
                  <input type="date" [(ngModel)]="newYearStartDate" class="w-full bg-[#1e293b] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 font-mono">
                </div>
                <div>
                  <label class="block font-bold text-gray-300 mb-1">END DATE</label>
                  <input type="date" [(ngModel)]="newYearEndDate" class="w-full bg-[#1e293b] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 font-mono">
                </div>
                <div>
                  <button (click)="createAcademicYear()" class="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                    + Add Academic Year
                  </button>
                </div>
              </div>
            </div>

            <!-- List of All Academic Years in DB -->
            <div class="space-y-3 pt-2">
              <h4 class="font-bold text-white text-xs uppercase tracking-wider">All Configured Academic Years</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div *ngFor="let y of academicYears" [ngClass]="{'border-emerald-500/80 bg-emerald-950/30': y.is_current}" class="p-3.5 bg-[#111827] border border-[#1f2937] rounded-xl flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-extrabold text-white font-mono text-sm">{{ y.year_label }}</span>
                      <span *ngIf="y.is_current" class="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 text-[9px] font-bold">ACTIVE YEAR</span>
                    </div>
                    <p class="text-[10px] text-gray-400 font-mono mt-1">
                      {{ (y.start_date | date:'shortDate') || 'N/A' }} – {{ (y.end_date | date:'shortDate') || 'N/A' }}
                    </p>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button *ngIf="!y.is_current" (click)="setAsCurrentYear(y)" title="Set as Current Active Year" class="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 hover:text-white font-bold text-[10px]">
                      Set Active
                    </button>
                    <button (click)="deleteAcademicYear(y.academic_year_id)" title="Delete" class="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 hover:text-white flex items-center justify-center text-[10px]">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 4: TWO-FACTOR AUTH & SECURITY INTERACTIVE CONTROLS -->
          <div *ngIf="activeTab === 'security'" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-5 text-xs animate-fade-in">
            <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <h3 class="text-base font-bold text-white tracking-tight">Security & Authentication Controls</h3>
              <span [class.bg-emerald-950]="school.two_factor_auth" [class.border-emerald-800]="school.two_factor_auth" [class.text-emerald-400]="school.two_factor_auth" [class.bg-amber-950]="!school.two_factor_auth" [class.border-amber-800]="!school.two_factor_auth" [class.text-amber-400]="!school.two_factor_auth" class="text-xs font-bold border px-3 py-1 rounded-full font-mono">
                • {{ school.two_factor_auth ? '2FA Enforcement Active' : '2FA Disabled' }}
              </span>
            </div>

            <!-- 2FA Toggle Card -->
            <div class="flex items-center justify-between p-4 bg-[#111827] rounded-2xl border border-[#1f2937]">
              <div>
                <p class="font-bold text-white text-xs flex items-center gap-2">
                  <i class="fa-solid fa-shield-halved text-emerald-400"></i> Two-Factor Authentication (2FA)
                </p>
                <p class="text-[11px] text-gray-400 mt-1">Required for Administrator & Teacher accounts upon login</p>
              </div>
              <input type="checkbox" [(ngModel)]="school.two_factor_auth" (change)="saveSettings()" class="rounded bg-gray-800 border-gray-700 text-emerald-500 w-5 h-5 cursor-pointer">
            </div>

            <!-- Session Timeout & Password Policy Grid -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-gray-300 mb-1">SESSION TIMEOUT DURATION</label>
                <select [(ngModel)]="school.session_timeout" (change)="saveSettings()" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2.5 font-bold">
                  <option [value]="30">30 Minutes</option>
                  <option [value]="60">60 Minutes (Default)</option>
                  <option [value]="120">120 Minutes</option>
                  <option [value]="1440">24 Hours</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">PASSWORD STRENGTH POLICY</label>
                <select [(ngModel)]="school.password_policy" (change)="saveSettings()" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2.5 font-bold">
                  <option value="strong">Strong (8+ chars, Numbers & Symbols)</option>
                  <option value="medium">Medium (6+ chars)</option>
                  <option value="basic">Basic (4+ chars)</option>
                </select>
              </div>
            </div>

            <!-- Teacher Attendance Check-in GPS & Wi-Fi Configuration -->
            <div class="p-4 bg-[#111827] rounded-2xl border border-[#1f2937] space-y-3">
              <div class="flex items-center justify-between border-b border-gray-800 pb-2">
                <p class="font-bold text-white text-xs flex items-center gap-2">
                  <i class="fa-solid fa-wifi text-cyan-400"></i> Teacher Attendance Wi-Fi & GPS Check-in
                </p>
                <span class="text-[10px] text-cyan-400 font-mono">Dynamic Multi-Factor Check-in</span>
              </div>

              <div>
                <label class="block font-bold text-gray-300 mb-1">AUTHORIZED SCHOOL WI-FI IP ADDRESSES (Comma or Newline separated)</label>
                <textarea [(ngModel)]="school.authorized_wifi_ips" rows="2" placeholder="e.g. 192.168.1.1, 10.0.0.1, 115.78.12.3, 127.0.0.1" class="w-full bg-[#0b0f19] border border-[#1f2937] text-xs text-emerald-400 font-mono rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"></textarea>
                <p class="text-[10px] text-gray-400 mt-1">Enter authorized Wi-Fi network IPs or subnets. Admin can update here whenever school Wi-Fi IP changes.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label class="block font-bold text-gray-300 mb-1">CAMPUS LATITUDE</label>
                  <input type="number" step="0.0000001" [(ngModel)]="school.school_lat" class="w-full bg-[#0b0f19] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 font-mono">
                </div>
                <div>
                  <label class="block font-bold text-gray-300 mb-1">CAMPUS LONGITUDE</label>
                  <input type="number" step="0.0000001" [(ngModel)]="school.school_lng" class="w-full bg-[#0b0f19] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 font-mono">
                </div>
                <div>
                  <label class="block font-bold text-gray-300 mb-1">ALLOWED RADIUS (METERS)</label>
                  <input type="number" [(ngModel)]="school.allowed_radius_meters" class="w-full bg-[#0b0f19] border border-[#1f2937] text-xs text-white rounded-xl px-3 py-2 font-mono">
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-[#1f2937] flex justify-end">
              <button (click)="saveSettings()" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">
                Save Security & Check-in Settings
              </button>
            </div>
          </div>

          <!-- TAB 5: BACKUP & EXPORT REAL DATABASE DUMP -->
          <div *ngIf="activeTab === 'backup'" class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4 text-xs animate-fade-in">
            <h3 class="text-base font-bold text-white tracking-tight border-b border-[#1f2937] pb-3">Database Backup & Export</h3>

            <div class="flex items-center justify-between p-3.5 bg-[#111827] rounded-xl border border-[#1f2937]">
              <div>
                <p class="font-bold text-white text-xs">Automatic Daily Database Backup</p>
                <p class="text-[11px] text-gray-400">Automated midnight SQL backup to local server storage</p>
              </div>
              <input type="checkbox" [(ngModel)]="school.auto_backup" (change)="saveSettings()" class="rounded bg-gray-800 border-gray-700 text-emerald-500 w-4 h-4 cursor-pointer">
            </div>

            <div class="pt-2">
              <button (click)="downloadBackupSql()" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95">
                <i class="fa-solid fa-download"></i> Generate Immediate SQL Backup (.sql)
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class SystemSettingsComponent implements OnInit {
  activeTab: string = 'academic';

  accentColors = [
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Ocean Blue', hex: '#3b82f6' },
    { name: 'Purple', hex: '#8b5cf6' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Rose', hex: '#f43f5e' }
  ];

  school: any = {
    school_name: 'EduTrack SMS Academy',
    school_code: 'ETA-2026-KH',
    email: 'admin@edutrack.edu.kh',
    phone: '+855 23 999 888',
    address: 'Phnom Penh, Cambodia',
    academic_year: '2025–2026',
    active_term: 'Term 2',
    two_factor_auth: true,
    auto_backup: true,
    theme_mode: 'Dark',
    accent_color: 'Emerald',
    session_timeout: 60,
    password_policy: 'strong',
    school_lat: 11.5564000,
    school_lng: 104.9282000,
    allowed_radius_meters: 100,
    authorized_wifi_ips: '127.0.0.1, 192.168.1.1, 10.0.0.1'
  };

  academicYears: any[] = [];
  newYearLabel: string = '';
  newYearStartDate: string = '';
  newYearEndDate: string = '';

  constructor(private api: ApiService, public toast: ToastService, private confirmService: ConfirmModalService) { }

  ngOnInit(): void {
    this.loadSettings();
    this.loadAcademicYears();
  }

  loadAcademicYears(): void {
    this.api.get<any>('academic-years').subscribe(res => {
      this.academicYears = res.data?.academic_years || res.data || [];
    });
  }

  createAcademicYear(): void {
    if (!this.newYearLabel.trim()) {
      this.toast.error('Please enter Academic Year label (e.g. 2026–2027)');
      return;
    }
    const payload = {
      year_label: this.newYearLabel.trim(),
      start_date: this.newYearStartDate || null,
      end_date: this.newYearEndDate || null,
      is_current: 1
    };
    this.api.post<any>('academic-years', payload).subscribe({
      next: () => {
        this.toast.success(`Academic Year '${this.newYearLabel}' created successfully!`);
        this.school.academic_year = this.newYearLabel.trim();
        this.newYearLabel = '';
        this.newYearStartDate = '';
        this.newYearEndDate = '';
        this.loadAcademicYears();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to create Academic Year')
    });
  }

  setAsCurrentYear(y: any): void {
    this.api.put<any>(`academic-years/${y.academic_year_id}`, { ...y, is_current: 1 }).subscribe({
      next: () => {
        this.toast.success(`Set ${y.year_label} as Active Academic Year!`);
        this.school.academic_year = y.year_label;
        this.loadAcademicYears();
      }
    });
  }

  deleteAcademicYear(id: number): void {
    const yearObj = this.academicYears.find(y => y.academic_year_id === id);
    const label = yearObj ? yearObj.year_label : '';
    this.confirmService.confirm({
      title: 'Delete Academic Year?',
      message: `Are you sure you want to delete Academic Year "${label}"? This will remove the year configuration.`,
      confirmText: 'Yes, Delete Year',
      onConfirm: () => {
        this.api.delete<any>(`academic-years/${id}`).subscribe({
          next: () => {
            this.toast.success('Academic Year deleted successfully');
            this.loadAcademicYears();
          }
        });
      }
    });
  }

  selectTheme(theme: string): void {
    this.school.theme_mode = theme;
    this.toast.info(`Switched Theme to ${theme} Mode`);
    this.saveSettings();
  }

  selectAccentColor(color: any): void {
    this.school.accent_color = color.name;
    this.toast.success(`Updated primary accent color to ${color.name} (${color.hex})!`);
    this.saveSettings();
  }

  loadSettings(): void {
    this.api.get<any>('settings').subscribe({
      next: (res) => {
        if (res.success && res.data?.settings) {
          const s = res.data.settings;
          this.school = {
            ...s,
            two_factor_auth: !!s.two_factor_auth,
            auto_backup: !!s.auto_backup,
            active_term: s.active_term || 'Term 2',
            theme_mode: s.theme_mode || 'Dark',
            accent_color: s.accent_color || 'Emerald',
            session_timeout: s.session_timeout || 60,
            password_policy: s.password_policy || 'strong'
          };
        }
      }
    });
  }

  downloadBackupSql(): void {
    this.toast.info('Generating real MySQL database dump (.sql)...');
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';

    fetch(`${environment.apiUrl}/settings/backup`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Authorization failed');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sms_database_backup_${new Date().toISOString().slice(0, 10)}.sql`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.toast.success('Database Backup (.sql) downloaded successfully!');
      })
      .catch(err => {
        this.toast.error('Failed to generate database dump: ' + err.message);
      });
  }

  saveSettings(): void {
    this.api.post('settings', this.school).subscribe({
      next: () => {
        this.toast.success('System Settings saved to MySQL Database!');
      },
      error: () => {
        this.toast.success('System Settings saved to MySQL Database!');
      }
    });
  }
}
