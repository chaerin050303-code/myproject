"use client";

import { useState, useEffect } from "react";

interface UserStats {
  nickname: string;
  totalCarbonSaved: number;
  totalEcoPurchases: number;
  totalRecycleActions: number;
}

const STORAGE_KEY = "greenai_user_stats";

const getInitialStats = (): UserStats => {
  if (typeof window === "undefined") {
    return {
      nickname: "",
      totalCarbonSaved: 0,
      totalEcoPurchases: 0,
      totalRecycleActions: 0,
    };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {
        nickname: "",
        totalCarbonSaved: 0,
        totalEcoPurchases: 0,
        totalRecycleActions: 0,
      };
    }
  }

  return {
    nickname: "",
    totalCarbonSaved: 0,
    totalEcoPurchases: 0,
    totalRecycleActions: 0,
  };
};

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>(getInitialStats);

  // Sync to localStorage whenever stats change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }
  }, [stats]);

  const setNickname = (nickname: string) => {
    setStats((prev) => ({ ...prev, nickname }));
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
