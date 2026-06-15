import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

// 基础修复 - GFPGAN
export async function restoreImage(imageUrl: string) {
  try {
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
  } catch (error) {
    console.error('Restore error:', error);
    throw new Error('图片修复失败，请稍后重试');
  }
}

// 高清放大 - Real-ESRGAN
export async function upscaleImage(imageUrl: string, scale: number = 2) {
  try {
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
  } catch (error) {
    console.error('Upscale error:', error);
    throw new Error('图片放大失败，请稍后重试');
  }
}

// 智能上色 - DeOldify
export async function colorizeImage(imageUrl: string) {
  try {
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
  } catch (error) {
    console.error('Colorize error:', error);
    throw new Error('图片上色失败，请稍后重试');
  }
}

// 通用预测函数（用于轮询）
export async function getPredictionStatus(predictionId: string) {
  try {
    const prediction = await replicate.predictions.get(predictionId);
    return prediction;
  } catch (error) {
    console.error('Get prediction error:', error);
    throw new Error('获取处理状态失败');
  }
}
