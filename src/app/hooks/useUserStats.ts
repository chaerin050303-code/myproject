"use client";

import { useState, useEffect } from "react";

interface UserStats {
  nickname: string;
  totalCarbonSaved: number;
  totalEcoPurchases: number;
  totalRecycleActions: number;
}

const NICKNAME_KEY = "greenai_current_nickname";

const getStatsKey = (nickname: string) => `greenai_user_stats_${nickname}`;

const getInitialNickname = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NICKNAME_KEY) || "";
};

const getStatsForNickname = (nickname: string): Omit<UserStats, "nickname"> => {
  if (typeof window === "undefined" || !nickname) {
    return {
      totalCarbonSaved: 0,
      totalEcoPurchases: 0,
      totalRecycleActions: 0,
    };
  }

  const stored = localStorage.getItem(getStatsKey(nickname));
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        totalCarbonSaved: parsed.totalCarbonSaved || 0,
        totalEcoPurchases: parsed.totalEcoPurchases || 0,
        totalRecycleActions: parsed.totalRecycleActions || 0,
      };
    } catch {
      return {
        totalCarbonSaved: 0,
        totalEcoPurchases: 0,
        totalRecycleActions: 0,
      };
    }
  }

  return {
    totalCarbonSaved: 0,
    totalEcoPurchases: 0,
    totalRecycleActions: 0,
  };
};

export function useUserStats() {
  const [currentNickname, setCurrentNickname] = useState<string>(getInitialNickname);
  const [stats, setStats] = useState<UserStats>(() => {
    const nickname = getInitialNickname();
    return {
      nickname,
      ...getStatsForNickname(nickname),
    };
  });

  // Sync current nickname to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && currentNickname) {
      localStorage.setItem(NICKNAME_KEY, currentNickname);
    }
  }, [currentNickname]);

  // Sync stats to localStorage for current nickname
  useEffect(() => {
    if (typeof window !== "undefined" && stats.nickname) {
      const statsToSave = {
        totalCarbonSaved: stats.totalCarbonSaved,
        totalEcoPurchases: stats.totalEcoPurchases,
        totalRecycleActions: stats.totalRecycleActions,
      };
      localStorage.setItem(getStatsKey(stats.nickname), JSON.stringify(statsToSave));
    }
  }, [stats]);

  const setNickname = (nickname: string) => {
    setCurrentNickname(nickname);
    // Load stats for this nickname
    const nicknameStats = getStatsForNickname(nickname);
    setStats({
      nickname,
      ...nicknameStats,
    });
  };

  const addCarbonSaved = (amount: number) => {
    setStats((prev) => ({
      ...prev,
      totalCarbonSaved: prev.totalCarbonSaved + amount,
    }));
  };

  const addEcoPurchase = () => {
    setStats((prev) => ({
      ...prev,
      totalEcoPurchases: prev.totalEcoPurchases + 1,
    }));
  };

  const addRecycleAction = () => {
    setStats((prev) => ({
      ...prev,
      totalRecycleActions: prev.totalRecycleActions + 1,
    }));
  };

  return {
    nickname: stats.nickname,
    totalCarbonSaved: stats.totalCarbonSaved,
    totalEcoPurchases: stats.totalEcoPurchases,
    totalRecycleActions: stats.totalRecycleActions,
    setNickname,
    addCarbonSaved,
    addEcoPurchase,
    addRecycleAction,
  };
}
