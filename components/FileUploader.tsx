
import React, { useRef, useState } from 'react';
import { MediaAsset } from '../types';

interface FileUploaderProps {
  onFilesSelected: (files: MediaAsset[]) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<MediaAsset[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setErrorMessage(null);
    const newAssets: MediaAsset[] = [];
    let errorCount = 0;
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const base64 = await readFileAsBase64(file);
        newAssets.push({
          data: base64,
          mimeType: file.type,
          name: file.name
        });
      } catch (err) {
        console.error(`Failed to process file: ${file.name}`, err);
        errorCount++;
      }
    }

    if (errorCount > 0) {
        setErrorMessage(`Failed to process ${errorCount} file(s). Please try again.`);
    }

    if (newAssets.length > 0) {
        setFiles(prev => {
            const updated = [...prev, ...newAssets];
            onFilesSelected(updated);
            return updated;
        });
    }
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (!result) {
            reject(new Error("File reading result is empty"));
            return;
        }
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("File reading failed"));
      reader.onabort = () => reject(new Error("File reading aborted"));
      
      try {
        reader.readAsDataURL(file);
      } catch (e) {
        reject(e);
      }
    });
  };

  return (
    <div className="w-full h-full relative">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,application/pdf"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div 
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative h-full min-h-[100px] border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center
          ${disabled ? 'opacity-50 cursor-not-allowed border-gray-600' : 'border-gray-600 hover:border-nebula-purple hover:bg-space-900/50'}
          ${errorMessage ? 'border-red-500/50 bg-red-500/5' : ''}
        `}
      >
        {files.length === 0 ? (
            <>
                <svg className={`w-8 h-8 mb-2 ${errorMessage ? 'text-red-400' : 'text-nebula-purple'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span className={`text-sm font-medium ${errorMessage ? 'text-red-300' : 'text-gray-300'}`}>
                {errorMessage ? "Upload Failed" : "Upload Images / PDF"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                {errorMessage ? errorMessage : "Carousel or Doc Analysis"}
                </span>
            </>
        ) : (
            <div className="w-full space-y-2">
                <div className="text-xs text-nebula-purple font-bold uppercase tracking-wider mb-2">
                    {files.length} Files Attached
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                    {files.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-xs bg-space-800 px-2 py-1 rounded text-gray-300 truncate max-w-[80px]">
                            {f.name}
                        </span>
                    ))}
                    {files.length > 3 && (
                        <span className="text-xs bg-space-800 px-2 py-1 rounded text-gray-400">
                            +{files.length - 3}
                        </span>
                    )}
                </div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setFiles([]); onFilesSelected([]); setErrorMessage(null); }}
                    className="text-xs text-red-400 hover:text-red-300 mt-2 underline"
                 >
                    Clear All
                 </button>
            </div>
        )}
        
        {/* Error overlay for partial success or if files exist but last upload failed */}
        {errorMessage && files.length > 0 && (
             <div className="absolute bottom-2 left-0 w-full text-center">
                 <span className="text-[10px] text-red-400 bg-space-950/80 px-2 py-1 rounded border border-red-500/20">
                    {errorMessage}
                 </span>
             </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
