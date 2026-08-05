import { Routes } from '@angular/router';
import { authGuard, roleGuard, guestGuard } from './core/guards/auth.guard';
import { LoginComponent } from './pages/auth/login/login.component';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { TeacherLayoutComponent } from './layouts/teacher-layout/teacher-layout.component';
import { StudentLayoutComponent } from './layouts/student-layout/student-layout.component';

import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { TeacherDashboardComponent } from './pages/dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './pages/dashboard/student-dashboard.component';

import { StudentListComponent } from './pages/students/student-list.component';
import { StudentFormComponent } from './pages/students/student-form.component';
import { TeacherListComponent } from './pages/teachers/teacher-list.component';
import { AttendanceMarkComponent } from './pages/attendance/attendance-mark.component';
import { ExamManagementComponent } from './pages/exams/exam-management.component';
import { ScoreEntryComponent } from './pages/results/score-entry.component';
import { TimetableManagementComponent } from './pages/timetable/timetable-management.component';
import { FeeManagementComponent } from './pages/fees/fee-management.component';
import { PaymentManagementComponent } from './pages/payments/payment-management.component';
import { UserManagementComponent } from './pages/users/user-management.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ClassManagementComponent } from './pages/groups/class-management.component';
import { SubjectManagementComponent } from './pages/subjects/subject-management.component';
import { RoomManagementComponent } from './pages/rooms/room-management.component';
import { FacultyManagementComponent } from './pages/academic/faculty-management.component';
import { ProgramManagementComponent } from './pages/academic/program-management.component';
import { CurriculumManagementComponent } from './pages/academic/curriculum-management.component';
import { SystemSettingsComponent } from './pages/settings/system-settings.component';

import { TeacherClassesComponent } from './pages/teacher/teacher-classes.component';
import { TeacherTimetableComponent } from './pages/teacher/teacher-timetable.component';
import { TeacherAttendanceComponent } from './pages/teacher/teacher-attendance.component';
import { TeacherScoresComponent } from './pages/teacher/teacher-scores.component';
import { TeacherExamsComponent } from './pages/teacher/teacher-exams.component';
import { TeacherNotificationsComponent } from './pages/teacher/teacher-notifications.component';

import { StudentTimetableComponent } from './pages/student/student-timetable.component';
import { StudentGradesComponent } from './pages/student/student-grades.component';
import { StudentAttendanceComponent } from './pages/student/student-attendance.component';
import { StudentNotificationsComponent } from './pages/student/student-notifications.component';
import { StudentFeesComponent } from './pages/student/student-fees.component';
import { StudentProfileComponent } from './pages/student/student-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent, canActivate: [guestGuard] },

  // Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'faculties', component: FacultyManagementComponent },
      { path: 'programs', component: ProgramManagementComponent },
      { path: 'curriculums', component: CurriculumManagementComponent },
      { path: 'students', component: StudentListComponent },
      { path: 'students/new', component: StudentFormComponent },
      { path: 'students/edit/:id', component: StudentFormComponent },
      { path: 'teachers', component: TeacherListComponent },
      { path: 'groups', component: ClassManagementComponent },
      { path: 'subjects', component: SubjectManagementComponent },
      { path: 'rooms', component: RoomManagementComponent },
      { path: 'attendance', component: AttendanceMarkComponent },
      { path: 'exams', component: ExamManagementComponent },
      { path: 'timetable', component: TimetableManagementComponent },
      { path: 'results', component: ScoreEntryComponent },
      { path: 'fees', component: FeeManagementComponent },
      { path: 'payments', component: PaymentManagementComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'settings', component: SystemSettingsComponent }
    ]
  },

  // Teacher Routes
  {
    path: 'teacher',
    component: TeacherLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TEACHER', 'ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: TeacherDashboardComponent },
      { path: 'classes', component: TeacherClassesComponent },
      { path: 'attendance', component: TeacherAttendanceComponent },
      { path: 'exams', component: TeacherExamsComponent },
      { path: 'scores', component: TeacherScoresComponent },
      { path: 'timetable', component: TeacherTimetableComponent },
      { path: 'subjects', component: SubjectManagementComponent },
      { path: 'notifications', component: TeacherNotificationsComponent }
    ]
  },

  // Student Routes
  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['STUDENT', 'ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'attendance', component: StudentAttendanceComponent },
      { path: 'grades', component: StudentGradesComponent },
      { path: 'fees', component: StudentFeesComponent },
      { path: 'timetable', component: StudentTimetableComponent },
      { path: 'subjects', component: SubjectManagementComponent },
      { path: 'notifications', component: StudentNotificationsComponent },
      { path: 'profile', component: StudentProfileComponent }
    ]
  },

  { path: '**', redirectTo: '/auth/login' }
];
