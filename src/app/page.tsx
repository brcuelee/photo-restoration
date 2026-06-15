'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Upload, 
  Wand2, 
  ZoomIn, 
  Palette, 
  Download, 
  GitCompare,
  Loader2,
  LogOut,
  User,
  Sparkles,
  ImageIcon,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  status: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  freeCredits: number;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    status: ''
  });
  const [selectedOperation, setSelectedOperation] = useState<string>('restore');
  const [scale, setScale] = useState<number>(2);
  const [error, setError] = useState<string>('');
  const [remainingCredits, setRemainingCredits] = useState<number>(3);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setRemainingCredits(userData.freeCredits);
    } catch {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setProcessedImage(null);

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      setError(`不支持的文件格式「${file.type || '未知'}」。请上传 JPG、PNG 或 HEIC 格式的图片。`);
      return;
    }

    // 验证文件大小
    if (file.size > 20 * 1024 * 1024) {
      setError(`文件过大（${(file.size / 1024 / 1024).toFixed(1)}MB），最大支持 20MB。请压缩后重试。`);
      return;
    }

    // 显示预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!originalImage) {
      setError('请先上传图片');
      return;
    }

    if (!user) {
      setError('请先登录');
      return;
    }

    setProcessing({
      isProcessing: true,
      progress: 10,
      status: '正在处理...'
    });
    setError('');

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
        },
        body: JSON.stringify({
          imageUrl: originalImage,
          operation: selectedOperation,
          scale: scale
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '处理失败');
      }

      setProcessing(prev => ({ ...prev, progress: 100, status: '处理完成！' }));
      setProcessedImage(data.resultUrl);
      setRemainingCredits(data.remainingCredits);

      // 更新本地存储的用户信息
      const updatedUser = { ...user, freeCredits: data.remainingCredits };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setTimeout(() => {
        setProcessing({
          isProcessing: false,
          progress: 0,
          status: ''
        });
      }, 1000);

    } catch (err: any) {
      setProcessing({
        isProcessing: false,
        progress: 0,
        status: ''
      });
      setError(err.message || '处理失败，请稍后重试');
    }
  };

  const handleDownload = async () => {
    if (!processedImage) return;
    
    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `修复后的照片_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('下载失败，请重试');
    }
  };

  const handleSliderMove = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  }, [isDragging]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf6f0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b4513]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf6f0] paper-texture">
      {/* 顶部导航 */}
      <header className="border-b border-[#d4c4a8] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b4513] to-[#d4a574] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-artistic text-xl text-[#2c1810]">时光修复师</h1>
              <p className="text-xs text-[#8b7355] -mt-1">AI老照片修复</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-[#f5ebe0] text-[#8b4513]">
              剩余次数: {remainingCredits}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-[#8b7355]">
              <User className="w-4 h-4" />
              <span>{user.name || user.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-[#8b7355] hover:text-[#2c1810]"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标题区域 */}
        <div className="text-center mb-10">
          <h2 className="font-serif-cn text-3xl md:text-4xl font-bold text-[#2c1810] mb-2">
            让珍贵回忆重现光彩
          </h2>
          <p className="text-[#8b4513] font-medium text-base mb-3 tracking-wide">
            ✨ AI Photo Restoration Tool — 智能老照片修复
          </p>
          <p className="text-[#8b7355] text-lg max-w-2xl mx-auto">
            上传您的老照片，AI将自动修复折痕、污渍，提升清晰度，并为黑白照片上色
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-[#f5ebe0] border border-[#d4c4a8] rounded-full px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#8b4513]" />
            <span className="text-xs text-[#8b4513] font-medium">Powered by Replicate AI</span>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert className="mb-6 bg-red-50 border-2 border-red-300 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <AlertDescription className="text-red-700 font-medium text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：上传和设置 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 上传区域 */}
            <Card className="border-[#d4c4a8] bg-white/80">
              <CardContent className="p-6">
                <h3 className="font-serif-cn text-lg font-semibold text-[#2c1810] mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#8b4513]" />
                  上传照片
                </h3>
                
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#d4c4a8] rounded-xl p-8 text-center cursor-pointer hover:border-[#8b4513] hover:bg-[#f5ebe0]/50 transition-all"
                >
                  {originalImage ? (
                    <div className="relative">
                      <img
                        src={originalImage}
                        alt="预览"
                        className="max-h-48 mx-auto rounded-lg vintage-border"
                      />
                      <p className="mt-2 text-sm text-[#8b7355]">点击更换图片</p>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="w-12 h-12 mx-auto text-[#d4c4a8] mb-3" />
                      <p className="text-[#8b7355] mb-1">点击或拖拽上传照片</p>
                      <p className="text-xs text-[#8b7355]/70">支持 JPG、PNG、HEIC，最大 20MB</p>
                      <p className="text-xs text-[#8b4513]/80 mt-2 italic">
                        💡 Best results: old photos with faces, scratches, or fading.
                      </p>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/heic,image/heif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* 功能选择 */}
            <Card className="border-[#d4c4a8] bg-white/80">
              <CardContent className="p-6">
                <h3 className="font-serif-cn text-lg font-semibold text-[#2c1810] mb-4">
                  选择功能
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedOperation('restore')}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedOperation === 'restore'
                        ? 'border-[#8b4513] bg-[#f5ebe0]'
                        : 'border-[#d4c4a8] hover:border-[#8b4513]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedOperation === 'restore' ? 'bg-[#8b4513]' : 'bg-[#f5ebe0]'
                      }`}>
                        <Wand2 className={`w-5 h-5 ${
                          selectedOperation === 'restore' ? 'text-white' : 'text-[#8b4513]'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-[#2c1810]">基础修复</p>
                        <p className="text-xs text-[#8b7355]">去除折痕、污渍、划痕</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedOperation('upscale')}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedOperation === 'upscale'
                        ? 'border-[#8b4513] bg-[#f5ebe0]'
                        : 'border-[#d4c4a8] hover:border-[#8b4513]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedOperation === 'upscale' ? 'bg-[#8b4513]' : 'bg-[#f5ebe0]'
                      }`}>
                        <ZoomIn className={`w-5 h-5 ${
                          selectedOperation === 'upscale' ? 'text-white' : 'text-[#8b4513]'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-[#2c1810]">高清放大</p>
                        <p className="text-xs text-[#8b7355]">2倍或4倍超分辨率</p>
                      </div>
                    </div>
                  </button>

                  {selectedOperation === 'upscale' && (
                    <div className="pl-14">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setScale(2)}
                          className={`px-4 py-2 rounded-lg text-sm ${
                            scale === 2
                              ? 'bg-[#8b4513] text-white'
                              : 'bg-[#f5ebe0] text-[#8b7355]'
                          }`}
                        >
                          2倍
                        </button>
                        <button
                          onClick={() => setScale(4)}
                          className={`px-4 py-2 rounded-lg text-sm ${
                            scale === 4
                              ? 'bg-[#8b4513] text-white'
                              : 'bg-[#f5ebe0] text-[#8b7355]'
                          }`}
                        >
                          4倍
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedOperation('colorize')}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedOperation === 'colorize'
                        ? 'border-[#8b4513] bg-[#f5ebe0]'
                        : 'border-[#d4c4a8] hover:border-[#8b4513]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedOperation === 'colorize' ? 'bg-[#8b4513]' : 'bg-[#f5ebe0]'
                      }`}>
                        <Palette className={`w-5 h-5 ${
                          selectedOperation === 'colorize' ? 'text-white' : 'text-[#8b4513]'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-[#2c1810]">智能上色</p>
                        <p className="text-xs text-[#8b7355]">为黑白照片添加逼真色彩</p>
                      </div>
                    </div>
                  </button>
                </div>

                <Button
                  onClick={handleProcess}
                  disabled={!originalImage || processing.isProcessing || remainingCredits <= 0}
                  className="w-full mt-6 bg-[#8b4513] hover:bg-[#a0522d] text-white h-12 text-lg"
                >
                  {processing.isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : remainingCredits <= 0 ? (
                    '免费次数已用完'
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      开始修复
                    </>
                  )}
                </Button>

                {processing.isProcessing && (
                  <div className="mt-4">
                    <Progress value={processing.progress} className="h-2" />
                    <p className="text-sm text-[#8b7355] mt-2 text-center">{processing.status}</p>
                  </div>
                )}

                {/* 社交证明 */}
                <div className="mt-6 pt-4 border-t border-[#d4c4a8]/50">
                  <div className="flex items-center justify-center gap-2 text-xs text-[#8b7355]">
                    <div className="flex -space-x-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#d4a574] border-2 border-white flex items-center justify-center text-[10px] text-white">👨</div>
                      <div className="w-6 h-6 rounded-full bg-[#8b4513] border-2 border-white flex items-center justify-center text-[10px] text-white">👩</div>
                      <div className="w-6 h-6 rounded-full bg-[#a0522d] border-2 border-white flex items-center justify-center text-[10px] text-white">👴</div>
                    </div>
                    <span>Trusted by 100+ families to restore their memories</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：预览区域 */}
          <div className="lg:col-span-2">
            <Card className="border-[#d4c4a8] bg-white/80 h-full">
              <CardContent className="p-6">
                <h3 className="font-serif-cn text-lg font-semibold text-[#2c1810] mb-4 flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-[#8b4513]" />
                  效果预览
                </h3>

                {!originalImage && !processedImage && (
                  <div className="flex flex-col items-center justify-center h-96 text-[#8b7355]">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg">上传照片后即可预览效果</p>
                    <p className="text-sm mt-2">支持基础修复、高清放大、智能上色</p>
                  </div>
                )}

                {originalImage && !processedImage && (
                  <div className="flex flex-col items-center">
                    <img
                      src={originalImage}
                      alt="原图"
                      className="max-h-96 rounded-lg vintage-border"
                    />
                    <p className="mt-4 text-sm text-[#8b7355]">原图预览</p>
                  </div>
                )}

                {originalImage && processedImage && (
                  <div className="space-y-4">
                    {/* 对比滑块 */}
                    <div
                      className="relative rounded-lg overflow-hidden vintage-border cursor-ew-resize select-none"
                      style={{ maxHeight: '500px' }}
                      onMouseMove={handleSliderMove}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseLeave={() => setIsDragging(false)}
                      onTouchMove={handleSliderMove}
                      onTouchStart={() => setIsDragging(true)}
                      onTouchEnd={() => setIsDragging(false)}
                    >
                      <div className="relative" style={{ paddingBottom: '75%' }}>
                        {/* 原图（底层） */}
                        <img
                          src={originalImage}
                          alt="原图"
                          className="absolute inset-0 w-full h-full object-contain bg-[#2c1810]"
                        />
                        
                        {/* 处理后图片（上层，通过clip-path控制显示区域） */}
                        <img
                          src={processedImage}
                          alt="处理后"
                          className="absolute inset-0 w-full h-full object-contain bg-[#2c1810]"
                          style={{
                            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                          }}
                        />
                        
                        {/* 滑块手柄 */}
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
                          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                        >
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <GitCompare className="w-4 h-4 text-[#8b4513]" />
                          </div>
                        </div>
                        
                        {/* 标签 */}
                        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          原图
                        </div>
                        <div className="absolute top-4 right-4 bg-[#8b4513]/80 text-white px-3 py-1 rounded-full text-sm">
                          修复后
                        </div>
                      </div>
                    </div>

                    {/* 下载按钮 */}
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={handleDownload}
                        className="bg-[#8b4513] hover:bg-[#a0522d] text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载修复后的照片
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-[#d4c4a8] bg-white/60">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center mx-auto mb-4">
                <Wand2 className="w-6 h-6 text-[#8b4513]" />
              </div>
              <h4 className="font-serif-cn font-semibold text-[#2c1810] mb-2">基础修复</h4>
              <p className="text-sm text-[#8b7355]">AI自动识别并去除折痕、污渍、划痕，保持原始照片质感</p>
            </CardContent>
          </Card>
          
          <Card className="border-[#d4c4a8] bg-white/60">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center mx-auto mb-4">
                <ZoomIn className="w-6 h-6 text-[#8b4513]" />
              </div>
              <h4 className="font-serif-cn font-semibold text-[#2c1810] mb-2">高清放大</h4>
              <p className="text-sm text-[#8b7355]">2倍或4倍超分辨率放大，让模糊细节变清晰，适合冲印</p>
            </CardContent>
          </Card>
          
          <Card className="border-[#d4c4a8] bg-white/60">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#f5ebe0] flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-[#8b4513]" />
              </div>
              <h4 className="font-serif-cn font-semibold text-[#2c1810] mb-2">智能上色</h4>
              <p className="text-sm text-[#8b7355]">基于AI历史常识为黑白照片上色，肤色自然，色彩和谐</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-[#d4c4a8] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#8b7355] text-sm mb-2">时光修复师 — 用AI技术守护珍贵回忆</p>
          <p className="text-[#8b7355]/60 text-xs">Used by photo restoration enthusiasts worldwide · Powered by Replicate AI</p>
        </div>
      </footer>
    </div>
  );
}
