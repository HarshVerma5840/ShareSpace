import { useState, useRef, useEffect, useCallback } from 'react';

export default function useSpotScanner({ onAreaCalculated } = {}) {
  const [stream, setStream] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [rect, setRect] = useState(null);
  const [analysisMeta, setAnalysisMeta] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setResultImage(null);
    setRect(null);
    setAnalysisMeta(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      alert("Could not access camera.");
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    
    // Set actual video resolution to canvas
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    setAnalyzing(true);
    canvas.toBlob(async (blob) => {
      setResultImage(URL.createObjectURL(blob));
      stopCamera();
      
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      try {
        const aiApiUrl = import.meta.env.VITE_AI_API_URL || `http://${window.location.hostname}:8000/analyze`;
        const res = await fetch(aiApiUrl, {
          method: 'POST',
          body: formData
        });
        const json = await res.json();
        if (json.rect) {
           setRect(json.rect);
           setAnalysisMeta({
             confidence: typeof json.confidence === 'number' ? json.confidence : null,
             fallback: Boolean(json.fallback)
           });
           if(onAreaCalculated) onAreaCalculated(json.areaPx);
        }
      } catch(e) {
        console.warn('OpenCV backend error', e);
        // Fallback default box
        setRect({ x: canvas.width*0.25, y: canvas.height*0.25, width: canvas.width*0.5, height: canvas.height*0.5 });
        setAnalysisMeta({ confidence: null, fallback: true });
      }
      setAnalyzing(false);
    }, 'image/jpeg');
  }, [stopCamera, onAreaCalculated]);

  return {
    stream,
    analyzing,
    resultImage,
    rect,
    setRect,
    analysisMeta,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capture
  };
}
