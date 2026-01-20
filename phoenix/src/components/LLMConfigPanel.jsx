import React, { useState } from 'react';
import { usePhoenix } from '../hooks/usePhoenix';
import { useLoadController } from '../hooks/useLoadController';
import './LLMConfigPanel.css';

const MODELS = [
  { id: 'gpt-4', name: 'GPT-4', desc: 'Plus précis, plus lent' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5', desc: 'Rapide, économique' },
  { id: 'claude-3', name: 'Claude 3', desc: 'Équilibré, créatif' },
  { id: 'llama-2', name: 'Llama 2', desc: 'Open source, local' },
  { id: 'mixtral', name: 'Mixtral', desc: 'MoE, efficient' }
];

export default function LLMConfigPanel() {
  const { stats, configure, applyPreset } = usePhoenix();
  const { stats: loadStats, setMode } = useLoadController();
  const [activeTab, setActiveTab] = useState('basic');

  const config = stats.llmConfig || {};

  const handleSliderChange = (param, value) => {
    configure({ [param]: parseFloat(value) });
  };

  return (
    <div className="llm-panel">
      <div className="panel-header">
        <h3>Configuration LLM</h3>
        <div className="tabs">
          <button
            className={activeTab === 'basic' ? 'active' : ''}
            onClick={() => setActiveTab('basic')}
          >
            Base
          </button>
          <button
            className={activeTab === 'advanced' ? 'active' : ''}
            onClick={() => setActiveTab('advanced')}
          >
            Avancé
          </button>
          <button
            className={activeTab === 'presets' ? 'active' : ''}
            onClick={() => setActiveTab('presets')}
          >
            Presets
          </button>
        </div>
      </div>

      <div className="panel-content">
        {activeTab === 'basic' && (
          <div className="config-section">
            {/* Sélection du modèle */}
            <div className="config-group">
              <label>Modèle</label>
              <div className="model-selector">
                {MODELS.map(model => (
                  <button
                    key={model.id}
                    className={`model-btn ${config.model === model.id ? 'selected' : ''}`}
                    onClick={() => configure({ model: model.id })}
                  >
                    <span className="model-name">{model.name}</span>
                    <span className="model-desc">{model.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature */}
            <div className="config-group">
              <div className="slider-header">
                <label>Température</label>
                <span className="slider-value">{config.temperature?.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={config.temperature || 0.7}
                onChange={(e) => handleSliderChange('temperature', e.target.value)}
                className="slider"
              />
              <div className="slider-labels">
                <span>Précis</span>
                <span>Créatif</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div className="config-group">
              <div className="slider-header">
                <label>Tokens max</label>
                <span className="slider-value">{config.max_tokens}</span>
              </div>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={config.max_tokens || 2048}
                onChange={(e) => handleSliderChange('max_tokens', e.target.value)}
                className="slider"
              />
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="config-section">
            {/* Top P */}
            <div className="config-group">
              <div className="slider-header">
                <label>Top P (Nucleus)</label>
                <span className="slider-value">{config.top_p?.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.top_p || 0.9}
                onChange={(e) => handleSliderChange('top_p', e.target.value)}
                className="slider"
              />
            </div>

            {/* Top K */}
            <div className="config-group">
              <div className="slider-header">
                <label>Top K</label>
                <span className="slider-value">{config.top_k}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={config.top_k || 40}
                onChange={(e) => handleSliderChange('top_k', e.target.value)}
                className="slider"
              />
            </div>

            {/* Frequency Penalty */}
            <div className="config-group">
              <div className="slider-header">
                <label>Pénalité fréquence</label>
                <span className="slider-value">{config.frequency_penalty?.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={config.frequency_penalty || 0}
                onChange={(e) => handleSliderChange('frequency_penalty', e.target.value)}
                className="slider"
              />
            </div>

            {/* Phoenix Aggressiveness */}
            <div className="config-group">
              <div className="slider-header">
                <label>Agressivité Phoenix</label>
                <span className="slider-value">{(config.aggressiveness * 100)?.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.aggressiveness || 0.5}
                onChange={(e) => handleSliderChange('aggressiveness', e.target.value)}
                className="slider"
              />
              <div className="slider-labels">
                <span>Conservateur</span>
                <span>Radical</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="config-section">
            <div className="presets-grid">
              {Object.entries(config.presets || {}).map(([key, preset]) => (
                <button
                  key={key}
                  className="preset-card"
                  onClick={() => applyPreset(key)}
                >
                  <span className="preset-icon">
                    {key === 'conservative' && '🛡️'}
                    {key === 'balanced' && '⚖️'}
                    {key === 'creative' && '🎨'}
                    {key === 'experimental' && '🧪'}
                  </span>
                  <span className="preset-name">{key}</span>
                  <span className="preset-temp">T: {preset.temperature}</span>
                </button>
              ))}
            </div>

            <h4 className="subsection-title">Mode de charge</h4>
            <div className="load-modes">
              {['eco', 'balanced', 'quality', 'max'].map(mode => (
                <button
                  key={mode}
                  className={`load-mode-btn ${loadStats.mode === mode ? 'active' : ''}`}
                  onClick={() => setMode(mode)}
                >
                  {mode === 'eco' && '🌱'}
                  {mode === 'balanced' && '⚡'}
                  {mode === 'quality' && '💎'}
                  {mode === 'max' && '🚀'}
                  <span>{mode}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="panel-footer">
        <span className="status-dot active"></span>
        <span>Gen {stats.generation} | {config.model}</span>
      </div>
    </div>
  );
}
