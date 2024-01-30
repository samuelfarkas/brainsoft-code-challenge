export class AuthError extends Error {
  constructor (message?: string) {
    super(message ?? 'Unauthorized')
    this.name = 'AuthError'
  }
}
