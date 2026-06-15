'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 验证密码
    if (password.length < 6) {
      setError('密码至少需要6个字符');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setIsLoading(false);
      return;
    }

    try {
      // 1. 注册用户
      const registerResponse = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(data.error || '注册失败');
      }

      // 2. 自动登录
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('注册成功但登录失败，请手动登录');
        router.push('/login');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
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
          <p className="text-[#8b7355] mt-2">注册账户，开始修复珍贵回忆</p>
        </div>

        <Card className="border-[#d4c4a8] bg-white/90">
          <CardHeader>
            <CardTitle className="font-serif-cn text-xl text-[#2c1810]">用户注册</CardTitle>
            <CardDescription className="text-[#8b7355]">
              注册后即可获得3次免费修复机会
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
                <Label htmlFor="name" className="text-[#2c1810]">
                  <User className="w-4 h-4 inline mr-2" />
                  昵称
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="请输入您的昵称"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-[#d4c4a8] focus:border-[#8b4513] focus:ring-[#8b4513]"
                />
              </div>

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
                  placeholder="至少6个字符"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-[#d4c4a8] focus:border-[#8b4513] focus:ring-[#8b4513]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#2c1810]">
                  <Lock className="w-4 h-4 inline mr-2" />
                  确认密码
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    注册中...
                  </>
                ) : (
                  '注册'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#8b7355]">
                已有账户？{' '}
                <Link href="/login" className="text-[#8b4513] hover:underline font-medium">
                  立即登录
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 注册福利 */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#f5ebe0] flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-[#8b4513]" />
            </div>
            <p className="text-xs text-[#8b7355]">免费3次</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-[#f5ebe0] flex items-center justify-center mx-auto mb-2">
              <Mail className="w-5 h-5 text-[#8b4513]" />
            </div>
            <p className="text-xs text-[#8b7355]">快速注册</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-[#f5ebe0] flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5 text-[#8b4513]" />
            </div>
            <p className="text-xs text-[#8b7355]">安全保护</p>
          </div>
        </div>
      </div>
    </div>
  );
}
