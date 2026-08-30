import React, { useRef } from 'react';
import { Camera, Video } from 'lucide-react';

interface FileUploadProps {
  onFileUploaded: (file: File) => void;
  type: 'image' | 'video';
  label?: string; // Kept for API compatibility, but will be hidden or used as tooltip
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, type }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="inline-block">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={type === 'image' ? 'image/*' : 'video/*'} 
        onChange={(e) => e.target.files?.[0] && onFileUploaded(e.target.files[0])} 
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center"
        title={type === 'image' ? 'رفع صورة' : 'رفع فيديو'}
      >
        {type === 'image' ? <Camera className="w-5 h-5" /> : <Video className="w-5 h-5" />}
      </button>
    </div>
  );
};
