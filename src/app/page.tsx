'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// ✅ CameraCapture는 브라우저에서만 로드 (SSR 비활성)
const CameraCapture = dynamic(() => import('./components/CameraCapture'), {
  ssr: false,
});

// 🔹 Firebase 설정
const firebaseConfig = {
  apiKey: 'AIzaSyArYCKEK05hjmiwvqbMq5JuEGG1aiMFRdY',
  authDomain: 'ste-final.firebaseapp.com',
  projectId: 'ste-final',
  storageBucket: 'ste-final.firebasestorage.app',
  messagingSenderId: '940484009989',
  appId: '1:940484009989:web:85d243d96fbbc31522fc6c',
  measurementId: 'G-G4057KG25N',
};

// 🔹 Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function Home() {
  const [user, setUser] = useState<any>(null);

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-green-50">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-extrabold text-emerald-700">CARBONEX</div>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <a className="hover:text-emerald-700" href="#">About</a>
            <a className="hover:text-emerald-700" href="#">Services</a>
            <a className="hover:text-emerald-700" href="#">Projects</a>
            <a className="hover:text-emerald-700" href="#">Impact</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <button
              onClick={handleLogin}
              className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm shadow"
            >
              Google 로그인
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src={user?.photoURL || ''}
                alt="profile"
                className="w-9 h-9 rounded-full border"
              />
              <span className="text-sm text-gray-700 hidden sm:inline">
                {user?.displayName || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
              >
                로그아웃
              </button>
            </div>
          )}
          <a
            className="ml-2 inline-block bg-white px-4 py-2 rounded-full text-sm shadow hover:shadow-md"
            href="#"
          >
            Contact
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl">
          {/* Curved top SVG */}
          <div className="absolute left-0 right-0 -top-36 pointer-events-none">
            <svg viewBox="0 0 1200 300" className="w-full h-72">
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stopColor="#FDE68A" />
                  <stop offset="1" stopColor="#86efac" />
                </linearGradient>
              </defs>
              <path
                d="M0,200 C200,120 400,40 600,80 C800,120 1000,200 1200,160 L1200,0 L0,0 Z"
                fill="url(#g1)"
                opacity="0.95"
              />
            </svg>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center px-8 py-20 relative z-10">
            {/* Left content */}
            <div className="pt-16 md:pt-0">
              <h2 className="text-sm uppercase tracking-widest text-emerald-700">WE ARE</h2>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mt-3">
                Solving global problems
              </h1>
              <p className="mt-4 text-gray-600 max-w-xl">
                Carbonex는 비즈니스와 사회가 자연과 조화를 이루며 지속 가능한 미래를 만들도록 돕습니다.
                AI 기반 탄소 감축 플랜으로 영향력있는 변화를 시작하세요.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <a
                  href="#"
                  className="bg-emerald-600 text-white px-5 py-3 rounded-full shadow hover:bg-emerald-700"
                >
                  Schedule a consultation
                </a>
                <a href="#" className="text-sm text-gray-700 hover:underline">
                  Learn more
                </a>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-xs">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700">5.7</div>
                  <div className="text-xs text-gray-500">CO2 Tons Prevented</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700">68</div>
                  <div className="text-xs text-gray-500">Products Footprinted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700">13</div>
                  <div className="text-xs text-gray-500">Active Projects</div>
                </div>
              </div>
            </div>

            {/* Right illustration */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <svg viewBox="0 0 600 420" className="w-full">
                  <defs>
                    <linearGradient id="g-sky" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#fde68a" />
                      <stop offset="1" stopColor="#d1fae5" />
                    </linearGradient>
                    <linearGradient id="g-hill" x1="0" x2="1">
                      <stop offset="0" stopColor="#a7f3d0" />
                      <stop offset="1" stopColor="#4ade80" />
                    </linearGradient>
                  </defs>

                  <rect x="0" y="0" width="600" height="420" fill="url(#g-sky)" rx="24" />
                  <g transform="translate(0,60)">
                    <path
                      d="M0 220 C100 140 200 120 300 160 C400 200 500 160 600 180 L600 260 L0 260 Z"
                      fill="url(#g-hill)"
                    />
                    <path
                      d="M0 240 C140 180 220 200 360 220 C460 230 540 200 600 220 L600 300 L0 300 Z"
                      fill="#10b981"
                      opacity="0.85"
                    />
                  </g>

                  <g transform="translate(70,200) scale(0.9)">
                    <rect x="360" y="70" width="40" height="90" fill="#334155" />
                    <rect x="320" y="90" width="30" height="70" fill="#475569" />
                    <rect x="280" y="110" width="40" height="50" fill="#334155" />
                    <rect x="240" y="130" width="60" height="30" fill="#475569" />
                    <rect x="200" y="140" width="40" height="20" fill="#334155" />
                    <rect x="360" y="40" width="18" height="40" fill="#111827" />
                    <path d="M360 40 C350 20 370 20 360 0" fill="#9ca3af" opacity="0.9" />
                    <g opacity="0.18" fill="#111827">
                      <ellipse cx="388" cy="22" rx="18" ry="6" />
                      <ellipse cx="404" cy="6" rx="22" ry="8" />
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom white card area */}
          <div className="border-t border-gray-100 px-8 py-6 bg-white">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">Join our community building sustainable futures.</div>
              <div className="flex gap-3">
                <a className="text-sm text-emerald-700 font-semibold" href="#">
                  Schedule
                </a>
                <a className="text-sm text-gray-500" href="#">
                  Impact Projects
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI 분리수거 렌즈 섹션 */}
      <section id="lens" className="max-w-6xl mx-auto px-6 mt-12">
        <h2 className="text-xl font-bold text-slate-900">AI 분리수거 렌즈</h2>
        <p className="text-sm text-gray-600 mt-1">
          iOS는 Safari에서만 카메라 접근이 됩니다. (첫 실행 시 카메라 허용 필요)
        </p>
        <div className="mt-4">
          <CameraCapture />
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 text-sm text-gray-600">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>© {new Date().getFullYear()} CARBONEX. All rights reserved.</div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a className="hover:underline" href="#">Privacy</a>
            <a className="hover:underline" href="#">Terms</a>
            <a className="hover:underline" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
