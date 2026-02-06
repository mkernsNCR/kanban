import React from 'react';
import Board from './components/Board';

const App = () => {
  return (
    <div
      className="kanban-app min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
        fontFamily: '"Space Grotesk", sans-serif',
        padding: '20px',
      }}
    >
      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      <div className="relative z-10">
        <Board />
      </div>
    </div>
  );
};

export default App;
