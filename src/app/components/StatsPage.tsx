"use client";

import { useState } from "react";
import { getTotalCarbon, getCategoryRatio, getCoachMessage, getChartData, type PeriodType } from "../utils/carbonStats";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StatsPage() {
  const [chartRange, setChartRange] = useState<'day' | 'week' | 'month' | 'year'>('year');

  // Convert chartRange to PeriodType
  const period: PeriodType = chartRange === 'day' ? 'Day' : chartRange === 'week' ? 'Week' : chartRange === 'month' ? 'Month' : 'Year';
  
  // Get real data from carbonStats
  const chartData = getChartData(period);
  const currentCarbon = getTotalCarbon(period);
  const ratios = getCategoryRatio(period);
  const coachMessage = getCoachMessage(period);

  return (
    <div className="min-h-screen pb-24" style={{backgroundColor: '#F7F9FB'}}>
      {/* 헤더 - 로고와 알림 */}
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

      {/* 페이지 타이틀 */}
      <div className="bg-white px-6 pt-6 pb-6" style={{borderBottom: '1px solid #e5e5e5'}}>
        {/* 타이틀 텍스트 - 왼쪽 정렬 */}
        <div className="flex flex-col">
          <div className="text-sm text-gray-400 mb-1">AI 탄소 감축 코치</div>
          <div className="text-2xl font-extrabold text-gray-900">탄소 가계부</div>
        </div>
      </div>

      {/* 메인 탄소 감축량 카드 */}
      <div className="px-6 py-5">
        <div className="bg-white rounded-3xl p-6 shadow-md">
          {/* 차트 범위 선택 탭 */}
          <div className="flex justify-center gap-2 mb-6">
            {(['day', 'week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setChartRange(range)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  chartRange === range
                    ? "text-white shadow-md"
                    : "bg-gray-100 text-gray-500"
                }`}
                style={chartRange === range ? { backgroundColor: '#1DBF73' } : {}}
              >
                {range === 'day' ? 'Day' : range === 'week' ? 'Week' : range === 'month' ? 'Month' : 'Year'}
              </button>
            ))}
          </div>

          {/* Recharts 그래프 영역 */}
          <div className="relative h-44 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1DBF73" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1DBF73" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="label" 
                  stroke="#999" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#999" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1DBF73" 
                  strokeWidth={2.5}
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 탄소 감축량 */}
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-gray-900 tracking-tight">
              {currentCarbon}<span className="text-6xl font-bold text-gray-900">kgCO₂</span>
            </div>
            <div className="text-sm text-gray-400 font-medium mt-2">
              {chartRange === 'day' ? '오늘 감축량' : chartRange === 'week' ? '이번 주 감축량' : chartRange === 'month' ? '이번 달 감축량' : '올해 감축량'}
            </div>
          </div>

          {/* AI 코치 메시지 */}
          <div className="text-center -mt-2 mb-6">
            <span className="text-sm font-medium" style={{ color: '#11995A' }}>{coachMessage}</span>
          </div>

          
        </div>
      </div>

      {/* 오늘 하루 탄소 단축 일과 */}
      <div className="px-6 mb-5">
        <h3 className="text-base font-bold text-gray-900 mb-3">오늘 하루 탄소 단축 일과</h3>
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-lg">✓</span>
            </div>
            <span className="text-sm font-medium text-gray-700">텀블러 사용하기</span>
          </div>
        </div>
      </div>

      {/* 하단 액션 카드 */}
      <div className="px-6">
        <div className="grid grid-cols-3 gap-3">
          <button className="bg-white rounded-2xl p-4 shadow-sm flex flex-col justify-between items-start h-28 active:scale-95 transition-transform">
            <div className="w-7 h-7 text-green-500">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 17h14M5 17l3.5-3.5M5 17l3.5 3.5M19 7H5M19 7l-3.5-3.5M19 7l-3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-800">교통</div>
              <div className="text-xs text-green-600">▲ 2 hours</div>
            </div>
          </button>

          <button className="bg-white rounded-2xl p-4 shadow-sm flex flex-col justify-between items-start h-28 active:scale-95 transition-transform">
            <div className="w-7 h-7 text-blue-500">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-800">소비</div>
              <div className="text-xs text-green-600">▲ 45%</div>
            </div>
          </button>

          <button className="bg-white rounded-2xl p-4 shadow-sm flex flex-col justify-between items-start h-28 active:scale-95 transition-transform">
            <div className="w-7 h-7 text-purple-500">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 18h10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-800">핸드폰</div>
              <div className="text-xs text-red-500">▼ 1 hours</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
