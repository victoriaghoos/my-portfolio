import { useState, useEffect, useRef } from 'react';
import routineTrack from '../assets/music/Routine.mp3';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // The track only ever plays when the visitor presses the pill: no autoplay, and no starting on
  // the first click elsewhere on the page.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.src = routineTrack;
    audio.loop = true;
    audio.volume = 0.15;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`music-player-pill ${isPlaying ? 'active' : ''}`}
      aria-label={isPlaying ? 'Mute background audio' : 'Play background audio'}
      aria-pressed={isPlaying}
      onClick={togglePlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="icon-wrapper">
        {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </div>

      <div
        className="text-container"
        style={{ position: 'relative', overflow: 'hidden', minWidth: '40px' }}
      >
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
    </motion.button>
  );
};

export default MusicPlayer;
