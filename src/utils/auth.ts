import * as jose from 'jose'

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '')
    await jose.jwtVerify(token, secret)
    return true
  } catch (error) {
    return false
  }
}

export async function generateToken(username: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || '')
  const token = await new jose.SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  return token
}
