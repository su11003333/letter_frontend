// app/progress/page.tsx
import { Metadata } from 'next';
import ProgressContent from '@/components/ui/ProgressContent';

export const metadata: Metadata = {
  title: '學習進度 - 寫字練習平台',
  description: '查看您的寫字學習進度和成就',
};

export default function ProgressPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">學習進度</h1>
      <ProgressContent />
    </div>
  );
}