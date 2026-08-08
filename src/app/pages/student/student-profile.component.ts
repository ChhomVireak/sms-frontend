import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'My Student Profile'" 
                [subtitle]="'Student / Digital Profile & Student ID'"></app-navbar>

    <div class="p-6 md:p-8 space-y-6 overflow-y-auto min-h-screen bg-[#0b0f19]">
      <!-- Header Banner & Main Profile Card -->
      <div class="bg-[#1e293b]/80 border border-[#1f2937] rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <!-- Background Gradient Accent -->
        <div class="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- Student Avatar Photo -->
          <div class="relative shrink-0">
            <div class="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-1 shadow-xl">
              <div class="w-full h-full rounded-xl bg-[#111827] overflow-hidden flex items-center justify-center">
                <img *ngIf="profile.image && !imageFailed" 
                     [src]="getPhotoUrl(profile.image)" 
                     (error)="imageFailed = true" 
                     class="w-full h-full object-cover">
                <div *ngIf="!profile.image || imageFailed" class="text-3xl font-extrabold text-emerald-400 font-mono">
                  {{ (profile.first_name || 'S')[0] }}{{ (profile.last_name || '')[0] }}
                </div>
              </div>
            </div>
            <span class="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#111827] shadow" title="Active Account"></span>
          </div>

          <!-- Student Core Info -->
          <div class="flex-1 text-center md:text-left space-y-2">
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span class="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[11px] font-mono tracking-wider">
                • ACTIVE ENROLLED
              </span>
              <span class="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-[11px] font-mono">
                MAJOR: {{ profile.program_code || profile.program_name || 'BSCS' }}
              </span>
              <span class="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] font-mono">
                GROUP: {{ profile.group_code || 'SV34' }}
              </span>
            </div>

            <h2 class="text-2xl md:text-3xl font-black text-white tracking-tight">
              {{ profile.first_name || 'Student' }} {{ profile.last_name || '' }}
            </h2>

            <div class="flex items-center justify-center md:justify-start gap-3 text-xs text-gray-400 font-mono">
              <span class="text-cyan-400 font-bold">STUDENT ID: {{ profile.custom_student_id || ('STU-' + profile.student_id) }}</span>
              <span>•</span>
              <span>{{ profile.email || 'student@school.edu' }}</span>
            </div>

            <p class="text-xs text-gray-400 pt-1">
              Enrolled in {{ profile.program_name || 'Bachelor of Science in Computer Science' }} ({{ profile.generation || 'Gen 9' }})
            </p>
          </div>
        </div>
      </div>

      <!-- Main Grid: Info Cards (Left) & Student ID Card (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Detailed Information Sections -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Personal Details Card -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 class="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1f2937] pb-3">
              <i class="fa-solid fa-user text-emerald-400"></i> Personal Information
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div class="bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">First Name</span>
                <span class="font-extrabold text-white text-sm block">{{ profile.first_name || 'N/A' }}</span>
              </div>

              <div class="bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Last Name</span>
                <span class="font-extrabold text-white text-sm block">{{ profile.last_name || 'N/A' }}</span>
              </div>

              <div class="bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Gender</span>
                <span class="font-extrabold text-cyan-400 block uppercase font-mono">{{ profile.gender || 'MALE' }}</span>
              </div>

              <div class="bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Date of Birth</span>
                <span class="font-extrabold text-white font-mono block">{{ profile.dob ? (profile.dob | date:'dd/MM/yyyy') : '01/01/2005' }}</span>
              </div>

              <div class="bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Phone Number</span>
                <span class="font-extrabold text-emerald-400 font-mono block">{{ profile.phone_number || profile.phone || profile.phone_no || '+855 12 345 678' }}</span>
              </div>

              <div class="bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</span>
                <span class="font-extrabold text-white block">{{ profile.email || 'student@school.edu' }}</span>
              </div>
            </div>
          </div>

          <!-- Academic Enrollment Details Card -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 class="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1f2937] pb-3">
              <i class="fa-solid fa-graduation-cap text-purple-400"></i> Academic & Program Details
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div class="bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Major / Degree Program</span>
                <span class="font-extrabold text-purple-300 block">{{ profile.program_name || 'Computer Science' }} ({{ profile.program_code || 'BSCS' }})</span>
              </div>

              <div class="bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Enrolled Class Group</span>
                <span class="font-extrabold text-amber-300 font-mono block">{{ profile.group_code || 'SV34' }} — {{ profile.group_name || 'Group A' }}</span>
              </div>

              <div class="bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Generation & Level</span>
                <span class="font-extrabold text-white font-mono block">{{ profile.generation || 'Gen 9' }} • Year 1 (Semester 1)</span>
              </div>

              <div class="bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Degree Qualification</span>
                <span class="font-extrabold text-white block">{{ profile.degree || 'Bachelor Degree' }}</span>
              </div>
            </div>
          </div>

          <!-- Parent / Guardian Information Card -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-3xl p-6 space-y-4 shadow-lg">
            <h3 class="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1f2937] pb-3">
              <i class="fa-solid fa-users text-cyan-400"></i> Parent & Emergency Contact
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div class="bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Parent / Guardian Name</span>
                <span class="font-extrabold text-white block">{{ profile.parent_name || 'Mrs. M. Kofi' }}</span>
              </div>

              <div class="bg-[#111827]/80 p-3.5 rounded-2xl border border-[#1f2937] space-y-1">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Contact Phone Number</span>
                <span class="font-extrabold text-emerald-400 font-mono block">{{ profile.parent_phone || '+855 12 999 888' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Official Digital Student ID Card (1:1 Admin Matching Design) -->
        <div class="space-y-6">
          <div class="bg-[#1e293b]/80 border border-[#1f2937] rounded-3xl p-6 space-y-5 shadow-2xl">
            <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <h3 class="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-id-card text-emerald-400"></i> Student Identity Card
              </h3>
              <span class="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800 font-mono">
                OFFICIAL
              </span>
            </div>

            <!-- Photorealistic Student ID Card Container (1:1 Matching Admin ID Card) -->
            <div class="w-full max-w-[320px] mx-auto bg-[#1e293b] rounded-2xl p-3 border border-[#1f2937] shadow-2xl">
              <!-- ID Card Inner Canvas -->
              <div class="bg-white rounded-xl overflow-hidden shadow-inner border border-gray-200 text-slate-900">
                
                <!-- Green Top Header Banner -->
                <div class="bg-[#16a34a] text-white text-center py-2 px-1 font-bold text-xs tracking-wide shadow-sm">
                  <span>Student Identification Card</span>
                </div>

                <div class="p-3 text-center space-y-1.5">
                  <!-- ID Code Badge -->
                  <div class="text-[11px] font-mono font-bold text-[#16a34a] bg-emerald-50 py-0.5 px-3 rounded-full inline-block border border-emerald-200 shadow-sm">
                    ID: {{ profile.custom_student_id || ('STU-' + profile.student_id) }}
                  </div>

                  <!-- Student Photo Container (Blue Portrait Background matching Reference Photo) -->
                  <div class="flex justify-center my-1.5">
                    <div class="w-28 h-36 bg-[#0284c7] rounded-lg p-0.5 shadow-md border-2 border-white overflow-hidden">
                      <img *ngIf="profile.image && !imageFailed" 
                           [src]="getPhotoUrl(profile.image)" 
                           (error)="imageFailed = true" 
                           class="w-full h-full object-cover rounded">
                      <div *ngIf="!profile.image || imageFailed" class="w-full h-full bg-[#0284c7] text-white font-bold flex items-center justify-center text-3xl">
                        {{ (profile.first_name || 'S')[0] }}{{ (profile.last_name || '')[0] }}
                      </div>
                    </div>
                  </div>

                  <!-- Student Name -->
                  <div class="pt-0.5">
                    <h4 class="text-lg font-extrabold text-slate-900 leading-snug">
                      {{ (profile.first_name || profile.last_name) ? (profile.first_name + ' ' + (profile.last_name || '')) : (profile.fullName || profile.username || 'Student Name') }}
                    </h4>
                  </div>

                  <!-- Student Information List -->
                  <div class="text-[11px] space-y-1 text-slate-700 font-semibold pt-1 text-center leading-relaxed">
                    <div class="flex items-center justify-between text-slate-800 font-bold border-b border-amber-500/30 pb-0.5">
                      <span class="text-slate-500">Date of Birth:</span>
                      <span class="font-bold text-slate-900 ml-1 font-mono">{{ profile.dob ? (profile.dob | date:'dd/MM/yyyy') : '01/01/2005' }}</span>
                    </div>
                    <div class="flex items-center justify-between text-slate-800 font-bold border-b border-amber-500/30 pb-0.5">
                      <span class="text-slate-500">Major:</span>
                      <span class="font-bold text-slate-900 ml-1 font-mono uppercase">{{ profile.program_code || profile.program_name || 'BSCS' }}</span>
                    </div>
                    <div class="flex items-center justify-between text-slate-800 font-bold border-b border-amber-500/30 pb-0.5">
                      <span class="text-slate-500">Generation & Group:</span>
                      <span class="font-bold text-slate-900 ml-1 font-mono">{{ profile.generation || 'Gen 9' }} | Group: {{ profile.group_code || 'ASI4' }}</span>
                    </div>
                    <div class="flex items-center justify-between text-slate-800 font-bold">
                      <span class="text-slate-500">Academic Year:</span>
                      <span class="font-bold text-slate-900 ml-1 font-mono">2025-2026</span>
                    </div>
                  </div>
                </div>
                
                <!-- Bottom Green Accent Strip -->
                <div class="h-2 bg-[#16a34a]"></div>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentProfileComponent implements OnInit {
  profile: any = {};
  imageFailed: boolean = false;

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.api.get<any>('students/me').subscribe({
      next: (res) => {
        if (res.success && res.data?.student) {
          this.profile = res.data.student;
        } else {
          this.fetchFallbackProfile();
        }
      },
      error: () => {
        this.fetchFallbackProfile();
      }
    });
  }

  fetchFallbackProfile(): void {
    this.api.get<any>('dashboard/student').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const sData = res.data.student || res.data.studentProfile || res.data;
          this.profile = sData;
        }
      },
      error: () => {
        this.api.get<any>('auth/me').subscribe({
          next: (meRes) => {
            if (meRes.success && meRes.data?.user) {
              this.profile = meRes.data.user;
            }
          }
        });
      }
    });
  }

  getPhotoUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;
    let cleanPath = path.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = 'uploads/' + cleanPath;
    }
    const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}/${cleanPath}`;
  }

  printProfileCard(): void {
    window.print();
  }
}
