import React, { useState, useEffect, useRef } from 'react';
import { useHeartbeat } from '../hooks/useHeartbeat';
import { usePhoenix } from '../hooks/usePhoenix';
import { useLoadController } from '../hooks/useLoadController';
import './DebugPanel.css';

export default function DebugPanel() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showRealtime, setShowRealtime] = useState(true);
  const logsEndRef = useRef(null);

  const { stats: hbStats, isBeating, heartbeat } = useHeartbeat();
  const { stats: pxStats, isRegenerating, phoenix } = usePhoenix();
  const { stats: loadStats, loadController } = useLoadController();

  // Logger une entrée
  const addLog = (type, message, data = {}) => {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type,
      message,
      data
    };
    setLogs(prev => [...prev.slice(-200), entry]);
  };

  // Écouter tous les événements
  useEffect(() => {
    const unsubs = [];

    // Heartbeat events
    unsubs.push(heartbeat.on('pulse', (data) => {
      addLog('heartbeat', `Pulse #${data.count}`, data);
    }));

    unsubs.push(heartbeat.on('activity', (data) => {
      addLog('activity', `Activity recorded (${(data.intensity * 100).toFixed(0)}%)`, data);
    }));

    unsubs.push(heartbeat.on('birth', () => {
      addLog('system', 'Heartbeat started');
    }));

    unsubs.push(heartbeat.on('death', (data) => {
      addLog('system', `Heartbeat stopped (${data.totalPulses} pulses)`);
    }));

    // Phoenix events
    unsubs.push(phoenix.on('regeneration-start', (data) => {
      addLog('phoenix', `Regeneration started (Gen ${data.generation})`, data);
    }));

    unsubs.push(phoenix.on('regeneration-complete', (data) => {
      addLog('phoenix', `Regenerated to Gen ${data.generation}`, data);
    }));

    unsubs.push(phoenix.on('improvement-applied', (data) => {
      addLog('improvement', data.description, data);
    }));

    unsubs.push(phoenix.on('config-changed', (data) => {
      addLog('config', 'LLM config updated', data);
    }));

    // Load events
    unsubs.push(loadController.on('mode-changed', (data) => {
      addLog('load', `Mode changed to ${data.config.name}`, data);
    }));

    unsubs.push(loadController.on('scores-updated', (data) => {
      addLog('score', `Relevance: ${(data.relevance * 100).toFixed(0)}%, Interest: ${(data.interest * 100).toFixed(0)}%`, data);
    }));

    return () => unsubs.forEach(unsub => unsub());
  }, [heartbeat, phoenix, loadController]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.type === filter);

  const getIcon = (type) => {
    const icons = {
      heartbeat: '💓',
      phoenix: '🔥',
      improvement: '✨',
      activity: '⚡',
      load: '📊',
      score: '🎯',
      config: '⚙️',
      system: '🖥️'
    };
    return icons[type] || '📝';
  };

  const getColor = (type) => {
    const colors = {
      heartbeat: '#e63946',
      phoenix: '#ff6b35',
      improvement: '#ffd700',
      activity: '#00d9ff',
      load: '#28c840',
      score: '#a855f7',
      config: '#8b5cf6',
      system: '#64748b'
    };
    return colors[type] || '#888';
  };

  return (
    <div className="debug-panel">
      {/* Realtime Stats */}
      {showRealtime && (
        <div className="realtime-stats">
          <div className={`stat-card heartbeat ${isBeating ? 'pulse' : ''}`}>
            <span className="stat-icon">💓</span>
            <div className="stat-content">
              <span className="stat-value">{hbStats.bpm}</span>
              <span className="stat-label">BPM</span>
            </div>
          </div>
          <div className={`stat-card phoenix ${isRegenerating ? 'active' : ''}`}>
            <span className="stat-icon">🔥</span>
            <div className="stat-content">
              <span className="stat-value">Gen {pxStats.generation}</span>
              <span className="stat-label">Phoenix</span>
            </div>
          </div>
          <div className="stat-card load">
            <span className="stat-icon">⚡</span>
            <div className="stat-content">
              <span className="stat-value">{(loadStats.currentLoad * 100).toFixed(0)}%</span>
              <span className="stat-label">Charge</span>
            </div>
          </div>
          <div className="stat-card pulses">
            <span className="stat-icon">📈</span>
            <div className="stat-content">
              <span className="stat-value">{hbStats.pulseCount}</span>
              <span className="stat-label">Pulses</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="debug-controls">
        <div className="filter-buttons">
          {['all', 'heartbeat', 'phoenix', 'load', 'activity'].map(f => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '🔍' : getIcon(f)} {f}
            </button>
          ))}
        </div>
        <div className="toggle-buttons">
          <button
            className={autoScroll ? 'active' : ''}
            onClick={() => setAutoScroll(!autoScroll)}
          >
            ⬇️ Auto-scroll
          </button>
          <button
            className={showRealtime ? 'active' : ''}
            onClick={() => setShowRealtime(!showRealtime)}
          >
            📊 Stats
          </button>
          <button onClick={() => setLogs([])}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="debug-logs">
        {filteredLogs.map(log => (
          <div
            key={log.id}
            className="log-entry"
            style={{ borderLeftColor: getColor(log.type) }}
          >
            <span className="log-icon">{getIcon(log.type)}</span>
            <span className="log-time">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className="log-type" style={{ color: getColor(log.type) }}>
              [{log.type}]
            </span>
            <span className="log-message">{log.message}</span>
            {Object.keys(log.data).length > 0 && (
              <details className="log-data">
                <summary>data</summary>
                <pre>{JSON.stringify(log.data, null, 2)}</pre>
              </details>
            )}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      {/* JSON State Display */}
      <details className="state-display">
        <summary>📋 Full State JSON</summary>
        <pre>
{JSON.stringify({
  heartbeat: hbStats,
  phoenix: pxStats,
  load: loadStats
}, null, 2)}
        </pre>
      </details>
    </div>
  );
}
