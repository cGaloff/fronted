export enum EventStatus {
  Draft = 0,
  Published = 1,
  Cancelled = 2,
  Finished = 3,
}

export enum UserRole {
  User = "User",
  Admin = "Admin",
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  id: string;
  token: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  hasParking: boolean;
  status: EventStatus;
  organizerId: string;
  organizerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  eventId: string;
  eventName: string;
  userId: string;
  userName: string;
  registeredAt: string;
  checkInToken: string;
}

export interface RegistrationDetail {
  eventId: string;
  eventName: string;
  startDate: string;
  location: string;
  status: EventStatus;
  registeredAt: string;
  checkInToken: string;
}

export interface CheckInValidation {
  success: boolean;
  message: string;
  userFullName: string;
  eventName: string;
  checkedInAt: string;
}

export interface AttendanceReport {
  eventId: string;
  eventName: string;
  totalRegistered: number;
  totalCheckedIn: number;
  attendancePercentage: number;
  attendees: AttendanceRecord[];
}

export interface AttendanceRecord {
  fullName: string;
  email: string;
  checkedIn: boolean;
  checkedInAt: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
