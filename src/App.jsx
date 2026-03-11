import React from 'react';
import Board from './components/Board';
import AgentBoard from './components/AgentBoard';
import { useState } from 'react';
import { COLORS } from './utils/constants';

const App = () => {
  const [activeTab, setActiveTab] = useState('board');

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
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('board')}
            className="px-4 py-2 text-sm font-bold"
            style={{
              background: activeTab === 'board' ? COLORS.primary : '#3A3A3A',
              color: COLORS.light,
              border: `3px solid ${COLORS.dark}`,
              boxShadow: activeTab === 'board' 
                ? `4px 4px 0 ${COLORS.dark}` 
                : `2px 2px 0 ${COLORS.dark}`,
            }}
          >
            📋 Kanban Board
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className="px-4 py-2 text-sm font-bold"
            style={{
              background: activeTab === 'agents' ? COLORS.primary : '#3A3A3A',
              color: COLORS.light,
              border: `3px solid ${COLORS.dark}`,
              boxShadow: activeTab === 'agents' 
                ? `4px 4px 0 ${COLORS.dark}` 
                : `2px 2px 0 ${COLORS.dark}`,
            }}
          >
            🤖 Agent Activity
          </button>
        </div>

        {activeTab === 'board' ? <Board /> : <AgentBoard />}
      </div>
    </div>
  );
};

export default App;
