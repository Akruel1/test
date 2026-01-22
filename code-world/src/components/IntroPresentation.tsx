import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroPresentationProps {
  onComplete: () => void;
}

interface Slide {
  id: number;
  title: string;
  content: string;
  icon: string;
  code?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Добро пожаловать в CODE WORLD',
    content: 'Это не просто игра. Это мир, где код — единственный язык общения с реальностью.',
    icon: '🌐',
  },
  {
    id: 2,
    title: 'Программируй, чтобы жить',
    content: 'Забудь о кнопках и клавишах. Здесь твой персонаж подчиняется только написанному коду.',
    icon: '⌨️',
    code: `player.move("right", 3);
player.interact();`,
  },
  {
    id: 3,
    title: 'Выбери свой язык',
    content: 'JavaScript, Python или TypeScript — выбор за тобой. Каждый язык открывает путь к победе.',
    icon: '🔤',
  },
  {
    id: 4,
    title: 'Учись играя',
    content: 'Каждый уровень — это новая концепция программирования. Циклы, функции, условия — всё станет твоим оружием.',
    icon: '📚',
    code: `for (let i = 0; i < 5; i++) {
  player.move("up");
}`,
  },
  {
    id: 5,
    title: 'Создавай и экспериментируй',
    content: 'Нет единственно правильного решения. Твой код — твой путь. Экспериментируй и находи свой стиль.',
    icon: '🎨',
  },
  {
    id: 6,
    title: 'Готов начать?',
    content: 'Виртуальный мир ждёт своего создателя. Напиши свою первую строку кода и измени реальность.',
    icon: '🚀',
  },
];

const IntroPresentation = ({ onComplete }: IntroPresentationProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState('');

  const slide = slides[currentSlide];

  // Typing effect for content
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    
    let index = 0;
    const text = slide.content;
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [currentSlide, slide.content]);

  const nextSlide = () => {
    if (isTyping) {
      setDisplayedText(slide.content);
      setIsTyping(false);
    } else if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const skipIntro = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-dark-bg flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      {/* Animated background circles */}
      <motion.div
        className="absolute w-96 h-96 rounded-full border border-neon-blue/20"
        animate={{ scale: [1, 1.5, 1], rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full border border-neon-purple/20"
        animate={{ scale: [1.5, 1, 1.5], rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl w-full mx-4">
        {/* Skip Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-16 right-0 font-mono text-sm text-neon-blue/60 hover:text-neon-blue transition-colors"
          onClick={skipIntro}
        >
          Пропустить [ESC]
        </motion.button>

        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="panel p-8 md:p-12"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-6xl md:text-8xl mb-6 text-center"
            >
              {slide.icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-pixel text-xl md:text-2xl text-neon-blue text-center mb-6 neon-text"
            >
              {slide.title}
            </motion.h2>

            {/* Content with typing effect */}
            <div className="min-h-[80px] mb-6">
              <p className="font-mono text-lg text-gray-300 text-center leading-relaxed">
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-neon-blue"
                  >
                    |
                  </motion.span>
                )}
              </p>
            </div>

            {/* Code Example (if present) */}
            {slide.code && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-bg rounded-lg p-4 mb-6 border border-neon-blue/30"
              >
                <pre className="font-mono text-sm text-neon-green overflow-x-auto">
                  <code>{slide.code}</code>
                </pre>
              </motion.div>
            )}

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {slides.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
                    index === currentSlide
                      ? 'bg-neon-blue shadow-neon'
                      : index < currentSlide
                      ? 'bg-neon-purple'
                      : 'bg-dark-border'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => {
                    if (index <= currentSlide || !isTyping) {
                      setCurrentSlide(index);
                    }
                  }}
                />
              ))}
            </div>

            {/* Navigation Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextSlide}
              className="btn-neon w-full font-pixel text-sm"
            >
              {currentSlide === slides.length - 1 ? 'НАЧАТЬ ИГРУ' : 'ДАЛЕЕ'}
            </motion.button>
          </motion.div>
        </AnimatePresence>

        {/* Keyboard hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-4 text-xs text-gray-500 font-mono"
        >
          Нажми ПРОБЕЛ или кликни для продолжения
        </motion.p>
      </div>

      {/* Keyboard handler */}
      <KeyboardHandler
        onNext={nextSlide}
        onSkip={skipIntro}
      />
    </div>
  );
};

// Keyboard event handler component
const KeyboardHandler = ({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'Escape') {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onSkip]);

  return null;
};

export default IntroPresentation;
