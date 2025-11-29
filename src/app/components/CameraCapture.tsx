"use client";

import { useEffect, useRef, useState, Dispatch, SetStateAction, forwardRef, useImperativeHandle } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const CameraCapture = forwardRef<
  { takePhoto: () => void },
  {
    tab: 'solution' | 'report';
    setTab: Dispatch<SetStateAction<'solution' | 'report'>>;
    setTopCardMessage: Dispatch<SetStateAction<string>>;
    onRecycleAction?: () => void;
    onCarbonSaved?: (amount: number) => void;
  }
>(({ tab, setTab, setTopCardMessage, onRecycleAction, onCarbonSaved }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const modelRef = useRef<any>(null);
  const detectionRunningRef = useRef<boolean>(false);
  const frameCounterRef = useRef<number>(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  // show overlay only after user presses the camera button to take a photo
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [detectedObject, setDetectedObject] = useState<string>('');
  const [modelReady, setModelReady] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [liveOverlay, setLiveOverlay] = useState<boolean>(false);
  const liveOverlayTimeoutRef = useRef<number | null>(null);
  const [showBottleInfo, setShowBottleInfo] = useState<boolean>(false);
  const bottleDetectionStartRef = useRef<number | null>(null);

  // takePhoto 함수를 부모 컴포넌트에 노출
  useImperativeHandle(ref, () => ({
    takePhoto,
  }));

  // iOS 친화: 백카메라 우선 → 실패 시 폴백
  const openCamera = async () => {
    setErrMsg(null);
    setPhoto(null);
    setShowOverlay(false);
    setDetectedObject('');

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
      // Start detection loop after stream is ready
      if (modelRef.current) {
        setTimeout(() => runDetectionLoop(), 500);
      }
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
    setShowOverlay(false);
    setDetectedObject('');
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
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
    // show result overlay after taking a photo
    setShowOverlay(true);
  };

  // Live detection loop
  const runDetectionLoop = () => {
    if (!stream || !modelRef.current || !videoRef.current || !detectionCanvasRef.current) return;
    if (detectionRunningRef.current) return; // already running
    detectionRunningRef.current = true;

    const v = videoRef.current;
    const canvas = detectionCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const runLoop = async () => {
      if (!stream || !v.videoWidth) {
        rafIdRef.current = requestAnimationFrame(runLoop);
        return;
      }

      const w = v.videoWidth;
      const h = v.videoHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

  // Clear then draw video frame to canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(v, 0, 0, w, h);

      try {
        // Run COCO-SSD detection
        const predictions = await modelRef.current.detect(canvas);

        // frame sampling logs to avoid flooding console
        frameCounterRef.current = (frameCounterRef.current + 1) % 30;
        if (predictions.length > 0 || frameCounterRef.current === 0) {
          console.debug('COCO predictions:', predictions.map((p: any) => ({ class: p.class, score: p.score })) );
        }

        // Draw bounding boxes + label background
        ctx.lineWidth = 3;
        ctx.font = '16px Arial';
        predictions.forEach((p: any) => {
          const [x, y, width, height] = p.bbox;
          ctx.strokeStyle = '#22c55e';
          ctx.strokeRect(x, y, width, height);

          const label = `${p.class} ${(p.score * 100).toFixed(0)}%`;
          const padding = 6;
          const textWidth = ctx.measureText(label).width + padding * 2;
          const textHeight = 18;
          const lx = x;
          const ly = y - textHeight - 4;

          // label background
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(lx, ly, textWidth, textHeight + 4);

          // label text
          ctx.fillStyle = '#fff';
          ctx.fillText(label, lx + padding, ly + textHeight - 4 + 2);
        });

        // Get best detection and show live overlay
        if (predictions.length > 0) {
          const best = predictions.sort((a: any, b: any) => b.score - a.score)[0];
          // Map some common classes to friendly Korean labels
          const classMap: Record<string, string> = {
            bottle: '페트병 - 생수',
            cup: '컵',
            person: '사람',
            cell_phone: '휴대폰',
            laptop: '노트북',
          };
          const labelText = classMap[best.class] || best.class;
          setDetectedObject(`${labelText} (${(best.score * 100).toFixed(0)}%)`);
          setLiveOverlay(true);
          
          // Check if bottle detected for 3+ seconds
          if (best.class === 'bottle') {
            if (!bottleDetectionStartRef.current) {
              bottleDetectionStartRef.current = Date.now();
              console.log('🍾 Bottle detection started!');
            } else {
              const elapsed = Date.now() - bottleDetectionStartRef.current;
              console.log(`🍾 Bottle detected for ${(elapsed/1000).toFixed(1)}s`);
              if (elapsed >= 3000 && !showBottleInfo) {
                console.log('✅ Showing bottle info card!');
                setShowBottleInfo(true);
                setTopCardMessage('오늘 분리배출을 해서 탄소 0.2kgCO₂를 감축했어요!');
                // Update stats
                if (onRecycleAction) onRecycleAction();
                if (onCarbonSaved) onCarbonSaved(0.2);
              }
            }
          } else {
            if (bottleDetectionStartRef.current) {
              console.log('❌ Bottle detection stopped');
            }
            bottleDetectionStartRef.current = null;
            setShowBottleInfo(false);
            setTopCardMessage('');
          }
          
          // reset hide timer
          if (liveOverlayTimeoutRef.current) {
            clearTimeout(liveOverlayTimeoutRef.current as any);
          }
          liveOverlayTimeoutRef.current = window.setTimeout(() => {
            setLiveOverlay(false);
          }, 1500);
        } else {
          bottleDetectionStartRef.current = null;
          setShowBottleInfo(false);
        }
      } catch (e: any) {
        console.error('Detection error:', e);
      }

      rafIdRef.current = requestAnimationFrame(runLoop);
    };

    runLoop();
  };

  // Start detection automatically when both stream and model are ready
  useEffect(() => {
    if (stream && modelRef.current && !detectionRunningRef.current) {
      // small delay to allow video dimensions to stabilize
      setTimeout(() => {
        runDetectionLoop();
      }, 300);
    }

    return () => {
      // stop detection when stream is gone
      if (!stream && rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
        detectionRunningRef.current = false;
      }
    };
  }, [stream, modelReady]);

  useEffect(() => {
    let mounted = true;

    const loadModel = async () => {
      try {
        // prefer webgl backend when available
        try {
          if (tf.getBackend() !== 'webgl') await tf.setBackend('webgl');
        } catch (e) {
          console.warn('WebGL backend not available, using default backend');
        }

        if ((window as any).__coco_loaded && (window as any).__coco_model) {
          modelRef.current = (window as any).__coco_model;
        } else {
          const model = await (cocoSsd as any).load({ base: 'lite_mobilenet_v2' });
          modelRef.current = model;
          (window as any).__coco_model = model;
          (window as any).__coco_loaded = true;
        }

        if (mounted) setModelReady(true);
      } catch (e: any) {
        console.error('Model load error:', e);
        setModelError(String(e?.message || e));
      }
    };

    loadModel();

    return () => {
      mounted = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Small debug effect: once model becomes ready, draw a visible red rectangle on the detection canvas
  useEffect(() => {
    if (!modelReady) return;
    const canvas = detectionCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // draw a transient debug rectangle so users can see the overlay
    const drawDebug = () => {
      const w = canvas.width || 640;
      const h = canvas.height || 480;
      ctx.save();
      ctx.fillStyle = 'rgba(255,0,0,0.35)';
      ctx.fillRect(12, 12, Math.min(200, w - 24), Math.min(120, h - 24));
      ctx.restore();
      // clear after 900ms
      const t = setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 900);
      return t;
    };

    const timeoutId = drawDebug();
    return () => {
      clearTimeout(timeoutId as any);
    };
  }, [modelReady]);

  useEffect(() => {
    // Auto-open camera on mount
    openCamera();
    return () => closeCamera(); // 언마운트 시 정리
  }, []);

  return (
    <section className="bg-white">
      {errMsg && <p className="text-red-600 mb-3 text-sm">{errMsg}</p>}

      {/* Single camera view - removed right photo preview */}
      <div>
        <div className="bg-white rounded-b-xl overflow-hidden relative">
          {/* Detection canvas overlaid on video */}
          <canvas 
            ref={detectionCanvasRef} 
            className="absolute inset-0 w-full h-full"
            style={{ display: stream ? 'block' : 'none', zIndex: 30, pointerEvents: 'none' }}
          />

          {/* 탭 - 카메라 하단에 하얀 글씨로 배치 */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-40 pointer-events-auto">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setTab('solution')}
                className="relative flex flex-col items-center gap-1"
              >
                <span className="text-white text-xs font-medium drop-shadow-lg">리사이클 솔루션</span>
                {tab === 'solution' && (
                  <div className="text-white text-lg drop-shadow-lg">▲</div>
                )}
              </button>
              <button
                onClick={() => setTab('report')}
                className="relative flex flex-col items-center gap-1"
              >
                <span className="text-white text-xs font-medium drop-shadow-lg">그린 리포트</span>
                {tab === 'report' && (
                  <div className="text-white text-lg drop-shadow-lg">▲</div>
                )}
              </button>
            </div>
          </div>

          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-[560px] md:h-[520px] lg:h-[600px] object-cover bg-black"
          />

          {/* Bottle info card - shows when bottle detected for 3+ seconds */}
          {showBottleInfo && (
            <div className="absolute left-6 right-6 bottom-6 bg-white/98 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-gray-100 z-50">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="font-extrabold text-lg text-slate-900">페트병 - 생수</div>
                  <div className="text-sm text-gray-600 mt-1">내용물을 비우고 라벨을 제거한 뒤, 병을 찌그러뜨려 뚜껑을 닫아 투명 페트병 전용 수거함에 배출하세요.</div>
                </div>
                <div className="flex-none">
                  <div className="text-xs text-gray-400">분리수거</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </section>
  );
});

CameraCapture.displayName = 'CameraCapture';

export default CameraCapture;
