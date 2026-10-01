import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'ESTUDIO ARKIPELAGO | LOGIN',
  description: 'Operations System Access Authentication',
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-2xl flex flex-col items-center justify-center">
      <LoginForm />
    </div>
  );
}
