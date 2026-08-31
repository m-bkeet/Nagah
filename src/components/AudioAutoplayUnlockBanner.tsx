import React, { useEffect } from 'react';
import { audioService } from '../services/audioService';

export const AudioAutoplayUnlockBanner: React.FC = () => {
  useEffect(() => {
    try {
      audioService.unlockAudio();
    } catch (e) {
      console.warn('[AudioAutoplayUnlockBanner] Auto-unlock audio error:', e);
    }
  }, []);

  return null;
};

