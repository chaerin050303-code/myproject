"use client";

import { useState, useRef } from "react";

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // 🔹 카메라 시작
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // 후면 카메라
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      alert("카메라 접근 실패! (iOS는 Safari를 사용해야 합니다)");
      console.error(err);
    }
  };

  // 🔹 사진 찍기
  const takePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setPhoto(dataUrl);
  };

  // 🔹 카메라 종료
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsCameraOpen(false);
    }
  };

  // 🔹 (선택) AI 분석 함수
  const analyzeImage = async () => {
    if (!photo) return;

    // 🔸 Google Vision API 사용 시
    const apiKey = "AIzaSyABESJ5mPEPShdouBp3h7zSBgELp7njkWg"; // 여기에 나중에 API키 넣기
    const res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: photo.split(",")[1] },
              features: [{ type: "LABEL_DETECTION", maxResults: 3 }],
            },
          ],
        }),
      }
    );
    const data = await res.json();
    const labels = data.responses[0].labelAnnotations.map((x: any) => x.description);
    console.log("Detected:", labels);

    if (labels.includes("Plastic bottle") || labels.includes("PET")) {
      alert("🧴 PET병은 라벨을 제거하고, 뚜껑을 분리 후 깨끗이 헹궈서 배출하세요!");
    } else if (labels.includes("Paper")) {
      alert("📄 종이는 테이프나 스테이플러를 제거하고 배출하세요!");
    } else {
      alert("이 물체는 분리수거 항목으로 인식되지 않았어요 😥");
    }
  };

  return (
    <div className="text-center my-8">
      <h2 className="text-xl font-bold text-emerald-700 mb-4">♻️ AI 분리수거 렌즈</h2>

      {!isCameraOpen && !photo && (
        <button
          onClick={startCamera}
          className="bg-emerald-600 text-white px-5 py-3 rounded-full shadow hover:bg-emerald-700"
        >
          카메라 열기
        </button>
      )}

      {isCameraOpen && (
        <div className="flex flex-col items-center">
          <video ref={videoRef} autoPlay playsInline className="rounded-xl border w-full max-w-sm"></video>
          <canvas ref={canvasRef} width="400" height="300" className="hidden"></canvas>

          <div className="flex gap-3 mt-4">
            <button
              onClick={takePhoto}
              className="bg-blue-500 text-white px-4 py-2 rounded-full shadow"
            >
              사진 찍기
            </button>
            <button
              onClick={stopCamera}
              className="bg-gray-400 text-white px-4 py-2 rounded-full shadow"
            >
              종료
            </button>
          </div>
        </div>
      )}

      {photo && (
        <div className="mt-6">
          <img src={photo} alt="Captured" className="rounded-xl shadow-lg max-w-xs mx-auto" />
          <div className="flex justify-center gap-3 mt-3">
            <button
              onClick={analyzeImage}
              className="bg-emerald-600 text-white px-4 py-2 rounded-full"
            >
              AI 분석
            </button>
            <button
              onClick={() => setPhoto(null)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full"
            >
              다시 찍기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
