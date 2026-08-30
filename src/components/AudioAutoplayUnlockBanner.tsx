import React, { useEffect } from 'react';
import { audioService } from '../services/audioService';

export const AudioAutoplayUnlockBanner: React.FC = () => {
  useEffect(() => {
    // Automatically unlock audio in the background without showing any prompt or banner
    audioService.unlockAudio();
  }, []);

  return null;
};

