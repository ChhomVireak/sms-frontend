import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-room-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [title]="'Classrooms & Vacancy Inspector'" 
                [subtitle]="'Admin / Rooms'"
                [actionLabel]="'Add New Room'"
                (actionClicked)="openCreateModal()"></app-navbar>

    <div class="p-8 space-y-8 overflow-y-auto">
      
      <!-- Room Vacancy & Capacity Metrics Header Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL FACILITY ROOMS</span>
          <h3 class="text-2xl font-extrabold text-white mt-2">{{ rooms.length }} Rooms</h3>
          <p class="text-xs text-blue-400 mt-1 font-semibold">Active Classrooms & Labs</p>
        </div>

        <div (click)="selectedStatusFilter = 'VACANT'; filterRooms()" class="bg-[#1e293b]/70 border border-[#1f2937] hover:border-emerald-500/50 cursor-pointer rounded-2xl p-5 transition-all">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">VACANT / AVAILABLE ROOMS</span>
          <h3 class="text-2xl font-extrabold text-emerald-400 mt-2">{{ getVacantCount() }} Rooms</h3>
          <p class="text-xs text-emerald-400 mt-1 font-semibold">✓ Free to use / Schedule</p>
        </div>

        <div (click)="selectedStatusFilter = 'OCCUPIED'; filterRooms()" class="bg-[#1e293b]/70 border border-[#1f2937] hover:border-rose-500/50 cursor-pointer rounded-2xl p-5 transition-all">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">OCCUPIED ROOMS</span>
          <h3 class="text-2xl font-extrabold text-rose-400 mt-2">{{ getOccupiedCount() }} Rooms</h3>
          <p class="text-xs text-rose-400 mt-1 font-semibold">Class currently in session</p>
        </div>

        <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-5">
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL SEATING CAPACITY</span>
          <h3 class="text-2xl font-extrabold text-amber-400 mt-2">{{ getTotalCapacity() }} Seats</h3>
          <p class="text-xs text-gray-400 mt-1">Combined Campus Capacity</p>
        </div>
      </div>

      <!-- Real-Time Vacancy Inspector & Building Filter Toolbar -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        
        <div class="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <!-- Day & Slot Selectors -->
          <div class="flex items-center gap-1.5 bg-[#111827] px-3 py-2 rounded-xl border border-[#1f2937] font-bold text-white">
            <i class="fa-solid fa-calendar-day text-emerald-400 text-xs"></i>
            <span>Day:</span>
            <select [(ngModel)]="selectedDay" (change)="loadRooms()" class="bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-emerald-500">
              <option value="ALL" class="bg-[#111827]">All Days</option>
              <option value="MONDAY" class="bg-[#111827]">Monday</option>
              <option value="TUESDAY" class="bg-[#111827]">Tuesday</option>
              <option value="WEDNESDAY" class="bg-[#111827]">Wednesday</option>
              <option value="THURSDAY" class="bg-[#111827]">Thursday</option>
              <option value="FRIDAY" class="bg-[#111827]">Friday</option>
              <option value="SATURDAY" class="bg-[#111827]">Saturday</option>
            </select>

            <select [(ngModel)]="selectedSlotId" (change)="loadRooms()" class="bg-[#111827] border border-[#1f2937] text-white rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-emerald-500 font-mono">
              <option [value]="0" class="bg-[#111827]">All Slots</option>
              <option [value]="1" class="bg-[#111827]">08:00 - 09:30 AM</option>
              <option [value]="2" class="bg-[#111827]">09:30 - 11:00 AM</option>
              <option [value]="3" class="bg-[#111827]">01:30 - 03:00 PM</option>
              <option [value]="4" class="bg-[#111827]">03:00 - 04:30 PM</option>
            </select>
          </div>

          <!-- Building / Floor Filter Dropdown -->
          <div class="flex items-center gap-1.5 bg-[#111827] px-3 py-2 rounded-xl border border-[#1f2937] font-bold text-white">
            <i class="fa-solid fa-building text-blue-400 text-xs"></i>
            <span>Building / Floor:</span>
            <select [(ngModel)]="selectedBuildingFilter" (change)="filterRooms()" class="bg-transparent text-blue-400 font-bold focus:outline-none cursor-pointer">
              <option value="" class="bg-[#111827] text-white">All Buildings & Floors</option>
              <option value="Main Block" class="bg-[#111827] text-blue-400">Main Block Academic Building</option>
              <option value="Science Wing" class="bg-[#111827] text-purple-400">Science & Tech Wing</option>
              <option value="Auditorium" class="bg-[#111827] text-amber-400">Auditorium Main Hall</option>
            </select>
          </div>
        </div>

      </div>

      <!-- Rooms List Table -->
      <div class="bg-[#1e293b]/70 border border-[#1f2937] rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-white tracking-tight">
            Facility Rooms Vacancy Status 
            <span class="text-xs font-normal text-emerald-400 ml-2 font-mono">• {{ selectedDay }} {{ getSlotTimeText() }}</span>
          </h3>
          <span class="text-xs text-gray-400 font-semibold">{{ filteredRooms.length }} of {{ rooms.length }} total rooms shown</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-[#1f2937] font-bold text-gray-400 uppercase tracking-wider">
                <th class="pb-3">ROOM NUMBER</th>
                <th class="pb-3">BUILDING / FLOOR</th>
                <th class="pb-3">SEATING CAPACITY</th>
                <th class="pb-3">VACANCY STATUS</th>
                <th class="pb-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1f2937]/50">
              <tr *ngFor="let r of filteredRooms" class="hover:bg-gray-800/40 transition-colors">
                <td class="py-3.5 font-mono text-blue-400 font-bold text-sm">{{ r.room_number }}</td>
                <td class="py-3.5 font-bold text-white">{{ r.building || 'Main Block' }}</td>
                <td class="py-3.5 font-mono text-emerald-400 font-bold">{{ r.capacity || 40 }} Seats</td>
                
                <!-- Vacancy Status Badge -->
                <td class="py-3.5">
                  <span *ngIf="!r.current_group" class="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[11px] inline-flex items-center gap-1.5 shadow-sm">
                    Available
                  </span>
                  <span *ngIf="r.current_group" class="px-3 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 font-bold text-[11px] inline-flex items-center gap-1.5 shadow-sm">
                    Occupied: {{ r.current_group }} — {{ r.current_subject || 'Class' }}
                  </span>
                </td>

                <td class="py-3.5 text-right space-x-2">
                  <button (click)="openEditModal(r)" title="Edit Room Details" class="text-gray-400 hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"><i class="fa-solid fa-pen"></i></button>
                  <button (click)="deleteRoom(r)" title="Delete Room" class="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>

              <tr *ngIf="filteredRooms.length === 0">
                <td colspan="5" class="py-8 text-center text-gray-500 italic">No facility rooms matching your filter criteria.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Room Modal -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-md rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white">Create New Classroom / Facility</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-base"></i></button>
        </div>

        <form (ngSubmit)="onCreateRoom()" class="space-y-3">
          <div>
            <label class="block font-bold text-gray-300 mb-1">ROOM NUMBER / TITLE *</label>
            <input type="text" [(ngModel)]="newRoom.room_number" name="room_number" required placeholder="e.g. Rm 20 or Lab 4" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">BUILDING / FLOOR *</label>
              <input type="text" [(ngModel)]="newRoom.building" name="building" required placeholder="Main Block Floor 2" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">SEATING CAPACITY *</label>
              <input type="number" [(ngModel)]="newRoom.capacity" name="capacity" required placeholder="40" class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-blue-500">
            </div>
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="showModal = false" class="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20">Save Room</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Room Modal -->
    <div *ngIf="editModalRoom" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div class="bg-[#1e293b] border border-[#1f2937] w-full max-w-md rounded-2xl p-6 space-y-4 text-xs text-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <h3 class="text-base font-bold text-white">Edit Room Details</h3>
          <button (click)="editModalRoom = null" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-base"></i></button>
        </div>

        <form (ngSubmit)="saveEditedRoom()" class="space-y-3">
          <div>
            <label class="block font-bold text-gray-300 mb-1">ROOM NUMBER / TITLE *</label>
            <input type="text" [(ngModel)]="editModalRoom.room_number" name="edit_room_number" required class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-blue-500">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-300 mb-1">BUILDING / FLOOR *</label>
              <input type="text" [(ngModel)]="editModalRoom.building" name="edit_building" required class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="block font-bold text-gray-300 mb-1">SEATING CAPACITY *</label>
              <input type="number" [(ngModel)]="editModalRoom.capacity" name="edit_capacity" required class="w-full bg-[#111827] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-blue-500">
            </div>
          </div>

          <div class="pt-3 flex justify-end gap-2 border-t border-[#1f2937]">
            <button type="button" (click)="editModalRoom = null" class="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20">Update Room</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RoomManagementComponent implements OnInit {
  rooms: any[] = [];
  filteredRooms: any[] = [];

  showModal = false;
  editModalRoom: any = null;

  selectedDay = 'MONDAY';
  selectedSlotId = 1;
  selectedBuildingFilter = '';
  selectedStatusFilter = '';

  newRoom: any = {
    room_number: '',
    building: 'Main Block',
    capacity: 40
  };

  constructor(private api: ApiService, public toast: ToastService, private confirmService: ConfirmModalService) { }

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.api.get<any>('rooms', { day_of_week: this.selectedDay, slot_id: this.selectedSlotId }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rooms = res.data.rooms || res.data || [];
          this.filterRooms();
        }
      }
    });
  }

  filterRooms(): void {
    this.filteredRooms = this.rooms.filter(r => {
      const matchesBuilding = !this.selectedBuildingFilter || (r.building || '').toLowerCase().includes(this.selectedBuildingFilter.toLowerCase());

      let matchesStatus = true;
      if (this.selectedStatusFilter === 'VACANT') {
        matchesStatus = !r.current_group;
      } else if (this.selectedStatusFilter === 'OCCUPIED') {
        matchesStatus = !!r.current_group;
      }

      return matchesBuilding && matchesStatus;
    });
  }

  getVacantCount(): number {
    return this.rooms.filter(r => !r.current_group).length;
  }

  getOccupiedCount(): number {
    return this.rooms.filter(r => !!r.current_group).length;
  }

  getTotalCapacity(): number {
    return this.rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  }

  getSlotTimeText(): string {
    if (this.selectedSlotId == 1) return '08:00-09:30 AM';
    if (this.selectedSlotId == 2) return '09:30-11:00 AM';
    if (this.selectedSlotId == 3) return '01:30-03:00 PM';
    return '03:00-04:30 PM';
  }

  openCreateModal(): void {
    this.newRoom = { room_number: '', building: 'Main Block', capacity: 40 };
    this.showModal = true;
  }

  openEditModal(room: any): void {
    this.editModalRoom = { ...room };
  }

  onCreateRoom(): void {
    if (!this.newRoom.room_number) {
      this.toast.error('Room number is required');
      return;
    }

    this.api.post('rooms', this.newRoom).subscribe({
      next: () => {
        this.toast.success('Room created successfully in MySQL!');
        this.showModal = false;
        this.loadRooms();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to create room');
      }
    });
  }

  saveEditedRoom(): void {
    if (!this.editModalRoom || !this.editModalRoom.room_number) return;

    this.api.put(`rooms/${this.editModalRoom.room_id}`, this.editModalRoom).subscribe({
      next: () => {
        this.toast.success('Room updated successfully in MySQL!');
        this.editModalRoom = null;
        this.loadRooms();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to update room');
      }
    });
  }

  deleteRoom(room: any): void {
    this.confirmService.confirm({
      title: 'Delete Room Record?',
      message: `Are you sure you want to delete room "${room.room_number}" (${room.building || 'Main Block'})?`,
      confirmText: 'Yes, Delete Room',
      onConfirm: () => {
        this.api.delete(`rooms/${room.room_id}`).subscribe({
          next: () => {
            this.toast.success(`Room '${room.room_number}' deleted successfully!`);
            this.loadRooms();
          },
          error: (err) => {
            this.toast.error(err.error?.message || 'Failed to delete room');
          }
        });
      }
    });
  }
}
