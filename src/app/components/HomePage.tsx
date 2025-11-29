"use client";

import Image from 'next/image';

interface HomePageProps {
  nickname: string;
}

export default function HomePage({ nickname }: HomePageProps) {
  // Get current date
  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = dayNames[today.getDay()];
  const dateString = `${month}월 ${date}일 (${dayOfWeek})`;

  return (
    <div className="min-h-screen pb-24" style={{backgroundColor: '#F7F9FB'}}>
      {/* Header */}
      <div className="px-6 py-1 flex items-center justify-between" style={{backgroundColor: 'white', borderBottom: '1px solid #CCCCCC'}}>
        <div className="flex-none">
          <img 
            src="/images/logo.png" 
            alt="Logo"
            style={{width: '120px', height: 'auto', marginLeft: '4px', marginTop: '2px'}}
          />
        </div>
        <button style={{color: '#999999'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
          </svg>
        </button>
      </div>

      {/* Main Content Container */}
      <div className="max-w-sm mx-auto px-5 pt-6">
        {/* Text Stack - All left aligned */}
        <div className="flex flex-col">
          {/* Today's Action Message - Force 2 lines */}
          <div className="max-w-[230px]">
            <p className="text-[18px] leading-[1.4] font-semibold" style={{color: '#111111'}}>
              오늘 버스를 타서 <span style={{color: '#3CB44A'}}>나무 한 그루</span>를 심었어요! 🌱
            </p>
          </div>

          {/* Date - 6~8px below */}
          <p className="mt-2 text-[12px] font-normal" style={{color: '#B0B0B0'}}>
            {dateString}
          </p>

          {/* Section Title - moved up closer to card */}
          <h2 className="mt-4 mb-3 text-[15px] font-semibold" style={{color: '#111111'}}>
            이번 달 <span style={{color: '#111111'}}>{nickname || '세움'}</span>님의{" "}
            <span style={{color: '#3CB44A'}}>탄소 나무</span>
          </h2>
        </div>

        {/* Tree Card */}
        <div className="bg-white rounded-3xl shadow-md px-5 pt-5 pb-4 mb-6">
          {/* Tree count badge */}
          <div className="flex justify-start">
            <div className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold" style={{backgroundColor: '#E6F7EF', color: '#11995A'}}>
              1단계
            </div>
          </div>

          {/* Tree Illustration - Image */}
          <div className="flex justify-center my-3">
            <Image 
              src="/images/tree_stage7.jpg"
              alt="carbon tree"
              width={260}
              height={260}
              className="object-contain mx-auto"
            />
          </div>

          {/* Info Speech Bubble - floating card inside */}
          <div className="mt-3 bg-emerald-50 rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-[15px] leading-[1.5] font-bold text-gray-800 max-w-[240px]">
              내일도{" "}
              <span className="font-bold text-amber-500">대중교통</span>
              을 이용하시면{" "}
              {nickname || '세움'}님의 나무가{" "}
              <span className="font-bold text-amber-500">한 그루</span>
              를 성장할 수 있어요!
            </p>
            <p className="mt-1 text-xs text-gray-400">
              승용차 210gCO₂ vs 버스 27.7gCO₂
            </p>
          </div>
        </div>

        {/* Weekly Donation News */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">이번주 기부 소식</h3>
          <div className="h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
            <p className="text-xs text-gray-400">준비 중입니다...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
