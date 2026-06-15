import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export const dynamic = 'force-dynamic';

// 基础修复 - GFPGAN
async function restoreImage(imageUrl: string) {
  const output = await replicate.run(
    "tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
    {
      input: {
        img: imageUrl,
        version: "v1.4",
        scale: 2
      }
    }
  );
  return output;
}

// 高清放大 - Real-ESRGAN
async function upscaleImage(imageUrl: string, scale: number = 2) {
  const output = await replicate.run(
    "xinntao/realesrgan:1b976d4e3ef8d2fd1b976d4e3ef8d2fd1b976d4e3ef8d2fd",
    {
      input: {
        image: imageUrl,
        scale: scale,
        face_enhance: true
      }
    }
  );
  return output;
}

// 智能上色 - DeOldify
async function colorizeImage(imageUrl: string) {
  const output = await replicate.run(
    "arielreplicate/deoldify_image:0da6e39d8525e094c5f0f44a4d5b3c0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e",
    {
      input: {
        source_image: imageUrl,
        render_factor: 35
      }
    }
  );
  return output;
}

export async function POST(request: NextRequest) {
  try {
    // 从请求头获取用户信息（自定义认证）
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }
    
    // 动态导入auth模块
    const { decrementFreeCredits } = await import('@/lib/auth');
    
    // 获取用户信息和剩余次数
    const userResult = await sql`
      SELECT id, free_credits FROM users WHERE email = ${userEmail}
    `;
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    const userId = userResult.rows[0].id;
    const freeCredits = userResult.rows[0].free_credits;
    
    if (freeCredits <= 0) {
      return NextResponse.json(
        { error: '免费次数已用完，请升级套餐' },
        { status: 403 }
      );
    }
    
    const { imageUrl, operation, scale = 2 } = await request.json();
    
    if (!imageUrl || !operation) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 扣除免费次数
    const newCredits = await decrementFreeCredits(userId);
    
    if (newCredits === null) {
      return NextResponse.json(
        { error: '扣除次数失败' },
        { status: 500 }
      );
    }
    
    // 创建处理记录
    const imageRecord = await sql`
      INSERT INTO images (user_id, original_url, operation, scale, status)
      VALUES (${userId}, ${imageUrl}, ${operation}, ${scale}, 'processing')
      RETURNING id
    `;
    
    const imageId = imageRecord.rows[0].id;
    
    // 根据操作类型调用不同的AI模型
    let result;
    
    try {
      switch (operation) {
        case 'restore':
          result = await restoreImage(imageUrl);
          break;
        case 'upscale':
          result = await upscaleImage(imageUrl, scale);
          break;
        case 'colorize':
          result = await colorizeImage(imageUrl);
          break;
        default:
          return NextResponse.json(
            { error: '不支持的操作类型' },
            { status: 400 }
          );
      }
      
      // 更新处理结果
      const resultUrl = Array.isArray(result) ? result[0] : result;
      
      // 根据操作类型更新不同的字段
      if (operation === 'restore') {
        await sql`
          UPDATE images 
          SET restored_url = ${resultUrl},
              status = 'completed',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${imageId}
        `;
      } else if (operation === 'upscale') {
        await sql`
          UPDATE images 
          SET upscaled_url = ${resultUrl},
              status = 'completed',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${imageId}
        `;
      } else {
        await sql`
          UPDATE images 
          SET colorized_url = ${resultUrl},
              status = 'completed',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${imageId}
        `;
      }
      
      return NextResponse.json({
        success: true,
        resultUrl,
        remainingCredits: newCredits,
        imageId
      });
      
    } catch (error: any) {
      // 更新失败状态
      await sql`
        UPDATE images 
        SET status = 'failed',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${imageId}
      `;
      
      // 返还次数
      await sql`
        UPDATE users 
        SET free_credits = free_credits + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
      `;
      
      return NextResponse.json(
        { error: error.message || '处理失败，请稍后重试' },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Process error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
