"use client";

import { useEffect, useRef, useState, Dispatch, SetStateAction, forwardRef, useImperativeHandle } from "react";
import { createWorker } from "tesseract.js";

type BannerType = "success" | "info" | "warn" | "none";

const ReceiptOCRPanel = forwardRef<
  { takeAndRecognize: () => void },
  {
    tab: "solution" | "report";
    setTab: Dispatch<SetStateAction<"solution" | "report">>;
    setTopCardMessage: Dispatch<SetStateAction<string>>;
    onEcoPurchase?: () => void;
  }
>(({ tab, setTab, setTopCardMessage, onEcoPurchase }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [ocrText, setOcrText] = useState("");
  const [showTumblerInfo, setShowTumblerInfo] = useState<boolean>(false);

  const [banner, setBanner] = useState<{ type: BannerType; msg: string }>({ type: "none", msg: "" });
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // takeAndRecognize 함수를 부모 컴포넌트에 노출
  useImperativeHandle(ref, () => ({
    takeAndRecognize,
  }));

  // ── Camera (이 탭에서만 관리)
  const openCamera = async () => {
    setErrMsg(null); setPhoto(null); setOcrText("");
    try {
      const s =
        (await navigator.mediaDevices
          .getUserMedia({ video: { facingMode: { exact: "environment" } as any }, audio: false })
          .catch(() =>
            navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
          )) as MediaStream;

      const v = videoRef.current!;
      v.srcObject = s; v.setAttribute("playsinline", "true"); v.autoplay = true; v.muted = true;
      await v.play().catch(() => {});
      setStream(s);
    } catch (e: any) {
      setErrMsg("카메라를 열 수 없어요. " + (e?.message ?? String(e)));
    }
  };
  const closeCamera = () => { stream?.getTracks().forEach(t => t.stop()); setStream(null); };

  useEffect(() => {
    // Auto-open camera on mount
    openCamera();
    return () => closeCamera();
  }, []);

  // ── Tesseract
  const ensureWorker = async () => {
    if (workerRef.current) return workerRef.current;
    const w = await createWorker("kor+eng", 1, {
      langPath: "https://tessdata.projectnaptha.com/4.0.0_best",
      logger: (m) => { if (m.status === "recognizing text" && m.progress != null) setProgress(Math.round(m.progress * 100)); },
    });
    workerRef.current = w; return w;
  };

  const preprocess = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const img = ctx.getImageData(0, 0, w, h); const d = img.data;
    const contrast = 1.15, brightness = 10;
    for (let i = 0; i < d.length; i += 4) {
      const gray = d[i]*0.299 + d[i+1]*0.587 + d[i+2]*0.114;
      let v = gray*contrast + brightness; v = v<0?0: v>255?255:v;
      d[i]=d[i+1]=d[i+2]=v;
    }
    ctx.putImageData(img,0,0);
  };

  const detectTumbler = (text: string) => {
    const t = text.toLowerCase().replace(/\s+/g,"");
    const hasWord = /(텀블러|텀브러|텀블라|tumbler|tumblr|다회용)/i.test(t);
    const hasAct  = /(사용|할인|적립|참여|인증)/i.test(text);
    return hasWord && hasAct;
  };
  const detectFivePoints = (text: string) => {
    const t = text.replace(/\s+/g,"");
    return /(5\s*(포인트|point|points|점|p))|((포인트|point|points|점|p)\s*5)|(\+5)/i.test(t);
  };

  const showBanner = (type: BannerType, msg: string) => {
    setBanner({ type, msg });
    setTimeout(() => setBanner({ type: "none", msg: "" }), 2200);
  };

  const takeAndRecognize = async () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    const w = v.videoWidth || 1280, h = v.videoHeight || 720;
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h); ctx.drawImage(v,0,0,w,h);
    preprocess(ctx,w,h);
    const url = c.toDataURL("image/jpeg",0.9); setPhoto(url);

    setProgress(0); setOcrText("인식 중…");
    const worker = await ensureWorker();
    const { data } = await worker.recognize(c);
    const txt = data.text || ""; setOcrText(txt);

    const tumbler = detectTumbler(txt); const has5 = detectFivePoints(txt);
    if (tumbler && has5) { 
      setShowTumblerInfo(true); 
      setTopCardMessage('오늘 텀블러를 사용해서 나무 1그루를 살렸어요!'); 
      showBanner("success","텀블러 사용 ! 5P가 적립되었습니다"); 
      if (onEcoPurchase) onEcoPurchase();
      return; 
    }
    if (tumbler) { 
      setShowTumblerInfo(true); 
      setTopCardMessage('오늘 텀블러를 사용해서 나무 1그루를 살렸어요!'); 
      showBanner("info","텀블러 사용 기록 감지 (포인트 문구 미확인)"); 
      if (onEcoPurchase) onEcoPurchase();
      return; 
    }
    if (has5)           { showBanner("success","5P가 적립되었습니다"); return; }
    setTopCardMessage('');
    showBanner("warn","해당 문구 없음");
  };

  const Banner = () => {
    if (banner.type === "none") return null;
    const color = banner.type==="success" ? "#10b981" : banner.type==="info" ? "#3b82f6" : "#f59e0b";
    return (
      <div className="fixed left-1/2 top-5 -translate-x-1/2 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2"
           style={{background: color}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" fill="transparent"/>
          <path d="M7 12l3 3 7-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <b>{banner.msg}</b>
      </div>
    );
  };

  return (
    <div className="bg-white">
      {errMsg && <p className="text-red-600 text-sm px-4">{errMsg}</p>}

      {/* Single camera view - removed right photo preview */}
      <div>
        <div className="bg-white rounded-b-xl overflow-hidden relative">
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

          <video ref={videoRef} playsInline muted autoPlay className="w-full h-[560px] md:h-[520px] lg:h-[600px] object-cover bg-black" />

          {/* Tumbler detection card - shows when tumbler keyword found in OCR */}
          {ocrText && detectTumbler(ocrText) && (
            <div className="absolute left-6 right-6 bottom-6 z-50 bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-none w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center border">
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-emerald-700 font-bold">N</div>
                </div>
                <div className="flex-1">
                  <div className="font-extrabold text-lg text-slate-900">카페 - 텀블러 사용</div>
                  <div className="text-sm text-gray-700 mt-1 leading-relaxed">
                    카페에서 아이스아메리카노를 구매하실 때<br/>텀블러를 사용하셨네요 🎉<br/>
                    세디얼 10 포인트가 적립되었습니다!
                  </div>
                </div>
                <div className="flex-none text-xs text-gray-400 self-start">9월 25일</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {ocrText && (
        <pre className="mt-2 p-3 bg-gray-50 border rounded-xl whitespace-pre-wrap text-sm max-w-2xl mx-auto">{ocrText}</pre>
      )}
      <Banner />
    </div>
  );
});

ReceiptOCRPanel.displayName = 'ReceiptOCRPanel';

export default ReceiptOCRPanel;
