import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 动态导入以避免构建时的问题
    const { initDB } = await import('@/lib/db');
    await initDB();
    return NextResponse.json({ success: true, message: '数据库初始化成功' });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: '数据库初始化失败', details: error.message },
      { status: 500 }
    );
  }
}
