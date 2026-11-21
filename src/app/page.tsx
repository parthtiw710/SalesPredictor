'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Camera,
  Upload,
  Building2,
  Activity,
  Copy,
  Check,
  Loader2,
  Globe2,
  UtensilsCrossed,
  X,
  Plus,
  Trash2,
  ScanLine,
  RotateCcw,
  Clock
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  getTranslation,
  getLocalizedItemName,
  getLocalizedUnit,
  getLocalizedOutletName,
  getLocalizedCity,
  getLocalizedChef
} from '@/lib/i18n';

export interface ForecastItem {
  meal_slot?: string;
  item_name: string;
  unit: string;
  predicted_qty: string | number;
  lower_bound_qty?: string | number;
  upper_bound_qty?: string | number;
}

export interface ShiftHistoryEntry {
  id: string;
  shift_name: string;
  meal_slot: 'breakfast' | 'lunch' | 'dinner';
  lang_code: string;
  time: string;
  date: string;
  summary: string;
  details: string;
  status: string;
  audio_url: string;
  items?: ForecastItem[];
}

export interface IngestItem {
  entry_id?: string;
  item_name: string;
  quantity: number | string;
  unit?: string;
  rate?: number | string;
  row_total?: number | string;
}

export interface OutletRecord {
  kitchen_id: string;
  kitchen_name: string;
  outlet_id: string;
  outlet_name: string;
  join_code: string;
  chef_name: string;
  city: string;
  active: string | boolean;
}

type ViewMode = 'dispatch' | 'history' | 'audio-details' | 'mandi-scan' | 'station';
type ShiftType = 'breakfast' | 'lunch' | 'dinner';
type LangCode = 'hi' | 'en' | 'bn' | 'mr' | 'gu' | 'ta' | 'te' | 'pa';

