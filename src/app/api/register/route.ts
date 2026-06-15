import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6个字符' },
        { status: 400 }
      );
    }
    
    // 动态导入以避免构建时的问题
    const { createUser } = await import('@/lib/auth');
    const user = await createUser(email, password, name);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        freeCredits: user.free_credits
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '注册失败' },
      { status: 400 }
    );
  }
}
