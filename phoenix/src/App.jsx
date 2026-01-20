import React, { useState, useEffect } from 'react';
import DraggableTerminal from './components/DraggableTerminal';
import Chat from './components/Chat';
import HeartbeatMonitor from './components/HeartbeatMonitor';
import LLMConfigPanel from './components/LLMConfigPanel';
import DebugPanel from './components/DebugPanel';
import { phoenix } from './systems/Phoenix';
import './App.css';

export default function App() {
  const [showChat, setShowChat] = useState(true);
  const [showMonitor, setShowMonitor] = useState(true);
  const [showConfig, setShowConfig] = useState(true);
  const [showDebug, setShowDebug] = useState(true);

  useEffect(() => {
    // Initialiser Phoenix au démarrage
    phoenix.init();
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🔥</span>
          <span className="logo-text">Flow Chat Phoenix</span>
        </div>
        <nav className="toolbar">
          <button
            className={showChat ? 'active' : ''}
            onClick={() => setShowChat(!showChat)}
          >
            💬 Chat
          </button>
          <button
            className={showMonitor ? 'active' : ''}
            onClick={() => setShowMonitor(!showMonitor)}
          >
            💓 Monitor
          </button>
          <button
            className={showConfig ? 'active' : ''}
            onClick={() => setShowConfig(!showConfig)}
          >
            ⚙️ Config
          </button>
          <button
            className={showDebug ? 'active' : ''}
            onClick={() => setShowDebug(!showDebug)}
          >
            🐛 Debug
          </button>
        </nav>
      </header>

      {/* Main workspace */}
      <main className="workspace">
        {showChat && (
          <DraggableTerminal
            title="Flow Chat"
            onClose={() => setShowChat(false)}
          >
            <Chat />
          </DraggableTerminal>
        )}

        {showMonitor && (
          <DraggableTerminal
            title="Heartbeat Monitor"
            onClose={() => setShowMonitor(false)}
          >
            <HeartbeatMonitor />
          </DraggableTerminal>
        )}

        {showConfig && (
          <DraggableTerminal
            title="LLM Configuration"
            onClose={() => setShowConfig(false)}
          >
            <LLMConfigPanel />
          </DraggableTerminal>
        )}

        {showDebug && (
          <DraggableTerminal
            title="Debug Console"
            onClose={() => setShowDebug(false)}
          >
            <DebugPanel />
          </DraggableTerminal>
        )}
      </main>

      {/* Background animation */}
      <div className="bg-animation">
        <div className="phoenix-particle"></div>
        <div className="phoenix-particle"></div>
        <div className="phoenix-particle"></div>
      </div>
    </div>
  );
}
