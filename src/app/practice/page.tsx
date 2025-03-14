// app/practice/page.tsx
import { Metadata } from 'next';
import PracticeContent from '@/components/ui/PracticeContent';

export const metadata: Metadata = {
  title: '寫字練習',
  description: '選擇漢字進行筆順練習',
};

export default function PracticePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">寫字練習</h1>
      <PracticeContent />
    </div>
  );
}