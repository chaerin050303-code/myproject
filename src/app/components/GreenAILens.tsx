"use client";

import { useState } from "react";
import CameraCapture from "./CameraCapture";            // ← 변경: CameraCapture에 탭 prop 전달
import ReceiptOCRPanel from "./ReceiptOCRPanel";        // ← 변경: ReceiptOCRPanel에 탭 prop 전달

export default function GreenAILens() {
  const [tab, setTab] = useState<"solution" | "report">("solution");

  return (
    <section className="max-w-6xl mx-auto px-0 py-6 relative">
      {/* DEV banner - remove after verification */}
      <div className="fixed right-6 top-6 z-50">
        <div className="bg-rose-500 text-white px-3 py-1 rounded-lg shadow">DEV BUILD — updated</div>
      </div>
      {/* Top header (logo, title, date) */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <img 
            src="/images/logo.png?v=2" 
            alt="Logo"
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">그린 AI 렌즈</h1>
            <div className="text-sm text-gray-500">리사이클 솔루션 / 그린 리포트 탭을 선택하세요.</div>
          </div>
        </div>
        <div className="text-sm text-gray-500">9월 25일 (목)</div>
      </div>

      {/* content area - pass tab handlers down so children can overlay the tabs on top of camera */}
      <div className="mt-3 bg-transparent">
        {tab === "solution" ? (
          <CameraCapture tab={tab} setTab={setTab} />
        ) : (
          <ReceiptOCRPanel tab={tab} setTab={setTab} />
        )}
      </div>

  {/* bottom fixed navigation (mobile-style) */}
      <nav className="fixed left-0 right-0 bottom-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="max-w-3xl w-full px-6">
          <div className="relative">
            <div className="h-20 bg-transparent" />
            <div className="absolute left-0 right-0 -top-6 flex items-center justify-between pointer-events-auto">
              {/* left icons */}
              <div className="flex items-center gap-6 ml-2">
                <button className="w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center"> {/* home */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11.5z" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center"> {/* chat */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              {/* center camera button */}
              <div className="flex items-center justify-center -translate-y-2">
                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center shadow-2xl border-4 border-white">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7C3 5.89543 3.89543 5 5 5H7.172L8.586 3.586C8.851 3.321 9.213 3.18 9.59 3.196L14.41 3.196C14.787 3.18 15.149 3.321 15.414 3.586L16.828 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" fill="#10B981" />
                    <circle cx="12" cy="12" r="3" fill="#064E3B" />
                  </svg>
                </div>
              </div>

              {/* right icons */}
              <div className="flex items-center gap-6 mr-2">
                <button className="w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center"> {/* stats */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20V10" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 20V4" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 20v-6" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center"> {/* profile */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </section>
  );
}
