export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
  status?: string;
  fullName?: string;
  studentId?: number | null;
  teacherId?: number | null;
  groupId?: number | null;
  image?: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
