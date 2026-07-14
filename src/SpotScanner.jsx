import React, { useState, useRef } from 'react';
import useSpotScanner from './hooks/useSpotScanner';

export default function SpotScanner({ onAreaCalculated }) {
  const {
    stream, analyzing, resultImage, rect, setRect,
    analysisMeta, videoRef, canvasRef, startCamera, capture
  } = useSpotScanner({ onAreaCalculated });

  const [draggingHandle, setDraggingHandle] = useState(null);
  const svgRef = useRef(null);

  const handlePointerDown = (e, handle) => {
    e.preventDefault();
    setDraggingHandle(handle);
  };

  const handlePointerMove = (e) => {
    if (!draggingHandle || !rect || !svgRef.current) return;
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const cursor = point.matrixTransform(svg.getScreenCTM().inverse());
    
    setRect(prev => {
      const r = { ...prev };
      if (draggingHandle === 'br') {
        r.width = cursor.x - r.x;
        r.height = cursor.y - r.y;
      } else if (draggingHandle === 'bl') {
        r.width = (r.x + r.width) - cursor.x;
        r.x = cursor.x;
        r.height = cursor.y - r.y;
      } else if (draggingHandle === 'tr') {
        r.width = cursor.x - r.x;
        r.height = (r.y + r.height) - cursor.y;
        r.y = cursor.y;
      } else if (draggingHandle === 'tl') {
        r.width = (r.x + r.width) - cursor.x;
        r.x = cursor.x;
        r.height = (r.y + r.height) - cursor.y;
        r.y = cursor.y;
      }
      
      // Ensure positive dims
      if(r.width < 20) r.width = 20;
      if(r.height < 20) r.height = 20;

      if(onAreaCalculated) onAreaCalculated(Math.round(r.width * r.height));
      return r;
    });
  };

  const handlePointerUp = () => {
    setDraggingHandle(null);
  };

  return (
    <div className="section-card spot-scanner">
      <strong>Scan Spot Area (OpenCV)</strong>
      <p className="muted">Use your camera and OpenCV to estimate the parking spot dimensions.</p>
      {analysisMeta && (
        <p className="muted" style={{ marginTop: 0 }}>
          {analysisMeta.fallback
            ? 'Using fallback estimate. Please adjust the box manually.'
            : analysisMeta.confidence !== null && analysisMeta.confidence < 0.6
              ? `Low confidence detection (${analysisMeta.confidence}). Please verify the box.`
              : analysisMeta.confidence !== null
                ? `Detection confidence: ${analysisMeta.confidence}`
                : 'Detection complete.'}
        </p>
      )}
      
      {!stream && !resultImage && (
        <button type="button" className="ghost-button" onClick={startCamera}>Start Camera</button>
      )}

      {stream && (
        <div className="scanner-video-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', background: '#000' }} />
          <button type="button" className="primary-button" style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }} onClick={capture}>
            Capture & Analyze
          </button>
        </div>
      )}
      
      {analyzing && <div className="loading-card" style={{minHeight: '120px'}}>Analyzing with Python OpenCV...</div>}
      
      {resultImage && !stream && !analyzing && (
        <div style={{ position: 'relative', display: 'inline-block', width: '100%', touchAction: 'none' }}>
          <img src={resultImage} alt="Captured" style={{ width: '100%', display: 'block', borderRadius: '12px' }} draggable="false" />
          
          {rect && (
            <svg 
              ref={svgRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', touchAction: 'none' }}
              viewBox={`0 0 ${canvasRef.current?.width || 100} ${canvasRef.current?.height || 100}`}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Highlight Region inside */}
              <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill="rgba(255,122,0,0.15)" stroke="#ff7a00" strokeWidth="3" />
              
              {/* Handles */}
              <circle cx={rect.x} cy={rect.y} r="12" fill="#fff" stroke="#ff7a00" strokeWidth="4" style={{ cursor: 'nwse-resize' }} onPointerDown={(e) => handlePointerDown(e, 'tl')} />
              <circle cx={rect.x + rect.width} cy={rect.y} r="12" fill="#fff" stroke="#ff7a00" strokeWidth="4" style={{ cursor: 'nesw-resize' }} onPointerDown={(e) => handlePointerDown(e, 'tr')} />
              <circle cx={rect.x} cy={rect.y + rect.height} r="12" fill="#fff" stroke="#ff7a00" strokeWidth="4" style={{ cursor: 'nesw-resize' }} onPointerDown={(e) => handlePointerDown(e, 'bl')} />
              <circle cx={rect.x + rect.width} cy={rect.y + rect.height} r="12" fill="#fff" stroke="#ff7a00" strokeWidth="4" style={{ cursor: 'nwse-resize' }} onPointerDown={(e) => handlePointerDown(e, 'br')} />
            </svg>
          )}
        </div>
      )}

      {resultImage && !stream && !analyzing && (
         <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
         <button type="button" className="ghost-button" onClick={startCamera}>Retake</button>
         {rect && <div className="location-banner" style={{flex: 1, margin: 0}}>Estimated Area: {Math.round(rect.width * rect.height)} px²</div>}
       </div>
      )}
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
