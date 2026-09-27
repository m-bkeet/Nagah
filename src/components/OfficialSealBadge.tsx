import React from 'react';
import { useCenter } from '../context/CenterContext';
import { handleLogoError } from '../utils/centerLogo';

export const OfficialSealBadge: React.FC<{
  sealUrl?: string;
  className?: string;
}> = ({ sealUrl, className = '' }) => {
  const { settings } = useCenter();
  const effectiveSeal = sealUrl || settings?.sealImageUrl;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {effectiveSeal ? (
        <img 
          src={effectiveSeal} 
          alt="الختم الرسمي المعتمد" 
          className="w-full h-full object-contain" 
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-full min-w-14 min-h-14 rounded-full border-2 border-amber-500/80 flex flex-col items-center justify-center p-1 text-center bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-[9px] shadow-xs select-none">
          <span className="font-black leading-tight text-[10px]">{settings?.centerName ? settings.centerName.slice(0, 16) : 'مركز النجاح'}</span>
          <span className="text-[7.5px] font-mono tracking-wider text-amber-600 dark:text-amber-300">معتمد رسمياً ★</span>
        </div>
      )}
    </div>
  );
};
