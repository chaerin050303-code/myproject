"use client";

import { useState, useMemo } from "react";
import { getTotalCarbon, getCategoryRatio, getCoachMessage, type PeriodType } from "../utils/carbonStats";

// 더미 시리즈 데이터 생성 함수 (period 별 값)
function getSeries(period: PeriodType): number[] {
  switch (period) {
    case 'Day':
      // 시간대 단위 6개 값 (예: 오전~저녁)
      return [12, 18, 9, 22, 15, 19];
    case 'Week':
      // 월~일 7개 값
      return [34, 28, 45, 31, 39, 25, 48];
    case 'Month':
      // 12개월 값
      return [120, 95, 102, 130, 90, 85, 140, 110, 98, 150, 125, 170];
    case 'Year':
      // 최근 6년 값
      return [800, 950, 1020, 875, 1100, 1230];
    default:
      return [];
  }
}

// 시리즈 데이터로 SVG Path 문자열 생성
function buildPathFromSeries(series: number[], width = 300, height = 150) {
  if (!series.length) return { linePath: '', areaPath: '' };
  const topPad = 10;
  const bottomPad = 20; // baseline 위치 (height - bottomPad)
  const max = Math.max(...series);
  const min = 0; // 최소 0 기준
  const usableHeight = height - topPad - bottomPad;
  const step = series.length === 1 ? 0 : width / (series.length - 1);

  const lineParts: string[] = [];
  const areaParts: string[] = [];

  series.forEach((v, i) => {
    const x = +(i * step).toFixed(2);
    const ratio = (v - min) / (max - min || 1);
    const y = +(topPad + (1 - ratio) * usableHeight).toFixed(2); // 값이 클수록 위쪽
    if (i === 0) {
      lineParts.push(`M${x},${y}`);
      // area 시작: baseline -> 첫 지점
      areaParts.push(`M${x},${height - bottomPad}`);
      areaParts.push(`L${x},${y}`);
    } else {
      lineParts.push(`L${x},${y}`);
      areaParts.push(`L${x},${y}`);
    }
  });

  const lastX = +(((series.length - 1) * step)).toFixed(2);
  // 닫기: 마지막 지점에서 baseline으로 내려온 후 시작 baseline으로 닫기
  areaParts.push(`L${lastX},${height - bottomPad}`);
  areaParts.push('Z');

  return { linePath: lineParts.join(' '), areaPath: areaParts.join(' ') };
}

// 시리즈 기반 증감률(%) 계산: 첫 값 대비 마지막 값 변화율
function computeGrowthPercent(series: number[]): number {
  if (!series || series.length < 2) return 0;
  const first = series[0];
  const last = series[series.length - 1];
  if (first === 0) return 0;
  const change = ((last - first) / Math.abs(first)) * 100;
  return Math.round(change);
}

export default function StatsPage() {
  const [period, setPeriod] = useState<PeriodType>("Month");

  // 기간별 더미 시리즈 및 Path 계산
  const series = useMemo(() => getSeries(period), [period]);
  const { linePath, areaPath } = useMemo(() => buildPathFromSeries(series), [series]);
  const growthPercent = useMemo(() => computeGrowthPercent(series), [series]);

  // 기존 로직 유지: 총 감축량 및 코치 메시지/비율
  const currentCarbon = getTotalCarbon(period);
  const ratios = getCategoryRatio(period);
  const coachMessage = getCoachMessage(period);

  // 기간 라벨 매핑
  const periodLabelMap: Record<PeriodType, string> = {
    Day: '오늘 감축량',
    Week: '이번 주 감축량',
    Month: '이번 달 감축량',
    Year: '올해 감축량',
  };

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

      {/* 페이지 타이틀과 기간 선택 */}
      <div className="bg-white px-6 pt-6 pb-6" style={{borderBottom: '1px solid #e5e5e5'}}>
        {/* 타이틀 텍스트 - 왼쪽 정렬 */}
        <div className="flex flex-col mb-6">
          <div className="text-sm text-gray-400 mb-1">AI 탄소 감축 코치</div>
          <div className="text-2xl font-extrabold text-gray-900">탄소 가계부</div>
        </div>

        {/* 기간 선택 탭 - Pill 스타일 */}
        <div className="flex justify-center gap-3">
          {(["Day", "Week", "Month", "Year"] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                period === p
                  ? "bg-white text-green-500 shadow-sm"
                  : "bg-transparent text-gray-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 메인 탄소 감축량 카드 */}
      <div className="px-6 py-5">
        <div className="bg-white rounded-3xl p-6 shadow-md">
          {/* 그래프 영역 */}
          <div className="relative h-44 mb-6">
            {/* 간단한 선 그래프 SVG */}
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="graphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* 배경 그리드 */}
              <line x1="0" y1="37.5" x2="300" y2="37.5" stroke="#f5f5f5" strokeWidth="1"/>
              <line x1="0" y1="75" x2="300" y2="75" stroke="#f5f5f5" strokeWidth="1"/>
              <line x1="0" y1="112.5" x2="300" y2="112.5" stroke="#f5f5f5" strokeWidth="1"/>
              
              {/* 동적 그래프 영역 채우기 */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#graphGradient)"
                />
              )}
              {/* 동적 그래프 선 */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
            
            {/* 증가율 표시 */}
              <div className={`absolute top-3 right-3 bg-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm ${growthPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {growthPercent >= 0 ? `+${growthPercent}%` : `${growthPercent}%`}
              </div>
          </div>

          {/* 탄소 감축량 */}
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-gray-900 tracking-tight">
              {currentCarbon}<span className="text-6xl font-bold text-gray-900">kgCO₂</span>
            </div>
            <div className="text-sm text-gray-400 font-medium mt-2">{periodLabelMap[period]}</div>
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
