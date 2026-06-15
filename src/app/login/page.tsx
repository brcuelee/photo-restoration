'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '登录失败');
      } else {
        // 保存登录状态到 localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] paper-texture flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b4513] to-[#d4a574] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-artistic text-3xl text-[#2c1810]">时光修复师</h1>
          <p className="text-[#8b7355] mt-2">登录后开始修复您的珍贵回忆</p>
        </div>

        <Card className="border-[#d4c4a8] bg-white/90">
          <CardHeader>
            <CardTitle className="font-serif-cn text-xl text-[#2c1810]">用户登录</CardTitle>
            <CardDescription className="text-[#8b7355]">
              使用邮箱和密码登录您的账户
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#2c1810]">
                  <Mail className="w-4 h-4 inline mr-2" />
                  邮箱地址
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入您的邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-[#d4c4a8] focus:border-[#8b4513] focus:ring-[#8b4513]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2c1810]">
                  <Lock className="w-4 h-4 inline mr-2" />
                  密码
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-[#d4c4a8] focus:border-[#8b4513] focus:ring-[#8b4513]"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8b4513] hover:bg-[#a0522d] text-white h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#8b7355]">
                还没有账户？{' '}
                <Link href="/register" className="text-[#8b4513] hover:underline font-medium">
                  立即注册
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 功能介绍 */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#f5ebe0] flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-[#8b4513]" />
            </div>
            <p className="text-xs text-[#8b7355]">免费试用3次</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-[#f5ebe0] flex items-center justify-center mx-auto mb-2">
              <Mail className="w-5 h-5 text-[#8b4513]" />
            </div>
            <p className="text-xs text-[#8b7355]">邮箱快速登录</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-[#f5ebe0] flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5 text-[#8b4513]" />
            </div>
            <p className="text-xs text-[#8b7355]">数据安全保护</p>
          </div>
        </div>
      </div>
    </div>
  );
}
