import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code, Cpu, Play } from 'lucide-react';

interface IntroPresentationProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: <Terminal size={64} />,
    title: "WELCOME USER",
    description: "You have entered a world controlled entirely by code.",
    color: "text-game-primary"
  },
  {
    icon: <Code size={64} />,
    title: "WRITE TO ACT",
    description: "No joysticks. No mouse clicks. Only algorithms define your path.",
    color: "text-game-secondary"
  },
  {
    icon: <Cpu size={64} />,
    title: "DEBUG REALITY",
    description: "Master the logic to reshape the environment and overcome obstacles.",
    color: "text-game-accent"
  }
];

const IntroPresentation: React.FC<IntroPresentationProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-game-bg flex flex-col items-center justify-center z-40 text-white font-mono" onClick={nextSlide}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center max-w-2xl px-8"
        >
          <div className={`mb-8 ${slides[currentSlide].color} animate-pulse`}>
            {slides[currentSlide].icon}
          </div>
          
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 tracking-wider ${slides[currentSlide].color}`}>
            {slides[currentSlide].title}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-12">
            {slides[currentSlide].description}
          </p>
        </motion.div>
      </AnimatePresence>

      <motion.div 
        className="absolute bottom-12 flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-gray-700'}`}
            />
          ))}
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          className="mt-4 px-8 py-3 border border-game-primary text-game-primary hover:bg-game-primary hover:text-black transition-all flex items-center gap-2 group"
        >
          {currentSlide === slides.length - 1 ? 'START SIMULATION' : 'NEXT'}
          <Play size={16} className={currentSlide === slides.length - 1 ? "group-hover:translate-x-1 transition-transform" : ""} />
        </button>
        
        <p className="text-xs text-gray-600 mt-2">Press SPACE or Click to continue</p>
      </motion.div>
    </div>
  );
};

export default IntroPresentation;
