export interface LoginPayload {
  hpAddress: string,
  password: string,
}

export interface LoginResponse {
  accessToken: string,
  hpAddress: string
  name: string
}