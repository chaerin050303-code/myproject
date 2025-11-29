"use client";

import { useState, useEffect } from "react";

interface NicknameModalProps {
  isOpen: boolean;
  onSubmit: (nickname: string) => void;
  currentNickname?: string;
}

export default function NicknameModal({ isOpen, onSubmit, currentNickname = "" }: NicknameModalProps) {
  const [nickname, setNickname] = useState(currentNickname);

  useEffect(() => {
    setNickname(currentNickname);
  }, [currentNickname]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onSubmit(nickname.trim());
      setNickname("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#22c55e"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentNickname ? "닉네임 변경" : "환영합니다!"}
          </h2>
          <p className="text-sm text-gray-500">
            {currentNickname ? "새로운 닉네임을 입력해 주세요" : "닉네임을 입력해 주세요"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 입력"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-center text-lg font-medium transition-colors"
            autoFocus
            maxLength={20}
          />

          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
          >
            확인
          </button>
        </form>
      </div>
    </div>
  );
}