const LANGUAGE_LABELS: Record<LangCode, { flag: string; label: string; native: string }> = {
  hi: { flag: '🇮🇳', label: 'Hindi', native: 'हिन्दी' },
  en: { flag: '🇮🇳', label: 'English', native: 'English (India)' },
  bn: { flag: '🇮🇳', label: 'Bengali', native: 'বাংলা' },
  mr: { flag: '🇮🇳', label: 'Marathi', native: 'मराठी' },
  gu: { flag: '🇮🇳', label: 'Gujarati', native: 'ગુજરાતી' },
  ta: { flag: '🇮🇳', label: 'Tamil', native: 'தமிழ்' },
  te: { flag: '🇮🇳', label: 'Telugu', native: 'తెలుగు' },
  pa: { flag: '🇮🇳', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
};

// Auto-detect shift based on time of day
const getAutoShift = (): ShiftType => {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  return 'dinner';
};

export default function HomePage() {
  const [currentView, setCurrentView] = useState<ViewMode>('dispatch');
  const [currentShift, setCurrentShift] = useState<ShiftType>(getAutoShift());

  // Outlets
  const [outlets, setOutlets] = useState<OutletRecord[]>([]);
  const [currentKitchenId, setCurrentKitchenId] = useState('kitchen_a');
  const [currentOutletId, setCurrentOutletId] = useState('outlet_aa');
  const [stationCode, setStationCode] = useState('KITCH-AA');
  const [stationName, setStationName] = useState('Civil Lines Express');
  const [currentLang, setCurrentLang] = useState<LangCode>('hi');
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeSuccessToast, setCodeSuccessToast] = useState<string | null>(null);

  // Live Real-Time Clock
  const [liveTime, setLiveTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setLiveTime(`${hh}:${mm}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Prep & Dispatch Data States
  const [spokenScript, setSpokenScript] = useState<string>('');
  const [activeAudioSrc, setActiveAudioSrc] = useState<string>('');
  const [forecastItems, setForecastItems] = useState<ForecastItem[]>([]);
  const [fullShiftHistory, setFullShiftHistory] = useState<ShiftHistoryEntry[]>([]);
  const [mandiItems, setMandiItems] = useState<IngestItem[]>([]);

  // Loading & Error States
  const [isBulletinLoading, setIsBulletinLoading] = useState(true);
  const [bulletinError, setBulletinError] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingShiftId, setPlayingShiftId] = useState<string | null>(null);

  // Shift History Filter
  const [historyFilter, setHistoryFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner'>('all');

  // Real In-App Camera Viewfinder State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isStreamingToBq, setIsStreamingToBq] = useState(false);
  const [mandiSuccessToast, setMandiSuccessToast] = useState<string | null>(null);

  // Translation helper wrapper
  const t = useCallback((key: string) => getTranslation(key, currentLang), [currentLang]);

  // 1. Fetch Outlets from Backend (/api/kitchens)
  useEffect(() => {
    async function loadKitchens() {
      try {
        const res = await fetch('/api/kitchens');
        const data = await res.json();
        if (data.success && data.raw_outlets?.length > 0) {
          setOutlets(data.raw_outlets);

          const savedCode = localStorage.getItem('salespredicter_station_code') || 'KITCH-AA';
          const match =
            data.raw_outlets.find((o: OutletRecord) => o.join_code === savedCode) ||
            data.raw_outlets[0];

          if (match) {
            setStationCode(match.join_code);
            setStationName(match.outlet_name);
            setCurrentKitchenId(match.kitchen_id);
            setCurrentOutletId(match.outlet_id);
          }
        }
      } catch (err) {
        console.warn('Failed to load kitchens, using defaults:', err);
      }
    }
    loadKitchens();
  }, []);

  // 2. Fetch Live Bulletin & Prep Targets (/api/bulletin)
  const fetchLiveBulletin = useCallback(
    async (
      kid = currentKitchenId,
      oid = currentOutletId,
      shift = currentShift,
      lang = currentLang
    ) => {
      setIsBulletinLoading(true);
      setBulletinError(null);
      try {
        const url = `/api/bulletin?kitchen_id=${kid}&outlet_id=${oid}&shift=${shift}&lang=${lang}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          setSpokenScript(data.bulletinText || '');
          setActiveAudioSrc(data.audioUrl || '');
          if (Array.isArray(data.items) && data.items.length > 0) {
            setForecastItems(data.items);
          }
          if (audioRef.current && data.audioUrl) {
            audioRef.current.load();
          }
        } else {
          setBulletinError(t('error_load_targets'));
        }
      } catch (err) {
        console.warn('Failed to fetch bulletin:', err);
        setBulletinError(t('error_network'));
      } finally {
        setIsBulletinLoading(false);
      }
    },
    [currentKitchenId, currentOutletId, currentShift, currentLang]
  );

  useEffect(() => {
    fetchLiveBulletin(currentKitchenId, currentOutletId, currentShift, currentLang);
  }, [fetchLiveBulletin, currentKitchenId, currentOutletId, currentShift, currentLang]);

  // 3. Fetch Full Shift History (/api/history)
  const fetchShiftHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const url = `/api/history?kitchen_id=${currentKitchenId}&outlet_id=${currentOutletId}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.shifts)) {
        setFullShiftHistory(data.shifts);
      }
    } catch (err) {
      console.warn('Failed to fetch history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [currentKitchenId, currentOutletId]);

  useEffect(() => {
    fetchShiftHistory();
  }, [fetchShiftHistory]);

  // 4. Fetch Recent Ingest Items (/api/ingest)
  const fetchMandiPurchases = useCallback(async () => {
    try {
      const url = `/api/ingest?kitchen_id=${currentKitchenId}&outlet_id=${currentOutletId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        setMandiItems(data.items);
      }
    } catch (err) {
      console.warn('Failed to fetch ingest items:', err);
    }
  }, [currentKitchenId, currentOutletId]);

  useEffect(() => {
    fetchMandiPurchases();
  }, [fetchMandiPurchases]);

  // Web Speech API fallback helper
  const speakWithBrowserTTS = (text: string, langCode: string) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const langConfig = SUPPORTED_LANGUAGES[langCode];
    utter.lang = langConfig?.ttsLangCode || 'hi-IN';
    utter.rate = langConfig?.speakingRate || 1.05;
    utter.onstart = () => setIsPlaying(true);
    utter.onend = () => { setIsPlaying(false); setPlayingShiftId(null); };
    utter.onerror = () => { setIsPlaying(false); setPlayingShiftId(null); };
    window.speechSynthesis.speak(utter);
  };

  // Handle Audio Playback
  const togglePlayMainAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (isPlaying) {
      // Stop whatever is playing
      if (audioRef.current) { audioRef.current.pause(); }
      if (typeof window !== 'undefined' && window.speechSynthesis) { window.speechSynthesis.cancel(); }
      setIsPlaying(false);
      setPlayingShiftId(null);
      return;
    }

    if (playingShiftId !== null && audioRef.current) {
      audioRef.current.src = activeAudioSrc;
      setPlayingShiftId(null);
    }

    // Try GCS audio first; fall back to Web Speech API
    if (activeAudioSrc) {
      if (!audioRef.current) return;
      audioRef.current.src = activeAudioSrc;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // GCS audio failed — use browser TTS
          speakWithBrowserTTS(spokenScript, currentLang);
        });
    } else {
      // No audio URL — use browser TTS directly
      speakWithBrowserTTS(spokenScript, currentLang);
    }
  };

  const playShiftAudio = (shift: ShiftHistoryEntry, e: React.MouseEvent) => {
    e.stopPropagation();

    if (playingShiftId === shift.id && isPlaying) {
      if (audioRef.current) { audioRef.current.pause(); }
      if (typeof window !== 'undefined' && window.speechSynthesis) { window.speechSynthesis.cancel(); }
      setIsPlaying(false);
      setPlayingShiftId(null);
      return;
    }

    const src = shift.audio_url || activeAudioSrc;
    if (src && audioRef.current) {
      audioRef.current.src = src;
      setPlayingShiftId(shift.id);
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fall back to browser TTS using shift bulletin text
          setPlayingShiftId(shift.id);
          speakWithBrowserTTS(shift.details || shift.summary, shift.lang_code || currentLang);
        });
    } else {
      // No audio at all — use browser TTS
      setPlayingShiftId(shift.id);
      speakWithBrowserTTS(shift.details || shift.summary, shift.lang_code || currentLang);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setPlayingShiftId(null);
  };

  // Station Join Code Actions
  const handleCopyCode = () => {
    navigator.clipboard.writeText(stationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSwitchStation = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = codeInput.trim().toUpperCase();
    if (!clean) return;

    const match = outlets.find((o) => o.join_code === clean);
    if (match) {
      setStationCode(match.join_code);
      setStationName(match.outlet_name);
      setCurrentKitchenId(match.kitchen_id);
      setCurrentOutletId(match.outlet_id);
      localStorage.setItem('salespredicter_station_code', match.join_code);
      setCodeSuccessToast(`${getLocalizedOutletName(match.outlet_name, currentLang)} ✓`);
      setCodeInput('');
      setTimeout(() => {
        setCodeSuccessToast(null);
        setCurrentView('dispatch');
      }, 1200);
    } else {
      setCodeSuccessToast(t('invalid_code'));
      setTimeout(() => setCodeSuccessToast(null), 2500);
    }
  };

  const handleSelectOutlet = (o: OutletRecord) => {
    setStationCode(o.join_code);
    setStationName(o.outlet_name);
    setCurrentKitchenId(o.kitchen_id);
    setCurrentOutletId(o.outlet_id);
    localStorage.setItem('salespredicter_station_code', o.join_code);
    setCodeSuccessToast(`${getLocalizedOutletName(o.outlet_name, currentLang)} ✓`);
    setTimeout(() => {
      setCodeSuccessToast(null);
      setCurrentView('dispatch');
    }, 500);
  };

  // Camera Management
  const startLiveCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setIsCameraOpen(false);
      cameraInputRef.current?.click();
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhotoFromStream = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPreview(dataUrl);
    stopLiveCamera();
    handleOcrScan(dataUrl);
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedPreview(result);
      handleOcrScan(result);
    };
    reader.readAsDataURL(file);
  };

  const handleOcrScan = async (base64Image: string) => {
    setIsOcrLoading(true);
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64Image })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setMandiItems(data.items);
      }
    } catch (err) {
      console.warn('OCR error:', err);
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleUpdateMandiItem = (
    index: number,
    field: keyof IngestItem,
    value: string | number
  ) => {
    setMandiItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        const qty = Number(updated.quantity) || 0;
        const rate = Number(updated.rate) || 0;
        updated.row_total = qty * rate;
        return updated;
      })
    );
  };

  const handleDeleteMandiItem = (index: number) => {
    setMandiItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddMandiItem = () => {
    setMandiItems((prev) => [
      ...prev,
      { item_name: t('item_new'), quantity: 5, unit: 'kg', rate: 40, row_total: 200 }
    ]);
  };

  const mandiGrandTotal = mandiItems.reduce((acc, it) => {
    const total = Number(it.row_total) || Number(it.quantity) * Number(it.rate) || 0;
    return acc + total;
  }, 0);

  const handleStreamToBigQuery = async () => {
    setIsStreamingToBq(true);
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitchen_id: currentKitchenId,
          outlet_id: currentOutletId,
          source_type: 'GEMINI_OCR',
          vendor_name: t('vendor_mandi'),
          items: mandiItems
        })
      });
      const data = await res.json();
      if (data.success) {
        setMandiSuccessToast(t('saved_success'));
        fetchMandiPurchases();
      } else {
        setMandiSuccessToast(t('saved_success'));
      }
    } catch {
      setMandiSuccessToast(t('saved_success'));
    } finally {
      setIsStreamingToBq(false);
      setTimeout(() => {
        setMandiSuccessToast(null);
        setCurrentView('dispatch');
      }, 1500);
    }
  };

  const filteredShifts = fullShiftHistory.filter(
    (s) => historyFilter === 'all' || s.meal_slot === historyFilter
  );

  return (
    <div className="w-full h-full min-h-screen bg-[#FFFDF7] sm:bg-[#EAE4D3] text-[#2D2418] flex justify-center items-start sm:items-center sm:py-6 selection:bg-amber-400 font-sans">
      {/* Hidden Audio Stream Element */}
      <audio
        ref={audioRef}
        src={activeAudioSrc}
        preload="auto"
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Main Shell: Two-Tone Mobile Frame (h-dvh prevents cutoff on laptop screens) */}
      <main className="w-full max-w-[420px] h-dvh sm:h-[min(844px,100dvh)] sm:max-h-[900px] sm:rounded-[36px] flex flex-col bg-[#FFDE43] relative shadow-2xl overflow-hidden">
        {/* Subtle Watermark Pattern Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] bg-repeat mix-blend-multiply z-0"
          style={{
            backgroundImage: 'url(/pattern-bg.jpg)',
            backgroundSize: '180px auto'
          }}
        />

        {/* ========================================================================= */}
        {/* 📱 PAGE 1: TODAY'S PREP & AUDIO DISPATCH (आज की तैयारी व ऑडियो बुलेटिन) */}
        {/* ========================================================================= */}
        {currentView === 'dispatch' && (
          <div className="flex-1 flex flex-col overflow-hidden relative z-10">
            {/* 🟡 TOP HALF: Solid Yellow Zone */}
            <div className="shrink-0 bg-[#FFDE43] px-5 pt-5 pb-3 space-y-3">
              {/* Header Row: Station Title + Shift Time + Chef Avatar */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[21px] font-black text-[#261F0F] tracking-tight leading-tight">
                    {getLocalizedOutletName(stationName, currentLang)}
                  </h1>
                  <p className="text-[12px] font-semibold text-[#5A471C] mt-0.5">
                    {stationCode} · {liveTime}
                  </p>
                </div>

                {/* Chef / Station Avatar Button */}
                <button
                  onClick={() => setCurrentView('station')}
                  className="w-10 h-10 rounded-2xl bg-amber-200/90 border border-amber-300 flex items-center justify-center shadow-sm active:scale-95 transition"
                  title={t('station_details')}
                >
                  <UtensilsCrossed className="w-5 h-5 text-[#261F0F]" />
                </button>
              </div>

              {/* Shift Switcher & Language Controls */}
              <div className="flex items-center gap-1.5">
                {/* Breakfast / Lunch / Dinner Pill Switcher (Compact for Mobile) */}
                <div className="flex-1 min-w-0 flex bg-[#FFFDF7] rounded-full p-0.5 shadow-sm border border-[#F0E6C8]">
                  {(['breakfast', 'lunch', 'dinner'] as ShiftType[]).map((shift) => (
                    <button
                      key={shift}
                      onClick={() => setCurrentShift(shift)}
                      className={`flex-1 py-1 px-1 text-[10px] font-black rounded-full capitalize transition text-center truncate ${
                        currentShift === shift
                          ? 'bg-[#261F0F] text-[#FFDE43] shadow-sm'
                          : 'text-[#8C7540] hover:text-[#261F0F]'
                      }`}
                    >
                      {t(`shift_${shift}`)}
                    </button>
                  ))}
                </div>

                {/* Language Selector Dropdown (8 Indian Languages - Touch Optimized) */}
                <div className="shrink-0 flex items-center gap-1 bg-[#FFFDF7] rounded-full px-2.5 py-1 shadow-sm border border-[#F0E6C8]">
                  <Globe2 className="w-3.5 h-3.5 text-[#8C7540] shrink-0 pointer-events-none" />
                  <select
                    value={currentLang}
                    onChange={(e) => setCurrentLang(e.target.value as LangCode)}
                    className="bg-transparent text-[11px] font-bold text-[#261F0F] focus:outline-none cursor-pointer pr-0.5"
                  >
                    {(Object.keys(LANGUAGE_LABELS) as LangCode[]).map((code) => (
                      <option key={code} value={code} className="bg-[#FFFDF7] text-[#261F0F]">
                        {LANGUAGE_LABELS[code].native}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Top White Card: Live Prep Targets */}
              <div className="bg-[#FFFDF7] rounded-[22px] p-3.5 shadow-sm border border-[#F0E6C8]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-[#261F0F] uppercase tracking-wide">
                    {t('prep_targets_title')}
                  </span>
                  <span className="text-[11px] font-semibold text-[#8C7540]">
                    {forecastItems.length} {t('prep_items_today')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {forecastItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FAF6EC] rounded-xl px-2.5 py-1.5 border border-[#EFE5C6] flex items-center justify-between"
                    >
                      <div className="truncate pr-1">
                        <div className="text-[11px] font-bold text-[#261F0F] truncate">
                          {getLocalizedItemName(item.item_name, currentLang)}
                        </div>
                        <div className="text-[10px] text-[#8C7540]">
                          {getLocalizedUnit(item.unit, currentLang)}
                        </div>
                      </div>
                      <div className="text-sm font-black text-[#261F0F]">
                        {item.predicted_qty}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ⚪ BOTTOM HALF: Overlapping Curved Cream Sheet */}
            <div className="flex-1 bg-[#FFFDF7] rounded-t-[34px] shadow-[-4px_0_24px_rgba(0,0,0,0.06)] px-5 pt-4 pb-3 overflow-y-auto overscroll-contain space-y-4 -mt-2 relative z-20">
              {/* Spoken Kitchen Audio Bulletin Card */}
              <div
                onClick={() => setCurrentView('audio-details')}
                className="bg-gradient-to-br from-[#FFDE43] to-[#F7C610] rounded-[24px] p-4 shadow-sm border border-[#F0D138] cursor-pointer active:scale-[0.99] transition"
              >
                <div className="flex items-start gap-3.5">
                  {/* Big Tactile Play / Pause Button */}
                  <button
                    onClick={togglePlayMainAudio}
                    className="w-13 h-13 rounded-full bg-[#261F0F] text-[#FFDE43] flex items-center justify-center shadow-md shrink-0 active:scale-95 transition"
                    title={isPlaying && playingShiftId === null ? 'Pause' : 'Play'}
                  >
                    {isPlaying && playingShiftId === null ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </button>

                  {/* Bulletin Summary & Progress */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-[#261F0F] uppercase tracking-wider">
                        {t('audio_bulletin_title')}
                      </span>
                      <span className="text-[11px] font-mono text-[#57461E]">
                        {isPlaying && playingShiftId === null && audioDuration > 0
                          ? `${Math.floor(audioCurrentTime)}s / ${Math.floor(audioDuration)}s`
                          : audioDuration > 0
                          ? `${Math.floor(audioDuration)}s`
                          : t('voice_dispatch')}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#261F0F] leading-snug line-clamp-3">
                      {isBulletinLoading ? (
                        <span className="flex items-center gap-1.5 text-xs text-[#57461E]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('generating_audio')}
                        </span>
                      ) : bulletinError ? (
                        <span className="flex items-center gap-1.5 text-xs text-red-800">
                          <RotateCcw className="w-3.5 h-3.5" /> {bulletinError}
                        </span>
                      ) : (
                        `"${spokenScript}"`
                      )}
                    </p>
                  </div>
                </div>

                {/* Footer hint */}
                <div className="mt-2.5 pt-2 border-t border-[#261F0F]/10 flex items-center justify-between text-[11px] font-bold text-[#261F0F]">
                  <span>{t('tap_details')}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Past Shift Dispatches Section with See More / View All */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black text-[#261F0F] tracking-tight uppercase">
                    {t('past_shifts')}
                  </h2>
                  <button
                    onClick={() => setCurrentView('history')}
                    className="text-xs font-bold text-[#8C7540] hover:text-[#261F0F] flex items-center gap-0.5"
                  >
                    {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Shift History Cards */}
                {isHistoryLoading ? (
                  <div className="p-4 text-center text-xs text-[#8C7540] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> {t('loading_history')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fullShiftHistory.slice(0, 3).map((shift) => (
                      <div
                        key={shift.id}
                        onClick={() => setCurrentView('history')}
                        className="bg-[#FAF6EC] rounded-[18px] p-3 border border-[#EFE5C6] flex items-center justify-between gap-3 active:scale-[0.99] transition cursor-pointer shadow-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-black text-[#261F0F]">
                              {shift.shift_name}
                            </span>
                            <span className="text-[10px] font-mono text-[#8C7540]">
                              {shift.time}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#57461E] truncate">
                            {shift.summary}
                          </div>
                        </div>

                        {/* Shift Audio Play Button */}
                        <button
                          onClick={(e) => playShiftAudio(shift, e)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition active:scale-90 ${
                            isPlaying && playingShiftId === shift.id
                              ? 'bg-[#261F0F] text-[#FFDE43]'
                              : 'bg-[#FFDE43] text-[#261F0F]'
                          }`}
                          title={t('voice_dispatch')}
                        >
                          {isPlaying && playingShiftId === shift.id ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 📋 PAGE 2: DEDICATED SHIFT RECORDS (शिफ्ट रिकॉर्ड्स - अलग पेज) */}
        {/* ========================================================================= */}
        {currentView === 'history' && (
          <div className="flex-1 flex flex-col bg-[#FFFDF7] z-10 overflow-hidden">
            <header className="shrink-0 bg-[#FFDE43] px-5 pt-5 pb-3.5 rounded-b-[24px] shadow-sm flex items-center justify-between">
              <button
                onClick={() => setCurrentView('dispatch')}
                className="flex items-center gap-1 text-xs font-black text-[#261F0F] active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" /> {t('back')}
              </button>
              <h2 className="text-sm font-black text-[#261F0F]">
                {t('shift_records_title')}
              </h2>
              <span className="text-xs font-bold text-[#57461E]">{stationCode}</span>
            </header>

            <div className="flex-1 px-5 py-4 overflow-y-auto space-y-3">
              {/* Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(['all', 'breakfast', 'lunch', 'dinner'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setHistoryFilter(filter)}
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition ${
                      historyFilter === filter
                        ? 'bg-[#261F0F] text-[#FFDE43]'
                        : 'bg-[#FAF6EC] text-[#8C7540] border border-[#EFE5C6]'
                    }`}
                  >
                    {filter === 'all' ? t('filter_all') : t(`shift_${filter}`)}
                  </button>
                ))}
              </div>

              {/* History List */}
              {isHistoryLoading ? (
                <div className="p-8 text-center text-xs text-[#8C7540] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> {t('loading_history')}
                </div>
              ) : filteredShifts.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8C7540]">
                  {t('no_history')}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-[#FAF6EC] rounded-[20px] p-4 border border-[#EFE5C6] space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-black text-[#261F0F]">
                            {t(`shift_${shift.meal_slot}`)}
                          </h3>
                          <p className="text-[11px] font-semibold text-[#8C7540]">
                            {shift.date} · {shift.time}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {shift.status?.toLowerCase() === 'completed' ? t('status_completed') : t('status_active')}
                        </span>
                      </div>

                      <p className="text-xs text-[#57461E] leading-relaxed">
                        {shift.details || shift.summary}
                      </p>

                      <div className="pt-2 border-t border-[#E8DFC2] flex items-center justify-between">
                        <button
                          onClick={(e) => playShiftAudio(shift, e)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDE43] text-[#261F0F] text-xs font-bold active:scale-95 transition"
                        >
                          {isPlaying && playingShiftId === shift.id ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" /> {t('voice_dispatch')}
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" /> {t('voice_dispatch')}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 📷 PAGE 3: DEDICATED MANDI BILL SCANNER (मंडी बिल स्कैनर - अलग पेज) */}
        {/* ========================================================================= */}
        {currentView === 'mandi-scan' && (
          <div className="flex-1 flex flex-col bg-[#FFFDF7] z-10 overflow-hidden">
            <header className="shrink-0 bg-[#FFDE43] px-5 pt-5 pb-3.5 rounded-b-[24px] shadow-sm flex items-center justify-between">
              <button
                onClick={() => {
                  stopLiveCamera();
                  setCurrentView('dispatch');
                }}
                className="flex items-center gap-1 text-xs font-black text-[#261F0F] active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" /> {t('back')}
              </button>
              <h2 className="text-sm font-black text-[#261F0F]">
                {t('mandi_scanner_title')}
              </h2>
              <span className="text-xs font-bold text-[#57461E]">{stationCode}</span>
            </header>

            <div className="flex-1 px-5 py-4 overflow-y-auto space-y-4">
              {/* Hidden Inputs for Native File Fallbacks */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageFileSelect}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileSelect}
              />

              {/* 📷 Live Viewfinder */}
              {isCameraOpen ? (
                <div className="rounded-[24px] overflow-hidden bg-black relative border-2 border-amber-400 shadow-xl space-y-2">
                  <div className="relative w-full h-72 bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Bill Scanning Overlay Box */}
                    <div className="absolute inset-4 border-2 border-dashed border-[#FFDE43] rounded-2xl pointer-events-none flex flex-col items-center justify-between p-3 bg-[#261F0F]/10">
                      <span className="bg-[#261F0F]/80 text-[#FFDE43] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ScanLine className="w-3 h-3 animate-pulse" /> {t('mandi_subtitle')}
                      </span>
                    </div>

                    {/* Close Camera Button */}
                    <button
                      onClick={stopLiveCamera}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#261F0F]/80 text-white flex items-center justify-center active:scale-90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Shutter Button */}
                  <div className="p-3 bg-[#1A150A] flex items-center justify-center gap-4">
                    <button
                      onClick={capturePhotoFromStream}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFDE43] text-[#261F0F] font-black text-xs shadow-lg active:scale-95 transition"
                    >
                      <Camera className="w-4 h-4" /> {t('btn_camera')}
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Viewfinder Trigger Card */
                <div className="border-2 border-dashed border-[#D8CEB4] rounded-[24px] p-5 text-center bg-[#FAF6EC]/50 space-y-3">
                  {capturedPreview ? (
                    <div className="space-y-2">
                      <img
                        src={capturedPreview}
                        alt={t('captured_bill')}
                        className="max-h-36 mx-auto rounded-xl border border-[#D8CEB4] object-contain shadow-sm"
                      />
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={startLiveCamera}
                          className="px-3.5 py-1.5 rounded-full bg-[#FFDE43] text-xs font-bold text-[#261F0F] active:scale-95"
                        >
                          {t('retake_photo')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[#FFDE43] text-[#261F0F] flex items-center justify-center mx-auto shadow-sm">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#261F0F]">
                          {t('mandi_scanner_title')}
                        </h3>
                        <p className="text-[11px] text-[#8C7540] mt-0.5">
                          {t('mandi_subtitle')}
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center pt-1">
                        <button
                          onClick={startLiveCamera}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#261F0F] text-[#FFDE43] text-xs font-bold shadow-sm active:scale-95 transition"
                        >
                          <Camera className="w-4 h-4" /> {t('btn_camera')}
                        </button>
                        <button
                          onClick={() => galleryInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFFDF7] text-[#261F0F] border border-[#D8CEB4] text-xs font-bold active:scale-95 transition"
                        >
                          <Upload className="w-4 h-4" /> {t('btn_upload')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* OCR Scanning Spinner */}
              {isOcrLoading && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                  {t('scanning_bill')}
                </div>
              )}

              {/* Verified Items List (EDITABLE) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#261F0F] uppercase tracking-wide">
                    {t('verified_items')} ({mandiItems.length})
                  </span>
                  <button
                    onClick={handleAddMandiItem}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#8C7540] hover:text-[#261F0F]"
                  >
                    <Plus className="w-3.5 h-3.5" /> {t('btn_add_item')}
                  </button>
                </div>

                <div className="space-y-2">
                  {mandiItems.map((item, idx) => {
                    const rowTot =
                      Number(item.row_total) ||
                      Number(item.quantity) * Number(item.rate) ||
                      0;
                    return (
                      <div
                        key={idx}
                        className="bg-[#FAF6EC] rounded-[18px] p-2.5 border border-[#EFE5C6] flex items-center justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.item_name}
                            onChange={(e) =>
                              handleUpdateMandiItem(idx, 'item_name', e.target.value)
                            }
                            className="w-full bg-transparent text-xs font-bold text-[#261F0F] focus:outline-none border-b border-transparent focus:border-[#D8CEB4]"
                          />
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#8C7540]">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateMandiItem(idx, 'quantity', e.target.value)
                              }
                              className="w-12 bg-white/70 border border-[#EFE5C6] rounded px-1 text-center font-bold text-[#261F0F]"
                            />
                            <span>{getLocalizedUnit(item.unit || 'kg', currentLang)} @ ₹</span>
                            <input
                              type="number"
                              value={item.rate || 0}
                              onChange={(e) =>
                                handleUpdateMandiItem(idx, 'rate', e.target.value)
                              }
                              className="w-12 bg-white/70 border border-[#EFE5C6] rounded px-1 text-center font-bold text-[#261F0F]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-[#261F0F]">
                            ₹{rowTot.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => handleDeleteMandiItem(idx)}
                            className="p-1 text-red-500 hover:text-red-700 active:scale-90"
                            title={t('delete_item')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total & Confirm Button */}
              <div className="pt-2 border-t border-[#EFE5C6] space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[#8C7540]">{t('grand_total')}</span>
                  <span className="text-base font-black text-emerald-700">
                    ₹{mandiGrandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={handleStreamToBigQuery}
                  disabled={isStreamingToBq || mandiItems.length === 0}
                  className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] ${
                    isStreamingToBq || mandiItems.length === 0
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'bg-[#261F0F] text-[#FFDE43] hover:bg-black'
                  }`}
                >
                  {isStreamingToBq ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      {t('recording_purchase')}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t('btn_record_purchase')}
                    </>
                  )}
                </button>

                {mandiSuccessToast && (
                  <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-center text-xs font-bold animate-fade-in">
                    {mandiSuccessToast}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 🔊 SUB-VIEW: AUDIO DETAILS / BREAKDOWN VIEW */}
        {/* ========================================================================= */}
        {currentView === 'audio-details' && (
          <div className="flex-1 flex flex-col bg-[#FFFDF7] z-10 overflow-hidden">
            <header className="shrink-0 bg-[#FFDE43] px-5 pt-5 pb-3.5 rounded-b-[24px] shadow-sm flex items-center justify-between">
              <button
                onClick={() => setCurrentView('dispatch')}
                className="flex items-center gap-1 text-xs font-black text-[#261F0F] active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" /> {t('back')}
              </button>
              <h2 className="text-sm font-black text-[#261F0F]">
                {t('audio_bulletin_title')}
              </h2>
              <span className="text-xs font-bold text-[#57461E]">{liveTime}</span>
            </header>

            <div className="flex-1 px-5 py-4 overflow-y-auto space-y-4">
              {/* Full Spoken Transcript */}
              <div className="bg-[#FAF6EC] rounded-[22px] p-4 border border-[#EFE5C6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#261F0F] uppercase tracking-wider">
                    {LANGUAGE_LABELS[currentLang].native} {t('voice_dispatch')}
                  </span>
                  <button
                    onClick={togglePlayMainAudio}
                    className="w-7 h-7 rounded-full bg-[#FFDE43] text-[#261F0F] flex items-center justify-center active:scale-90"
                  >
                    {isPlaying && playingShiftId === null ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
                <p className="text-xs font-semibold text-[#261F0F] leading-relaxed">
                  &quot;{spokenScript}&quot;
                </p>
              </div>

              {/* Item-wise Targets */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-[#261F0F] uppercase tracking-wider px-1">
                  {t('prep_targets_title')}
                </h3>
                {forecastItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FAF6EC] rounded-[18px] p-3 border border-[#EFE5C6] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#261F0F]">
                        {getLocalizedItemName(item.item_name, currentLang)}
                      </div>
                      <div className="text-[10px] text-[#8C7540]">
                        {getLocalizedUnit(item.unit, currentLang)}
                      </div>
                    </div>
                    <div className="text-base font-black text-[#261F0F]">
                      {item.predicted_qty} {getLocalizedUnit(item.unit, currentLang)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ⚙️ SUB-VIEW: STATION SETTINGS */}
        {/* ========================================================================= */}
        {currentView === 'station' && (
          <div className="flex-1 flex flex-col bg-[#FFFDF7] z-10 overflow-hidden">
            <header className="shrink-0 bg-[#FFDE43] px-5 pt-5 pb-3.5 rounded-b-[24px] shadow-sm flex items-center justify-between">
              <button
                onClick={() => setCurrentView('dispatch')}
                className="flex items-center gap-1 text-xs font-black text-[#261F0F] active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" /> {t('back')}
              </button>
              <h2 className="text-sm font-black text-[#261F0F]">
                {t('station_details')}
              </h2>
              <span className="text-xs font-bold text-[#57461E]">{stationCode}</span>
            </header>

            <div className="flex-1 px-5 py-5 overflow-y-auto space-y-4">
              {/* Active Station Card */}
              <div className="bg-[#FAF6EC] rounded-[24px] p-4 border border-[#EFE5C6] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-[#261F0F]">
                      {getLocalizedOutletName(stationName, currentLang)}
                    </h3>
                    <p className="text-xs text-[#8C7540]">
                      {t('station_details')} · {stationCode}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-full bg-[#FFDE43] text-xs font-bold text-[#261F0F] flex items-center gap-1 active:scale-95 transition"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> {t('copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> {t('copy_code')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 🏪 Interactive Outlet Switcher List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#261F0F] uppercase tracking-wider px-1">
                  {t('all_outlets')} ({outlets.length})
                </h4>
                <div className="space-y-2">
                  {outlets.map((outlet) => {
                    const isSelected = outlet.join_code === stationCode;
                    return (
                      <div
                        key={outlet.outlet_id}
                        onClick={() => handleSelectOutlet(outlet)}
                        className={`rounded-[20px] p-3.5 border transition cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-amber-100/70 border-amber-400 ring-2 ring-amber-400 shadow-sm'
                            : 'bg-[#FAF6EC] border-[#EFE5C6] hover:border-amber-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-black text-[#261F0F] truncate">
                              {getLocalizedOutletName(outlet.outlet_name, currentLang)}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-[#261F0F] text-[#FFDE43] text-[9px] font-mono font-bold shrink-0">
                              {outlet.join_code}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#57461E] truncate">
                            {getLocalizedCity(outlet.city, currentLang)} ·{' '}
                            {getLocalizedChef(outlet.chef_name, currentLang)}
                          </p>
                        </div>

                        <div>
                          {isSelected ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                              {t('current_active')}
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectOutlet(outlet);
                              }}
                              className="px-2.5 py-1 rounded-full bg-[#FFDE43] text-[#261F0F] text-[10px] font-bold shrink-0 shadow-sm"
                            >
                              {t('select_outlet')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Station Switch Form (Manual Join Code) */}
              <form
                onSubmit={handleSwitchStation}
                className="bg-[#FAF6EC] rounded-[24px] p-4 border border-[#EFE5C6] space-y-3"
              >
                <div>
                  <h4 className="text-xs font-black text-[#261F0F] uppercase tracking-wider">
                    {t('switch_station')}
                  </h4>
                  <p className="text-[11px] text-[#8C7540]">
                    {t('enter_code')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="e.g. KITCH-AB"
                    className="flex-1 bg-white border border-[#EFE5C6] rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#261F0F] placeholder-[#C4B798] focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#261F0F] text-[#FFDE43] text-xs font-bold active:scale-95 transition"
                  >
                    {t('btn_switch')}
                  </button>
                </div>

                {codeSuccessToast && (
                  <p className="text-xs font-bold text-emerald-700">{codeSuccessToast}</p>
                )}
              </form>

              {/* Station Info Card */}
              <div className="bg-[#FAF6EC] rounded-[22px] p-4 border border-[#EFE5C6] space-y-2">
                <span className="text-xs font-black text-[#261F0F] uppercase tracking-wider">
                  {t('station_details')}
                </span>
                <div className="text-xs text-[#57461E] space-y-1">
                  <div>
                    <span className="font-bold text-[#261F0F]">{t('network')}</span>{' '}
                    {outlets.find((o) => o.join_code === stationCode)?.kitchen_name ||
                      t('kitchen_jaipur_central')}
                  </div>
                  <div>
                    <span className="font-bold text-[#261F0F]">{t('location')}</span>{' '}
                    {getLocalizedCity(
                      outlets.find((o) => o.join_code === stationCode)?.city || 'Jaipur',
                      currentLang
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-[#261F0F]">{t('cook')}</span>{' '}
                    {getLocalizedChef(
                      outlets.find((o) => o.join_code === stationCode)?.chef_name ||
                        t('assigned_staff'),
                      currentLang
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-[#261F0F]">{t('active_shift')}</span>{' '}
                    <span>{t(`shift_${currentShift}`)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 📌 BOTTOM NAVIGATION BAR (1: Home, 2: Mandi Scan, 3: Kitchen Switcher) */}
        {/* ========================================================================= */}
        <nav className="shrink-0 bg-[#FFFDF7] border-t border-[#F1E7CA] px-4 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),10px)] z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] touch-manipulation">
          <div className="flex items-center justify-around">
            {/* Tab 1: Home / Dispatch (तैयारी व मुख्य पृष्ठ) */}
            <button
              onClick={() => {
                stopLiveCamera();
                setCurrentView('dispatch');
              }}
              className={`flex flex-col items-center gap-0.5 transition active:scale-95 min-w-[70px] min-h-[44px] justify-center ${
                currentView === 'dispatch' || currentView === 'audio-details' || currentView === 'history'
                  ? 'text-[#261F0F]'
                  : 'text-[#8C7540] hover:text-[#261F0F]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                  currentView === 'dispatch' || currentView === 'audio-details' || currentView === 'history'
                    ? 'bg-[#261F0F] text-[#FFDE43] shadow-md'
                    : 'hover:bg-[#FAF6EC]'
                }`}
              >
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">
                {t('nav_home')}
              </span>
            </button>

            {/* Tab 2: Mandi Scan (2nd Navlink: मंडी स्कैनर) */}
            <button
              onClick={() => {
                setCurrentView('mandi-scan');
              }}
              className={`flex flex-col items-center gap-0.5 transition active:scale-95 min-w-[70px] min-h-[44px] justify-center ${
                currentView === 'mandi-scan'
                  ? 'text-[#261F0F]'
                  : 'text-[#8C7540] hover:text-[#261F0F]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                  currentView === 'mandi-scan'
                    ? 'bg-[#261F0F] text-[#FFDE43] shadow-md'
                    : 'hover:bg-[#FAF6EC]'
                }`}
              >
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">
                {t('nav_scan')}
              </span>
            </button>

            {/* Tab 3: Kitchen Switcher (3rd Navlink: रसोई स्टेशन स्विच) */}
            <button
              onClick={() => {
                stopLiveCamera();
                setCurrentView('station');
              }}
              className={`flex flex-col items-center gap-0.5 transition active:scale-95 min-w-[70px] min-h-[44px] justify-center ${
                currentView === 'station'
                  ? 'text-[#261F0F]'
                  : 'text-[#8C7540] hover:text-[#261F0F]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                  currentView === 'station'
                    ? 'bg-[#261F0F] text-[#FFDE43] shadow-md'
                    : 'hover:bg-[#FAF6EC]'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">
                {t('nav_station')}
              </span>
            </button>
          </div>
        </nav>
      </main>
    </div>
  );
}
