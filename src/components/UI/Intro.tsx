import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { Terminal, Code, Gamepad2, Play } from 'lucide-react';

export const Intro: React.FC = () => {
  const { setView } = useAppStore();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 text-green-400 font-mono flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 glitch-text">CODE UNIVERSE</h1>
          <p className="text-xl opacity-80">Мир, управляемый кодом</p>
        </motion.div>

        <div className="space-y-8">
          {step >= 0 && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 bg-gray-800 p-6 rounded-lg border border-green-500/30"
            >
              <Terminal size={32} />
              <div>
                <h3 className="text-lg font-bold">Игровой программируемый мир</h3>
                <p className="text-sm opacity-70">Все взаимодействия происходят через код. Вы - архитектор этой реальности.</p>
              </div>
            </motion.div>
          )}

          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 bg-gray-800 p-6 rounded-lg border border-purple-500/30 text-purple-400"
            >
              <Code size={32} />
              <div>
                <h3 className="text-lg font-bold">Интерактивная среда</h3>
                <p className="text-sm opacity-70">Python, Java, C++. Выбирайте свой инструмент и экспериментируйте.</p>
              </div>
            </motion.div>
          )}

          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 bg-gray-800 p-6 rounded-lg border border-blue-500/30 text-blue-400"
            >
              <Gamepad2 size={32} />
              <div>
                <h3 className="text-lg font-bold">Песочница креатива</h3>
                <p className="text-sm opacity-70">Решайте задачи логикой. Ошибки - это часть игрового процесса.</p>
              </div>
            </motion.div>
          )}
        </div>

        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 text-center"
          >
            <button
              onClick={() => setView('game')}
              className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <span className="mr-2">ЗАПУСТИТЬ СИСТЕМУ</span>
              <Play size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
