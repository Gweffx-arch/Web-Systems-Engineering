export interface Participant {
  id: string;
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  email: string;
  phone: string;       // +380XXXXXXXXX
}

export interface FormErrors {
  name?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
}

export type SortField = 'name' | 'dateOfBirth';
export type SortOrder = 'asc' | 'desc';