import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import introVideo from "@assets/Animated_logo_intro_1080p_202512252306_1766700376020.mp4";

export default function IntroPage() {
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleVideoEnd = () => {
    setLocation("/home");
  };

  const handleSkip = () => {
    setLocation("/home");
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[100]">
      <video
        ref={videoRef}
        src={introVideo}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="max-w-full max-h-full object-contain"
        data-testid="video-intro"
      />
      
      {showSkip && (
        <button
          onClick={handleSkip}
          className="absolute bottom-8 right-8 px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors backdrop-blur-sm bg-white/10 rounded-full"
          data-testid="button-skip-intro"
        >
          Skip Intro
        </button>
      )}
    </div>
  );
}
