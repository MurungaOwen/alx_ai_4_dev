export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  token: string
}