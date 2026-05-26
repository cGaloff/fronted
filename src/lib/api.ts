import { Event, Registration, CheckInValidation, AttendanceReport, AuthResponse } from "../types";

const BASE_URL = "https://gestion-eventos-backend-g5-dae9gcbgggerhgb8.brazilsouth-01.azurewebsites.net/api";

interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  title?: string;
  status?: number;
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  if (options.headers) {
    const optionsHeaders = options.headers as Record<string, string>;
    Object.entries(optionsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  const token = localStorage.getItem("authToken");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiResponse<T> = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export function getUserId(): string | null {
  return localStorage.getItem("userId");
}

export const authAPI = {
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) =>
    apiCall<{ id: string; firstName: string; lastName: string; email: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const eventsAPI = {
  list: () => apiCall<Event[]>("/events"),

  getById: (id: string) => apiCall<Event>(`/events/${id}`),

  create: (data: {
    name: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    maxCapacity: number;
    hasParking: boolean;
    organizerId: string;
  }) =>
    apiCall("/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Event>) =>
    apiCall(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify({ id, ...data }),
    }),

  updateStatus: (id: string, status: number) =>
    apiCall(`/events/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    }),

  delete: (id: string) =>
    apiCall(`/events/${id}`, {
      method: "DELETE",
    }),
};

export const registrationsAPI = {
  create: (data: { eventId: string; userId: string }) =>
    apiCall<Registration>("/registrations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getUserRegistrations: (userId: string) =>
    apiCall<any[]>(`/registrations/user/${userId}`),
};

export const checkInAPI = {
  validate: (data: { token: string; eventId: string }) =>
    apiCall<CheckInValidation>("/checkin/validate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getReport: (eventId: string) =>
    apiCall<AttendanceReport>(`/checkin/report/${eventId}`),
};

export const notificationsAPI = {
  sendReminders: (eventId: string) =>
    apiCall(`/notifications/reminders/event/${eventId}`, {
      method: "POST",
    }),

  sendCheckInConfirmation: (eventId: string, userId: string) =>
    apiCall(`/notifications/checkin/event/${eventId}/user/${userId}`, {
      method: "POST",
    }),
};
