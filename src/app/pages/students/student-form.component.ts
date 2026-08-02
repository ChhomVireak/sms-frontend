import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { AcademicService, Program } from '../../core/services/academic.service';
import { ToastService } from '../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="isEdit ? 'Edit Student' : 'Add New Student'" 
                [subtitle]="'Admin / Students / ' + (isEdit ? 'Edit Record' : 'Add New Student')"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Form Area (2 Cols) -->
        <div class="lg:col-span-2 bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
          <div class="flex items-center justify-between border-b border-[#1f2937] pb-4 mb-6">
            <h3 class="text-base font-bold text-white tracking-tight">Student Information</h3>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Personal Information Section -->
            <div class="space-y-4">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">1. PERSONAL INFORMATION</h4>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-300 mb-1.5">FIRST NAME *</label>
                  <input type="text" [(ngModel)]="form.first_name" name="first_name" required placeholder="e.g. Brian" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-300 mb-1.5">LAST NAME *</label>
                  <input type="text" [(ngModel)]="form.last_name" name="last_name" required placeholder="e.g. Mensah" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-300 mb-1.5">GENDER *</label>
                  <select [(ngModel)]="form.gender" name="gender" required class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-bold">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-300 mb-1.5">DATE OF BIRTH *</label>
                  <input type="date" [(ngModel)]="form.dob" name="dob" required class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-300 mb-1.5">STUDENT PHONE NUMBER</label>
                <input type="text" [(ngModel)]="form.phone" name="phone" placeholder="+855 12 345 678" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono">
              </div>
            </div>

            <!-- Academic Information Section -->
            <div class="space-y-4 pt-4 border-t border-[#1f2937]">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">2. ACADEMIC & MAJOR INFORMATION</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-emerald-400 mb-1.5">SELECT MAJOR / PROGRAM *</label>
                  <select [(ngModel)]="form.program_id" (change)="onProgramChange()" name="program_id" required class="w-full bg-[#111827] border border-emerald-500/60 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer">
                    <option *ngFor="let p of programs" [ngValue]="p.program_id">
                      {{ p.program_code }} — {{ p.program_name }} ({{ p.degree }})
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-emerald-400 mb-1.5">SELECT CLASS GROUP *</label>
                  <select [(ngModel)]="form.group_id" (change)="onGroupSelectChange()" name="group_id" required class="w-full bg-[#111827] border border-emerald-500/60 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer">
                    <option *ngFor="let g of filteredGroups" [ngValue]="g.group_id">
                      {{ g.group_code }} — {{ g.group_name }}
                    </option>
                    <option *ngIf="filteredGroups.length === 0" [ngValue]="null" disabled>
                      -- No class groups available for this program --
                    </option>
                  </select>

                  <p *ngIf="isGroupFull" class="text-[11px] text-rose-400 font-bold flex items-center gap-1.5 mt-1.5 bg-rose-950/80 border border-rose-800 p-2 rounded-xl">
                    <i class="fa-solid fa-circle-exclamation text-rose-400"></i>
                    <span>This class group is full! Cannot enroll additional students.</span>
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-300 mb-1.5">ENROLLMENT DATE *</label>
                  <input type="date" [(ngModel)]="form.enrollment_date" name="enrollment_date" required class="w-full bg-[#111827] border border-emerald-500/50 text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono font-bold">
                  <p *ngIf="selectedGroupStartDate" class="text-[11px] text-emerald-400 font-medium mt-1">
                    Auto-set start date: {{ selectedGroupStartDate | date:'dd/MM/yyyy' }}
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-300 mb-1.5">PREVIOUS SCHOOL</label>
                  <input type="text" [(ngModel)]="form.previous_school" name="previous_school" placeholder="International Primary Academy" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-300 mb-1.5">ENROLLMENT STATUS</label>
                <select [(ngModel)]="form.status" name="status" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-bold">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="GRADUATED">GRADUATED</option>
                </select>
              </div>
            </div>

            <!-- Parent & Guardian Information -->
            <div class="space-y-4 pt-4 border-t border-[#1f2937]">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">3. PARENT / GUARDIAN CONTACT</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-300 mb-1.5">PARENT / GUARDIAN NAME</label>
                  <input type="text" [(ngModel)]="form.parent_name" name="parent_name" placeholder="Mrs. M. Kofi" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-300 mb-1.5">PARENT PHONE NUMBER</label>
                  <input type="text" [(ngModel)]="form.parent_phone" name="parent_phone" placeholder="+855 12 999 888" class="w-full bg-[#111827] border border-[#1f2937] text-xs text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono">
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-6 border-t border-[#1f2937]">
              <button type="button" (click)="router.navigate(['/admin/students'])" class="px-5 py-3 rounded-xl border border-[#1f2937] text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-800 transition-all">
                Cancel
              </button>
              <button type="submit" class="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all">
                {{ isEdit ? 'Update Student Record' : 'Save & Enroll Student' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Sidebar: Photo Upload + Required Checklist + Tips (1 Col) -->
        <div class="space-y-6">
          <!-- Photo Upload Card -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Student Profile Photo</h4>
            
            <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden">
            
            <div (click)="fileInput.click()" class="border-2 border-dashed border-[#1f2937] hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer transition-all bg-[#111827]/50 relative overflow-hidden group">
              <!-- Image Preview -->
              <div *ngIf="imagePreview" class="mb-3">
                <img [src]="imagePreview" alt="Student Photo" class="w-24 h-24 rounded-full object-cover mx-auto border-2 border-emerald-500 shadow-lg">
                <p class="text-[10px] text-emerald-400 font-bold mt-2">Click to change photo</p>
              </div>

              <!-- Upload Placeholder -->
              <div *ngIf="!imagePreview">
                <div class="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <i class="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <p class="text-xs font-bold text-white">Upload Student Photo</p>
                <p class="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP · 2MB max</p>
                <p class="text-[11px] text-gray-500 mt-2">Click to browse file</p>
              </div>
            </div>
          </div>

          <!-- Required Fields Card -->
          <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">MySQL Required Fields</h4>
            <div class="space-y-2.5 text-xs text-gray-300">
              <div class="flex items-center gap-2 text-emerald-400 font-semibold"><i class="fa-solid fa-circle-check"></i> First Name & Last Name</div>
              <div class="flex items-center gap-2 text-emerald-400 font-semibold"><i class="fa-solid fa-circle-check"></i> Gender (MALE/FEMALE)</div>
              <div class="flex items-center gap-2 text-emerald-400 font-semibold"><i class="fa-solid fa-circle-check"></i> Date of Birth (DOB)</div>
              <div class="flex items-center gap-2 text-emerald-400 font-semibold"><i class="fa-solid fa-circle-check"></i> Program / Major</div>
              <div class="flex items-center gap-2 text-emerald-400 font-semibold"><i class="fa-solid fa-circle-check"></i> Class / Group</div>
              <div class="flex items-center gap-2 text-emerald-400 font-semibold"><i class="fa-solid fa-circle-check"></i> Enrollment Date</div>
            </div>
            <div class="mt-4 p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-bold">
              <i class="fa-solid fa-check text-sm"></i> Ready to Save
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentFormComponent implements OnInit {
  isEdit = false;
  studentId: number | null = null;
  originalGroupId: number | null = null;
  groups: any[] = [];
  programs: Program[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  form: any = {
    first_name: '',
    last_name: '',
    gender: 'MALE',
    dob: new Date().toISOString().slice(0, 10),
    phone: '',
    program_id: 1,
    group_id: 1,
    parent_name: '',
    parent_phone: '',
    previous_school: '',
    enrollment_date: new Date().toISOString().slice(0, 10),
    status: 'ACTIVE'
  };

  constructor(
    private api: ApiService,
    private academicService: AcademicService,
    private http: HttpClient,
    private toast: ToastService,
    public router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadDropdowns();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.studentId = +params['id'];
        this.loadStudent(this.studentId);
      }
    });
  }

  loadDropdowns(): void {
    this.api.get<any>('groups').subscribe(res => {
      this.groups = res.data?.groups || res.data || [];
      this.academicService.getPrograms().subscribe(progRes => {
        this.programs = progRes.data?.programs || [];
        if (this.programs.length > 0) {
          if (!this.form.program_id || !this.programs.some(p => p.program_id == this.form.program_id)) {
            this.form.program_id = this.programs[0].program_id;
          }
        }
        if (!this.isEdit) {
          const matching = this.filteredGroups;
          if (matching.length > 0) {
            this.form.group_id = matching[0].group_id;
            this.onGroupSelectChange();
          } else {
            this.form.group_id = null;
          }
        }
      });
    });
  }

  loadStudent(id: number): void {
    this.api.get<any>(`students/${id}`).subscribe({
      next: (res) => {
        if (res.success && res.data.student) {
          const s = res.data.student;

          let assignedGroupId = s.group_id ? Number(s.group_id) : null;
          let assignedProgramId = s.program_id ? Number(s.program_id) : null;

          if (!assignedProgramId && assignedGroupId && this.groups.length > 0) {
            const foundG = this.groups.find(g => g.group_id == assignedGroupId);
            if (foundG && foundG.program_id) {
              assignedProgramId = Number(foundG.program_id);
            }
          }
          if (!assignedProgramId && this.programs.length > 0) assignedProgramId = this.programs[0].program_id;

          this.originalGroupId = assignedGroupId;
          this.form = {
            first_name: s.first_name || '',
            last_name: s.last_name || '',
            gender: s.gender || 'MALE',
            dob: s.dob ? s.dob.slice(0, 10) : '',
            phone: s.phone || '',
            program_id: assignedProgramId,
            group_id: assignedGroupId,
            parent_name: s.parent_name || '',
            parent_phone: s.parent_phone || '',
            previous_school: s.previous_school || '',
            enrollment_date: s.enrollment_date ? s.enrollment_date.slice(0, 10) : '',
            status: s.status || 'ACTIVE'
          };

          if (s.image) {
            const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
            this.imagePreview = s.image.startsWith('http') ? s.image : `${baseUrl}${s.image.startsWith('/') ? '' : '/'}${s.image}`;
          }
        }
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.toast.error('Image size must be less than 2MB!');
        return;
      }
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  get filteredGroups(): any[] {
    if (!this.groups || this.groups.length === 0) return [];
    if (!this.form.program_id) return [];

    // Strictly filter class groups belonging to selected program_id
    const filtered = this.groups.filter(g => g.program_id == this.form.program_id);

    // Ensure the currently assigned group is always present in the dropdown list when editing
    if (this.isEdit && this.form.group_id && !filtered.some(g => g.group_id == this.form.group_id)) {
      const assignedGroup = this.groups.find(g => g.group_id == this.form.group_id);
      if (assignedGroup) {
        return [assignedGroup, ...filtered];
      }
    }

    return filtered;
  }

  onProgramChange(): void {
    const matching = this.filteredGroups;
    if (matching.length > 0) {
      this.form.group_id = matching[0].group_id;
      this.onGroupSelectChange();
    } else {
      this.form.group_id = null;
    }
  }

  get isGroupFull(): boolean {
    if (!this.form.group_id) return false;
    if (this.isEdit && this.originalGroupId == this.form.group_id) {
      return false;
    }
    const g = this.groups.find(item => item.group_id == this.form.group_id);
    if (!g) return false;
    return (g.student_count || 0) >= (g.max_capacity || 40);
  }

  get selectedGroupStartDate(): string {
    if (!this.form.group_id) return '';
    const g = this.groups.find(item => item.group_id == this.form.group_id);
    if (!g || !g.semester_start_date) return '';
    return g.semester_start_date.slice(0, 10);
  }

  onGroupSelectChange(): void {
    if (this.selectedGroupStartDate) {
      this.form.enrollment_date = this.selectedGroupStartDate;
    }
  }

  onSubmit(): void {
    if (this.isGroupFull) {
      this.toast.error('This class group is full! Cannot enroll additional students.');
      return;
    }
    const formData = new FormData();
    formData.append('first_name', this.form.first_name);
    formData.append('last_name', this.form.last_name);
    formData.append('gender', this.form.gender);
    formData.append('dob', this.form.dob);
    formData.append('program_id', this.form.program_id);
    formData.append('group_id', this.form.group_id);
    formData.append('enrollment_date', this.form.enrollment_date);
    formData.append('status', this.form.status);

    if (this.form.phone) formData.append('phone', this.form.phone);
    if (this.form.parent_name) formData.append('parent_name', this.form.parent_name);
    if (this.form.parent_phone) formData.append('parent_phone', this.form.parent_phone);
    if (this.form.previous_school) formData.append('previous_school', this.form.previous_school);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const token = localStorage.getItem('accessToken');
    const headers = { 'Authorization': `Bearer ${token}` };

    if (this.isEdit && this.studentId) {
      this.http.put(`${environment.apiUrl}/students/${this.studentId}`, formData, { headers }).subscribe({
        next: () => {
          this.toast.success('Student record updated successfully in MySQL!');
          this.router.navigate(['/admin/students']);
        },
        error: (err: any) => this.toast.error(err.error?.message || 'Update failed')
      });
    } else {
      this.http.post(`${environment.apiUrl}/students`, formData, { headers }).subscribe({
        next: () => {
          this.toast.success('Student record & user account created in MySQL!');
          this.router.navigate(['/admin/students']);
        },
        error: (err: any) => this.toast.error(err.error?.message || 'Enrollment failed')
      });
    }
  }
}
