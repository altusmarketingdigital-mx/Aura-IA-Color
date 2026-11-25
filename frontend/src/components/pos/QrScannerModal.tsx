import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, QrCode, X, AlertCircle, Keyboard } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (token: string) => void;
}

export const extractQrToken = (raw: string): string => {
  const trimmed = raw.trim();
  if (trimmed.includes('/lealtad/')) {
    const parts = trimmed.split('/lealtad/');
    return parts[parts.length - 1].split(/[?#]/)[0].trim();
  }
  return trimmed;
};

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [cameraError, setCameraError] = useState<string>('');
  const [manualToken, setManualToken] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const stopCamera = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCameraError('');
      return;
    }

    let cancelled = false;

    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Tu navegador no permite acceso a la cámara. Ingresa el código QR manualmente.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }

        const scanFrame = () => {
          if (cancelled || !videoRef.current || !canvasRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;

          if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
              });

              if (code && code.data) {
                const token = extractQrToken(code.data);
                if (token) {
                  stopCamera();
                  onScanSuccess(token);
                  return;
                }
              }
            }
          }

          rafRef.current = requestAnimationFrame(scanFrame);
        };

        rafRef.current = requestAnimationFrame(scanFrame);
      } catch (err: any) {
        console.error('Error de cámara QR:', err);
        setCameraError(
          'No se pudo acceder a la cámara (permiso denegado o sin dispositivo). Puedes escribir o usar un lector USB en el campo inferior.'
        );
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = extractQrToken(manualToken);
    if (!token) return;
    stopCamera();
    setManualToken('');
    onScanSuccess(token);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161616] border border-[#C6A15B]/50 max-w-md w-full rounded-sm p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#C6A15B]" />
            <h3 className="font-serif text-lg text-[#FFFFFF]">Escanear Tarjeta QR AURA</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-[#888888] hover:text-[#FFFFFF] p-1"
            aria-label="Cerrar lector QR"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visor de cámara */}
        <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-[#0D0D0D] border border-[#2D2D2D] rounded-sm overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {cameraActive && (
            <div className="absolute inset-8 border-2 border-[#C6A15B]/80 rounded-sm pointer-events-none shadow-[0_0_25px_rgba(198,161,91,0.3)]" />
          )}

          {!cameraActive && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-[#888888] gap-2">
              <Camera className="w-6 h-6 text-[#C6A15B] animate-pulse" />
              <span>Iniciando cámara...</span>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-sm text-amber-200 text-[11px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Entrada manual / Lector USB */}
        <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-[#262626]">
          <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#888888]">
            <Keyboard className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>O ingresa / escanea el token QR manualmente</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Ej. AURA-QR-DEMO2026"
              className="flex-1 bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-xs uppercase rounded-sm transition-colors"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
