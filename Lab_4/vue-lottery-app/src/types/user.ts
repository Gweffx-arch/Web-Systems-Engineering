export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password?: string;
  age: number;
  gender: string;
  phone: string;
  image?: string;
}

export type CreateUserDto = Omit<User, 'id'>;
export type UpdateUserDto = Partial<CreateUserDto>;

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}
