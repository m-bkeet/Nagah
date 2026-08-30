import React from 'react';

export const OfficialSealBadge: React.FC<{
  sealUrl?: string;
  className?: string;
}> = ({ sealUrl, className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {sealUrl ? (
        <img src={sealUrl} alt="الختم الرسمي" className="w-20 h-20 object-contain" />
      ) : (
        <div className="w-20 h-20 rounded-full border-2 border-amber-500/80 flex flex-col items-center justify-center p-1 text-center bg-amber-500/10 text-amber-600 font-bold text-[9px]">
          <span>مركز النجاح</span>
          <span className="text-[7px]">معتمد رسمياً</span>
        </div>
      )}
    </div>
  );
};
