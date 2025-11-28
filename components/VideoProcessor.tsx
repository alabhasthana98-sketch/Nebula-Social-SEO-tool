
import React, { useRef, useState } from 'react';

interface VideoProcessorProps {
  onFramesExtracted: (frames: string[]) => void;
  isProcessing: boolean;
}

const VideoProcessor: React.FC<VideoProcessorProps> = ({ onFramesExtracted, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    // Create URL for the video file
    const fileUrl = URL.createObjectURL(file);
    
    if (videoRef.current) {
      videoRef.current.src = fileUrl;
      // Wait for metadata to load to get duration
      videoRef.current.onloadedmetadata = () => {
        extractFrames(videoRef.current!, fileUrl);
      };
    }
  };

  const extractFrames = async (video: HTMLVideoElement, url: string) => {
    if (!canvasRef.current) return;
    
    const duration = video.duration;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];
    
    // We will take 5 snapshots spread across the video
    // This allows analyzing "500MB videos" without uploading the full file
    // by only sending ~5 images to Gemini.
    const snapshotCount = 5;
    const interval = duration / (snapshotCount + 1);

    setProgress(10);

    for (let i = 1; i <= snapshotCount; i++) {
      const time = interval * i;
      
      // Seek
      video.currentTime = time;
      
      // Wait for seek to complete
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
      });

      // Draw to canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      // Scale down slightly if massive to save tokens/bandwidth
      const maxDim = 1024;
      if (canvas.width > maxDim || canvas.height > maxDim) {
          const ratio = Math.min(maxDim / canvas.width, maxDim / canvas.height);
          canvas.width = canvas.width * ratio;
          canvas.height = canvas.height * ratio;
      }
      
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64 (jpeg for compression)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      // Remove prefix for API
      const base64 = dataUrl.split(',')[1];
      frames.push(base64);
      
      setProgress(10 + (i / snapshotCount) * 90);
    }

    // Cleanup
    URL.revokeObjectURL(url);
    onFramesExtracted(frames);
    setProgress(100);
  };

  return (
    <div className="w-full h-full">
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div 
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`
          relative h-full min-h-[100px] border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center
          ${isProcessing ? 'opacity-50 cursor-not-allowed border-gray-600' : 'border-gray-600 hover:border-nebula-cyan hover:bg-space-900/50'}
        `}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
           <svg className="w-8 h-8 text-nebula-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.818v6.364a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
           <span className="text-sm text-gray-300 font-medium truncate max-w-[150px]">
             {fileName ? fileName : "Upload Video"}
           </span>
           {!fileName && (
            <span className="text-xs text-gray-500">
             Smart Frame Analysis
            </span>
           )}
        </div>

        {progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 h-1 bg-nebula-cyan transition-all duration-300" style={{ width: `${progress}%` }}></div>
        )}
      </div>

      {/* Hidden elements for processing */}
      <video ref={videoRef} className="hidden" crossOrigin="anonymous" playsInline muted></video>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default VideoProcessor;
