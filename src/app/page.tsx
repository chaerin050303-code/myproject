'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { initializeApp } from 'firebase/app';
import { useUserStats } from './hooks/useUserStats';
import NicknameModal from './components/NicknameModal';

// ✅ 브라우저에서만 로드 (SSR 비활성화)
const CameraCapture = dynamic(() => import('./components/CameraCapture'), { ssr: false });
const ReceiptOCRPanel = dynamic(() => import('./components/ReceiptOCRPanel'), { ssr: false });
const StatsPage = dynamic(() => import('./components/StatsPage'), { ssr: false });
const HomePage = dynamic(() => import('./components/HomePage'), { ssr: false });
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// NOTE: 페이지는 이미 `use client`이므로 클라이언트 컴포넌트를 직접 import 합니다.

// 🔹 Firebase 설정 (현재 구조 유지)
const firebaseConfig = {
  apiKey: 'AIzaSyArYCKEK05hjmiwvqbMq5JuEGG1aiMFRdY',
  authDomain: 'ste-final.firebaseapp.com',
  projectId: 'ste-final',
  storageBucket: 'ste-final.firebasestorage.app',
  messagingSenderId: '940484009989',
  appId: '1:940484009989:web:85d243d96fbbc31522fc6c',
  measurementId: 'G-G4057KG25N',
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [mainTab, setMainTab] = useState<'home' | 'chat' | 'camera' | 'chart' | 'profile'>('home'); // ← 메인 탭 상태
  const [cameraTab, setCameraTab] = useState<'solution' | 'report'>('solution'); // ← 카메라 내부 탭
  const [topCardMessage, setTopCardMessage] = useState<string>(''); // ← 상단 카드 메시지
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  
  // 카메라 촬영 기능을 위한 ref
  const cameraCaptureRef = useRef<{ takePhoto: () => void } | null>(null);
  const receiptOCRPanelRef = useRef<{ takeAndRecognize: () => void } | null>(null);

  // User stats hook
  const {
    nickname,
    totalCarbonSaved,
    totalEcoPurchases,
    totalRecycleActions,
    setNickname,
    addCarbonSaved,
    addEcoPurchase,
    addRecycleAction,
  } = useUserStats();

  // Check nickname on mount
  useEffect(() => {
    if (!nickname) {
      setShowNicknameModal(true);
    }
  }, [nickname]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      console.error(err);
      alert('로그인 실패');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // 현재 날짜 문자열 (예: 11월 29일 (토))
  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = dayNames[today.getDay()];
  const todayString = `${month}월 ${date}일 (${dayOfWeek})`;

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Nickname Modal */}
      <NicknameModal
        isOpen={showNicknameModal}
        onSubmit={(name) => {
          setNickname(name);
          setShowNicknameModal(false);
        }}
        currentNickname={nickname}
      />

      {/* === 메인 컨텐츠 === */}
      {mainTab === 'home' && (
        <HomePage nickname={nickname} />
      )}

      {mainTab === 'chat' && (
        <div className="min-h-screen bg-white pb-24">
          <div className="max-w-sm mx-auto px-4 pt-6">
            <p className="text-gray-600">채팅 화면</p>
          </div>
        </div>
      )}

      {mainTab === 'camera' && (
        <section id="lens" className="max-w-6xl mx-auto px-6 mt-12">
          {/* 탭 컨텐츠 (동시에 렌더하지 않음 → 카메라 충돌 방지) */}
          <div className="max-w-2xl mx-auto">
            {/* 상단 헤더 */}
            <div className="mb-0">
              <div className="px-6 py-1 flex items-center justify-between rounded-t-2xl" style={{backgroundColor: 'white', borderBottom: '1px solid #CCCCCC'}}>
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
              <div className="bg-white/95 backdrop-blur-md px-4 py-5 shadow-lg border border-gray-200 border-t-0 border-b-0">
                
                {/* 메시지 영역 */}
                <div>
                  {topCardMessage ? (
                    (() => {
                      const splitIdx = topCardMessage.indexOf('탄소');
                      if (splitIdx !== -1) {
                        const line1 = topCardMessage.slice(0, splitIdx).trim();
                        const line2 = topCardMessage.slice(splitIdx).trim();
                        return (
                          <div className="leading-snug">
                            <p className="text-base font-extrabold text-gray-900 tracking-tight">{line1}</p>
                            <p className="text-base font-extrabold mt-0.5 tracking-tight" style={{ color: '#00A851' }}>{line2}</p>
                            <div className="text-xs text-gray-400 mt-2">{todayString}</div>
                          </div>
                        );
                      }
                      return (
                        <div className="text-base font-extrabold" style={{ color: '#00A851' }}>{topCardMessage}</div>
                      );
                    })()
                  ) : (
                    <div className="text-sm text-gray-400">AI 그린렌즈로 환경을 지켜보세요</div>
                  )}
                </div>
              </div>
            </div>

            {cameraTab === 'solution' ? (
              <CameraCapture 
                ref={cameraCaptureRef}
                tab={cameraTab} 
                setTab={setCameraTab} 
                setTopCardMessage={setTopCardMessage}
                onRecycleAction={addRecycleAction}
                onCarbonSaved={addCarbonSaved}
              />
            ) : (
              <ReceiptOCRPanel 
                ref={receiptOCRPanelRef}
                tab={cameraTab} 
                setTab={setCameraTab} 
                setTopCardMessage={setTopCardMessage}
                onEcoPurchase={addEcoPurchase}
              />
            )}
          </div>
        </section>
      )}

      {mainTab === 'chart' && (
        <div className="min-h-screen bg-[#F7F9FB] pb-24">
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
          <div className="max-w-sm mx-auto px-4 pt-6 space-y-4">
            <p className="text-base font-semibold mt-2">안녕하세요, {nickname || '사용자'}님!</p>
            <p className="text-xs text-gray-500 -mt-2">이번 주 나의 환경 챌린지 현황이에요.</p>

            {/* 3-1) 이번 주 챌린지 진행률 카드 */}
            <div className="bg-white rounded-3xl shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M5 12l4-4M5 12l4 4" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <span className="text-sm font-semibold text-gray-800">이번 주 챌린지 진행률</span>
              </div>
              {(() => { const weeklyProgress = Math.min(100, Math.round(totalCarbonSaved * 3)); return (
                <>
                  <div className="text-3xl font-extrabold text-gray-900">{weeklyProgress}%</div>
                  <div className="mt-2 relative w-full h-2 bg-gray-100 rounded-full">
                    <div className="absolute h-2 bg-green-500 rounded-full" style={{ width: `${weeklyProgress}%` }} />
                  </div>
                </>
              ); })()}
            </div>

            {/* 3-2) 누적 포인트 카드 */}
            <div className="bg-white rounded-3xl shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#16a34a" strokeWidth="2"/></svg>
                </div>
                <span className="text-sm font-semibold text-gray-800">누적 포인트</span>
              </div>
              {(() => { const points = Math.round(totalEcoPurchases * 5); return (
                <div className="text-3xl font-extrabold text-gray-900">{points}P</div>
              ); })()}
            </div>

            {/* 3-3) 획득 배지 카드 */}
            <div className="bg-white rounded-3xl shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l3 5h6l-4.5 3.5 2.5 5-5-3.2-5 3.2 2.5-5L3 8h6l3-5z" stroke="#16a34a" strokeWidth="2" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-sm font-semibold text-gray-800">획득한 배지</span>
              </div>
              {(() => { const badges = Math.min(20, Math.floor((totalRecycleActions + totalEcoPurchases) / 3)); return (
                <>
                  <div className="text-3xl font-extrabold text-gray-900">{badges}개</div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 inline-block"/>
                    <span className="w-6 h-6 rounded-full bg-gray-100 inline-block"/>
                    <span className="w-6 h-6 rounded-full bg-gray-100 inline-block"/>
                  </div>
                </>
              ); })()}
            </div>

            {/* 4) 이번 주 개인 챌린지 리스트 */}
            <div className="space-y-3">
              {[
                { id: 1, title: '대중교통 3회 이용하기', desc: '버스/지하철 이용으로 탄소 절감', ratio: 0.67, progressText: '2/3회', status: '진행 중' },
                { id: 2, title: '텀블러 2회 사용하기', desc: '일회용 컵 대신 재사용 컵', ratio: 1.0, progressText: '완료', status: '완료' },
                { id: 3, title: '분리배출 3회 실천하기', desc: '올바른 재활용 분류', ratio: 0.4, progressText: 'D-2', status: '예정' },
              ].map(c => (
                <div key={c.id} className="bg-white rounded-3xl shadow-sm px-5 py-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12h16" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/><path d="M4 12l3.5-3.5M4 12l3.5 3.5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{c.title}</p>
                        <p className="text-xs text-gray-400">{c.desc}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full border border-green-400 text-green-500">{c.status}</span>
                  </div>
                  <div className="relative w-full h-2 bg-gray-100 rounded-full">
                    <div className="absolute h-2 bg-green-500 rounded-full" style={{ width: `${Math.round(c.ratio * 100)}%` }} />
                  </div>
                  <p className="text-right text-xs text-gray-500">{c.progressText}</p>
                </div>
              ))}
            </div>

            {/* 5) 오늘의 환경 팁 카드 */}
            <div className="bg-white rounded-3xl shadow-sm p-4">
              <div className="bg-gradient-to-r from-[#00C851] to-[#00E676] rounded-2xl px-4 py-3 text-white text-sm flex gap-2 items-start">
                <span>💡</span>
                <p>카메라로 재활용품을 스캔하면 올바른 분리배출 방법을 알려드려요!</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {mainTab === 'profile' && (
        <StatsPage />
      )}

      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex items-center justify-around">
            {/* 홈 */}
            <button
              onClick={() => setMainTab('home')}
              className={`flex flex-col items-center gap-1 ${mainTab === 'home' ? 'text-emerald-600' : 'text-gray-400'}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/>
              </svg>
            </button>

            {/* AI 그린렌즈 */}
            <button
              onClick={() => {
                if (mainTab === 'camera') {
                  // 이미 카메라 탭에 있으면 사진 촬영 또는 OCR 실행
                  if (cameraTab === 'solution' && cameraCaptureRef.current) {
                    cameraCaptureRef.current.takePhoto();
                  } else if (cameraTab === 'report' && receiptOCRPanelRef.current) {
                    receiptOCRPanelRef.current.takeAndRecognize();
                  }
                } else {
                  // 다른 탭에 있으면 카메라 탭으로 전환
                  setMainTab('camera');
                }
              }}
              className={`flex flex-col items-center gap-1 ${mainTab === 'camera' ? 'text-emerald-600' : 'text-gray-400'}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>

            {/* 차트 */}
            <button
              onClick={() => setMainTab('chart')}
              className={`flex flex-col items-center gap-1 ${mainTab === 'chart' ? 'text-emerald-600' : 'text-gray-400'}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" fill="currentColor"/>
              </svg>
            </button>

            {/* 프로필 */}
            <button
              onClick={() => setMainTab('profile')}
              className={`flex flex-col items-center gap-1 ${mainTab === 'profile' ? 'text-emerald-600' : 'text-gray-400'}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </main>
  );
}
