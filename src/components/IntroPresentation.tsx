import { FC } from 'react';
import { motion } from 'framer-motion';

interface IntroPresentationProps {
  onComplete: () => void;
}

const IntroPresentation: FC<IntroPresentationProps> = ({ onComplete }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'rgba(15, 15, 19, 0.95)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 style={{ color: '#bd00ff', marginBottom: '20px' }}>CODE WORLD</h1>
        <p style={{ maxWidth: '600px', lineHeight: '1.6', fontSize: '1.2rem' }}>
          Добро пожаловать в мир, где код — это единственное оружие и инструмент.
          <br/><br/>
          Здесь нет кнопок движения. Нет джойстика.
          <br/>
          Только ты и твой интеллект.
        </p>
        <button
          onClick={onComplete}
          style={{
            marginTop: '40px',
            padding: '10px 30px',
            background: 'transparent',
            border: '2px solid #00ff9d',
            color: '#00ff9d',
            fontSize: '1.2rem',
            boxShadow: '0 0 15px rgba(0, 255, 157, 0.3)'
          }}
        >
          START_SESSION()
        </button>
      </motion.div>
    </div>
  );
};

export default IntroPresentation;
