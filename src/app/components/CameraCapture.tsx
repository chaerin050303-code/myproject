'use client';

import { useEffect, useRef, useState } from 'react';

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // iOS 친화: 백카메라 우선 → 실패 시 폴백
  const openCamera = async () => {
    setErrMsg(null);
    setPhoto(null);

    try {
      // 1) 백카메라 "정확히" 시도
      const strict: MediaStreamConstraints = {
        video: { facingMode: { exact: 'environment' } as any },
        audio: false,
      };

      let s = await navigator.mediaDevices.getUserMedia(strict).catch(async () => {
        // 2) 백카메라 "선호" 시도
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      });

      const v = videoRef.current!;
      v.srcObject = s;
      // iOS Safari 필수 속성
      v.setAttribute('playsinline', 'true');
      v.autoplay = true;
      v.muted = true;

      await v.play().catch(() => {}); // iOS에서 play() 예외 무시

      setStream(s);
    } catch (e: any) {
      const name = e?.name || '';
      if (name === 'NotAllowedError') {
        setErrMsg('카메라 권한이 거부되었어요. Safari → 웹사이트 설정에서 이 도메인의 카메라를 허용해 주세요.');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setErrMsg('사용 가능한 카메라를 찾지 못했어요. 전/후면 전환 또는 폴백을 시도해 보세요.');
      } else {
        setErrMsg('카메라를 열 수 없어요. ' + (e?.message ?? String(e)));
      }
    }
  };

  const closeCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  const takePhoto = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 720;
    c.width = w;
    c.height = h;

    const ctx = c.getContext('2d')!;
    ctx.drawImage(v, 0, 0, w, h);
    const url = c.toDataURL('image/jpeg', 0.9);
    setPhoto(url);
  };

  useEffect(() => {
    return () => closeCamera(); // 언마운트 시 정리
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-0 py-6">
      <div className="flex gap-3 mb-4">
        {!stream ? (
          <button
            onClick={openCamera}
            className="bg-emerald-600 text-white px-4 py-2 rounded"
          >
            카메라 열기
          </button>
        ) : (
          <>
            <button onClick={takePhoto} className="bg-emerald-600 text-white px-4 py-2 rounded">
              사진 찍기
            </button>
            <button onClick={closeCamera} className="bg-gray-200 px-4 py-2 rounded">
              닫기
            </button>
          </>
        )}
      </div>

      {errMsg && <p className="text-red-600 mb-3 text-sm">{errMsg}</p>}

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="bg-black/5 rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-72 object-contain bg-black"
          />
        </div>

        <div>
          <canvas ref={canvasRef} className="hidden" />
          {photo ? (
            <img
              src={photo}
              alt="captured"
              className="w-full h-72 object-contain rounded-xl border"
            />
          ) : (
            <div className="w-full h-72 rounded-xl border flex items-center justify-center text-gray-400">
              찍은 사진이 여기에 표시돼요
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
