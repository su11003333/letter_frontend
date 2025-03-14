// app/login/page.tsx
import { Metadata } from 'next';
import LoginForm from '@/components/ui/LoginForm';

export const metadata: Metadata = {
  title: '登入 - 寫字練習平台',
  description: '登入您的寫字練習平台帳號',
};

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">登入您的帳號</h1>
      <LoginForm />
    </div>
  );
}