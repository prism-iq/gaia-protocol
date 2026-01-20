import React from 'react';
import { useHeartbeat } from '../hooks/useHeartbeat';
import { usePhoenix } from '../hooks/usePhoenix';
import { useLoadController } from '../hooks/useLoadController';
import './HeartbeatMonitor.css';

export default function HeartbeatMonitor() {
  const { stats: hbStats, isBeating } = useHeartbeat();
  const { stats: pxStats, isRegenerating } = usePhoenix();
  const { stats: loadStats, curveData } = useLoadController();

  return (
    <div className="monitor-container">
      {/* Heartbeat Section */}
      <div className="monitor-section">
        <h3 className="section-title">
          <span className={`heart-icon ${isBeating ? 'beating' : ''}`}>💓</span>
          Heartbeat
        </h3>
        <div className="metrics-grid">
          <div className="metric">
            <span className="metric-value">{hbStats.bpm}</span>
            <span className="metric-label">BPM</span>
          </div>
          <div className="metric">
            <span className="metric-value">{hbStats.pulseCount}</span>
            <span className="metric-label">Pulses</span>
          </div>
          <div className="metric">
            <span className="metric-value">{(hbStats.health * 100).toFixed(0)}%</span>
            <span className="metric-label">Santé</span>
          </div>
          <div className="metric">
            <span className="metric-value">{(hbStats.activityLevel * 100).toFixed(0)}%</span>
            <span className="metric-label">Activité</span>
          </div>
        </div>
        <div className="pulse-visualizer">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="pulse-bar"
              style={{
                height: `${20 + Math.sin((hbStats.pulseCount + i) * 0.3) * 15}px`,
                opacity: i === 19 && isBeating ? 1 : 0.5
              }}
            />
          ))}
        </div>
      </div>

      {/* Phoenix Section */}
      <div className="monitor-section">
        <h3 className="section-title">
          <span className={`phoenix-icon ${isRegenerating ? 'regenerating' : ''}`}>🔥</span>
          Phoenix Engine
        </h3>
        <div className="metrics-grid">
          <div className="metric">
            <span className="metric-value">Gen {pxStats.generation}</span>
            <span className="metric-label">Génération</span>
          </div>
          <div className="metric">
            <span className="metric-value">{pxStats.totalImprovements}</span>
            <span className="metric-label">Améliorations</span>
          </div>
          <div className="metric">
            <span className="metric-value">{pxStats.versionsStored}</span>
            <span className="metric-label">Versions</span>
          </div>
        </div>
        {isRegenerating && (
          <div className="regeneration-status">
            <span className="regeneration-spinner"></span>
            Régénération en cours...
          </div>
        )}
      </div>

      {/* Load Controller Section */}
      <div className="monitor-section">
        <h3 className="section-title">
          <span className="load-icon">⚡</span>
          Charge CPU
        </h3>
        <div className="load-bar-container">
          <div
            className="load-bar"
            style={{
              width: `${loadStats.currentLoad * 100}%`,
              background: getLoadColor(loadStats.currentLoad)
            }}
          />
          <span className="load-percentage">{(loadStats.currentLoad * 100).toFixed(0)}%</span>
        </div>
        <div className="load-info">
          <span>Mode: <strong>{loadStats.modeConfig?.name || 'Équilibré'}</strong></span>
          <span>Pertinence: {(loadStats.relevanceScore * 100).toFixed(0)}%</span>
          <span>Intérêt: {(loadStats.interestScore * 100).toFixed(0)}%</span>
        </div>

        {/* Mini courbe de charge */}
        <div className="load-curve-mini">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none">
            <path
              d={generateCurvePath(curveData)}
              fill="none"
              stroke="var(--phoenix-primary)"
              strokeWidth="2"
            />
            <circle
              cx={loadStats.relevanceScore * 100}
              cy={40 - loadStats.currentLoad * 40}
              r="4"
              fill="var(--phoenix-glow)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function getLoadColor(load) {
  if (load < 0.3) return 'linear-gradient(90deg, #28c840, #5cd85c)';
  if (load < 0.6) return 'linear-gradient(90deg, #febc2e, #ffd666)';
  if (load < 0.85) return 'linear-gradient(90deg, #ff9500, #ffb347)';
  return 'linear-gradient(90deg, #ff5f57, #ff7b73)';
}

function generateCurvePath(data) {
  if (!data || data.length === 0) return '';
  const points = data.map((d, i) =>
    `${(i / (data.length - 1)) * 100},${40 - d.load * 40}`
  );
  return `M${points.join(' L')}`;
}
