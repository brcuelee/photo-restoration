import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Auth API' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }
    
    // 动态导入auth模块
    const authModule = await import('@/lib/auth');
    const user = await authModule.validateUser(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        freeCredits: user.freeCredits
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '登录失败' },
      { status: 500 }
    );
  }
}
