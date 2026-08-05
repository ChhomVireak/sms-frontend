import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent, NavSection } from '../../shared/components/sidebar.component';
import { ToastComponent } from '../../shared/components/toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, ToastComponent],
  template: `
    <div class="flex flex-col md:flex-row min-h-screen bg-[#0b0f19]">
      <app-sidebar [portalTitle]="'ADMIN PORTAL'" [navSections]="adminNav"></app-sidebar>
      <main class="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <router-outlet></router-outlet>
      </main>
      <app-toast></app-toast>
    </div>
  `
})
export class AdminLayoutComponent implements OnInit {
  adminNav: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard', icon: 'fa-solid fa-table-cells-large', route: '/admin/dashboard' },
        { label: 'Students', icon: 'fa-solid fa-user-graduate', route: '/admin/students' },
        { label: 'Teachers', icon: 'fa-solid fa-chalkboard-user', route: '/admin/teachers' },
        { label: 'Classes', icon: 'fa-solid fa-users', route: '/admin/groups' },
        { label: 'Subjects', icon: 'fa-solid fa-book-bookmark', route: '/admin/subjects' },
        { label: 'Rooms', icon: 'fa-solid fa-door-open', route: '/admin/rooms' }
      ]
    },
    {
      title: 'ACADEMIC & CURRICULUM',
      items: [

        { label: 'Attendance', icon: 'fa-solid fa-clipboard-user', route: '/admin/attendance' },
        { label: 'Timetable', icon: 'fa-solid fa-calendar-days', route: '/admin/timetable' },
        { label: 'Exams', icon: 'fa-solid fa-file-signature', route: '/admin/exams' },
        { label: 'Scores', icon: 'fa-solid fa-chart-simple', route: '/admin/results' },
        { label: 'Curriculums', icon: 'fa-solid fa-sitemap', route: '/admin/curriculums' },
        { label: 'Programs (Majors)', icon: 'fa-solid fa-graduation-cap', route: '/admin/programs' },
        { label: 'Faculties', icon: 'fa-solid fa-landmark', route: '/admin/faculties' },
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { label: 'Fees', icon: 'fa-solid fa-receipt', route: '/admin/fees' },
        { label: 'Payments', icon: 'fa-solid fa-dollar-sign', route: '/admin/payments' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'User Management', icon: 'fa-solid fa-users-gear', route: '/admin/users' },
        { label: 'Notifications', icon: 'fa-solid fa-bell', route: '/admin/notifications' },
        { label: 'Settings', icon: 'fa-solid fa-sliders', route: '/admin/settings' }
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void { }
}
