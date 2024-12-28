import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyToken, generateToken } from '@/utils/auth';

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment variables');
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function GET() {
  const token = cookies().get('admin_token')?.value;
  
  if (!token) {
    return NextResponse.json({ isAuthenticated: false });
  }

  const isValid = await verifyToken(token);
  return NextResponse.json({ 
    isAuthenticated: isValid,
    user: isValid ? {
      username: ADMIN_USERNAME,
      role: 'admin'
    } : null
  });
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 防止时序攻击
    const usernameMatch = username === ADMIN_USERNAME;
    const passwordMatch = password === ADMIN_PASSWORD;
    
    if (usernameMatch && passwordMatch) {
      // 生成 JWT token
      const token = await generateToken(ADMIN_USERNAME);
      
      cookies().set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 1 week
      });

      return NextResponse.json({ success: true });
    }

    // 固定的响应时间，防止时序攻击
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json(
      { error: "用户名或密码错误" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  cookies().delete('admin_token');
  return NextResponse.json({ success: true });
}
