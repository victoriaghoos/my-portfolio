import React, { useState, useEffect, useRef } from 'react';
import routineTrack from '../assets/music/Routine.mp3'; 
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false); 

  useEffect(() => {
    const audio = new Audio(routineTrack);
    audio.loop = true;
    audio.volume = 0.15;
    audioRef.current = audio;

    const handleFirstInteraction = () => {
      if (!audioRef.current) return;

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          cleanupListeners();
        })
        .catch(() => {
        });
    };

    const events = ['click', 'mousedown', 'touchstart', 'pointerdown', 'keydown'];

    const handleKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        handleFirstInteraction();
      }
    };

    const listeners = [];

    const addListener = (type, handler) => {
      document.addEventListener(type, handler, { passive: true });
      listeners.push({ type, handler });
    };

    const cleanupListeners = () => {
      listeners.forEach(({ type, handler }) => {
        document.removeEventListener(type, handler);
      });
      listeners.length = 0;
    };

    events.forEach((type) => {
      if (type === 'keydown') {
        addListener('keydown', handleKeyDown);
      } else {
        addListener(type, handleFirstInteraction);
      }
    });
    return () => {
      audio.pause();
      cleanupListeners();
    };
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`music-player-pill ${isPlaying ? 'active' : ''}`} 
      onClick={togglePlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="icon-wrapper">
        {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </div>

      <div className="text-container" style={{ position: 'relative', overflow: 'hidden', minWidth: '40px' }}>
        <AnimatePresence mode="wait">
          {!isPlaying ? (
            <motion.span 
              key="muted"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="music-status"
            >
              AUDIO MUTED
            </motion.span>
          ) : isHovered ? (
            <motion.span 
              key="artist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="music-status artist-info"
            >
              ROUTINE — EMROSS
            </motion.span>
          ) : (
            <motion.span 
              key="default"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="music-status"
            >
              LO-FI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {isPlaying && (
        <div className="visualizer">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      )}
    </motion.div>
  );
};

export default MusicPlayer;