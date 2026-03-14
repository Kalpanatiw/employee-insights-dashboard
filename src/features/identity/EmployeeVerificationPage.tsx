import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../services/employeeDataStore';

export const EmployeeVerificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rows } = useData();
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureRef = useRef<HTMLCanvasElement>(null);

  const employee = rows.find((r) => r.id === id);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        setPhotoData(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  const handleSignature = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signatureRef.current) return;
    const ctx = signatureRef.current.getContext('2d');
    if (!ctx) return;
    
    const rect = signatureRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setSignatureData(signatureRef.current.toDataURL('image/png'));
  };

  if (!employee) {
    return (
      <section className="page">
        <p>Employee not found.</p>
        <button onClick={() => navigate('/list')} className="primary-btn">
          Back to List
        </button>
      </section>
    );
  }

  return (
    <section className="page">
      <header className="page-header">
        <h2>Employee Verification: {employee.name}</h2>
        <p>Verify employee identity with photo and signature</p>
      </header>

      <div className="details-grid">
        <div className="camera-panel">
          <h3>Photo Verification</h3>
          <video ref={videoRef} autoPlay playsInline className="camera-video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
            <button onClick={startCamera} className="primary-btn">Start Camera</button>
            <button onClick={capturePhoto} className="primary-btn">Capture</button>
          </div>
          {photoData && (
            <div className="preview">
              <img src={photoData} alt="Captured" />
            </div>
          )}
        </div>

        <div className="signature-panel">
          <h3>Signature Capture</h3>
          <canvas
            ref={signatureRef}
            width={400}
            height={200}
            className="signature-canvas"
            onMouseDown={(e) => {
              const ctx = signatureRef.current?.getContext('2d');
              if (ctx) {
                ctx.beginPath();
                const rect = signatureRef.current!.getBoundingClientRect();
                ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
              }
              signatureRef.current?.addEventListener('mousemove', handleSignature as any);
            }}
          />
          <button onClick={() => setSignatureData(null)} className="primary-btn" style={{ marginTop: '8px' }}>
            Clear Signature
          </button>
        </div>

        <div className="audit-panel">
          <h3>Employee Details</h3>
          <div className="cell">
            <strong>ID:</strong> {employee.id}
          </div>
          <div className="cell">
            <strong>Name:</strong> {employee.name}
          </div>
          <div className="cell">
            <strong>City:</strong> {employee.city}
          </div>
          <div className="cell">
            <strong>Salary:</strong> ${employee.salary}
          </div>
        </div>

        <div className="charts-panel">
          <h3>Verification Status</h3>
          <p>Photo: {photoData ? '✓ Captured' : '✗ Not captured'}</p>
          <p>Signature: {signatureData ? '✓ Signed' : '✗ Not signed'}</p>
          <button 
            onClick={() => navigate('/list')} 
            className="primary-btn" 
            style={{ marginTop: '16px' }}
          >
            Back to List
          </button>
        </div>
      </div>
    </section>
  );
};
