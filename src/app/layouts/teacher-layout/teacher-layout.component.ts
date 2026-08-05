import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent, NavSection } from '../../shared/components/sidebar.component';
import { ToastComponent } from '../../shared/components/toast.component';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, ToastComponent],
  template: `
    <div class="flex flex-col md:flex-row min-h-screen bg-[#0b0f19]">
      <app-sidebar [portalTitle]="'TEACHER PORTAL'" [navSections]="teacherNav"></app-sidebar>
      <main class="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <router-outlet></router-outlet>
      </main>
      <app-toast></app-toast>
    </div>
  `
})
export class TeacherLayoutComponent {
  teacherNav: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard', icon: 'fa-solid fa-table-cells-large', route: '/teacher/dashboard' },
        { label: 'My Classes', icon: 'fa-solid fa-user-group', route: '/teacher/classes' },
        { label: 'My Schedule', icon: 'fa-solid fa-calendar-days', route: '/teacher/timetable' }
      ]
    },
    {
      title: 'TEACHING',
      items: [
        { label: 'Take Attendance', icon: 'fa-solid fa-square-check', route: '/teacher/attendance' },
        { label: 'Exam', icon: 'fa-solid fa-chart-line', route: '/teacher/exams' },
        { label: 'Scores', icon: 'fa-solid fa-clipboard-list', route: '/teacher/scores' }
      ]
    },
    {
      title: 'TOOLS',
      items: [
        { label: 'Notifications', icon: 'fa-solid fa-bell', route: '/teacher/notifications' }
      ]
    }
  ];
}
