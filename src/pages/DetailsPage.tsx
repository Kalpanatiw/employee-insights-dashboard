import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../data/DataContext';

export const DetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { rows } = useData();
  const navigate = useNavigate();
  const employee = rows.find((r) => r.id === id);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [drawing, setDrawing] = useState(false);

  const [mergedDataUrl, setMergedDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(media);
        if (videoRef.current) {
          videoRef.current.srcObject = media;
        }
      } catch (err) {
        console.error('Camera error', err);
      }
    };
    enableCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const capturePhoto = () => {
    if (!videoRef.current || !photoCanvasRef.current) return;
    const video = videoRef.current;
    const canvas = photoCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setHasPhoto(true);
  };

  const startDraw = (x: number, y: number) => {
    if (!signatureCanvasRef.current) return;
    const ctx = signatureCanvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const continueDraw = (x: number, y: number) => {
    if (!drawing || !signatureCanvasRef.current) return;
    const ctx = signatureCanvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    setDrawing(false);
  };

  const mergeImageAndSignature = () => {
    if (!photoCanvasRef.current || !signatureCanvasRef.current) return;
    const base = photoCanvasRef.current;
    const sig = signatureCanvasRef.current;
    const merged = document.createElement('canvas');
    merged.width = base.width;
    merged.height = base.height;
    const ctx = merged.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(base, 0, 0);
    ctx.drawImage(sig, 0, 0);
    const url = merged.toDataURL('image/png');
    setMergedDataUrl(url);
    window.sessionStorage.setItem('audit-image', url);
    navigate('/analytics');
  };

  if (!employee) {
    return (
      <section className="page details-page">
        <p>Employee not found. Go back to the list.</p>
      </section>
    );
  }

  const handlePointerDown: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    startDraw(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerMove: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    continueDraw(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerUp: React.PointerEventHandler<HTMLCanvasElement> = () => {
    endDraw();
  };

  return (
    <section className="page details-page">
      <header className="page-header">
        <h2>Identity Verification</h2>
        <p>
          {employee.name} – {employee.city}
        </p>
      </header>

      <div className="details-grid">
        <div className="camera-panel">
          <h3>Camera</h3>
          <video ref={videoRef} autoPlay playsInline className="camera-video" />
          <button className="primary-btn" type="button" onClick={capturePhoto}>
            Capture Photo
          </button>
          <canvas ref={photoCanvasRef} className="photo-canvas" />
        </div>

        <div className="signature-panel">
          <h3>Signature over Photo</h3>
          <div className="signature-overlay">
            <canvas
              ref={signatureCanvasRef}
              className="signature-canvas"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </div>
          <button
            className="primary-btn"
            type="button"
            onClick={mergeImageAndSignature}
            disabled={!hasPhoto}
          >
            Merge &amp; Continue
          </button>
          {mergedDataUrl && (
            <div className="preview">
              <h4>Audit Image Preview</h4>
              <img src={mergedDataUrl} alt="Merged audit" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

