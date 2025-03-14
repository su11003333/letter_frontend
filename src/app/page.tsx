import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '寫字練習平台 - 首頁',
  description: '透過遊戲化方式學習正確筆順，提升孩子的寫字興趣和能力',
};

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* 英雄區塊 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-xl p-8 mb-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            引導小孩學習寫字的互動平台
          </h1>
          <p className="text-xl mb-8">
            通過遊戲化方式學習正確筆順，提升孩子的寫字興趣和能力
          </p>
          
          <div className="space-x-4">
            <Link
              href="/login"
              className="inline-block bg-white text-indigo-700 hover:bg-indigo-100 font-bold px-6 py-3 rounded-lg shadow-md text-lg transition-all"
            >
              登錄
            </Link>
            <Link
              href="/practice"
              className="inline-block bg-indigo-500 text-white hover:bg-indigo-600 font-bold px-6 py-3 rounded-lg shadow-md text-lg transition-all"
            >
              開始練習
            </Link>
          </div>
        </div>
      </div>
      
      {/* 特點和優勢 */}
      <div className="max-w-5xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">我們的特點</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl text-blue-600 mb-4">🖌️</div>
            <h3 className="text-xl font-semibold mb-2">正確筆順引導</h3>
            <p className="text-gray-600">
              系統會顯示筆順指導，幫助孩子建立正確的書寫習慣。
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl text-blue-600 mb-4">🎮</div>
            <h3 className="text-xl font-semibold mb-2">遊戲化學習</h3>
            <p className="text-gray-600">
              將寫字學習轉化為有趣的遊戲體驗，提高孩子的學習興趣。
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl text-blue-600 mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">進度追蹤</h3>
            <p className="text-gray-600">
              詳細記錄學習進度，幫助家長和教師了解孩子的學習狀況。
            </p>
          </div>
        </div>
      </div>
      
      {/* 使用說明 */}
      <div className="bg-gray-50 p-8 rounded-lg">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">如何使用</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <span className="flex-shrink-0 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">1</span>
              <div>
                <h3 className="text-xl font-semibold mb-1">註冊帳號</h3>
                <p className="text-gray-600">
                  建立個人帳號，以便追蹤學習進度和成就。
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="flex-shrink-0 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">2</span>
              <div>
                <h3 className="text-xl font-semibold mb-1">選擇練習字元</h3>
                <p className="text-gray-600">
                  從字庫中選擇要練習的漢字。
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="flex-shrink-0 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">3</span>
              <div>
                <h3 className="text-xl font-semibold mb-1">跟隨筆順練習</h3>
                <p className="text-gray-600">
                  按照指示的筆順節點順序完成漢字書寫。
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="flex-shrink-0 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4">4</span>
              <div>
                <h3 className="text-xl font-semibold mb-1">獲得反饋與進步</h3>
                <p className="text-gray-600">
                  系統會評估寫字完成度並提供反饋，幫助持續進步。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}