import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent, NavSection } from '../../shared/components/sidebar.component';
import { ToastComponent } from '../../shared/components/toast.component';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, ToastComponent],
  template: `
    <div class="flex flex-col md:flex-row min-h-screen bg-[#0b0f19]">
      <app-sidebar [portalTitle]="'STUDENT PORTAL'" [navSections]="studentNav"></app-sidebar>
      <main class="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <router-outlet></router-outlet>
      </main>
      <app-toast></app-toast>
    </div>
  `
})
export class StudentLayoutComponent {
  studentNav: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', icon: 'fa-solid fa-table-cells-large', route: '/student/dashboard' },
        { label: 'Attendance', icon: 'fa-solid fa-clipboard-user', route: '/student/attendance' },
        { label: 'Grades', icon: 'fa-solid fa-graduation-cap', route: '/student/grades' },
        { label: 'Fees', icon: 'fa-solid fa-credit-card', route: '/student/fees' },
        { label: 'Timetable', icon: 'fa-solid fa-calendar-days', route: '/student/timetable' },
        { label: 'Subjects', icon: 'fa-solid fa-book-bookmark', route: '/student/subjects' },
        { label: 'Notifications', icon: 'fa-solid fa-bell', route: '/student/notifications' },
        { label: 'Profile', icon: 'fa-solid fa-user', route: '/student/profile' }
      ]
    }
  ];
}
