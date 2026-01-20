import React, { useState, useRef, useEffect } from 'react';
import { useHeartbeat } from '../hooks/useHeartbeat';
import { usePhoenix } from '../hooks/usePhoenix';
import { useLoadController } from '../hooks/useLoadController';
import './Chat.css';

// Analyseur de contenu pour déterminer la pertinence
function analyzeContent(text) {
  const indicators = {
    scientific: /\b(research|study|data|analysis|hypothesis|experiment|theory)\b/gi,
    technical: /\b(function|algorithm|implementation|code|system|architecture)\b/gi,
    casual: /\b(lol|haha|cool|nice|hey|sup|yo)\b/gi,
    question: /\?/g,
    complex: /\b\w{10,}\b/g // Mots longs = complexité
  };

  let relevance = 0.5;
  let interest = 0.5;

  const scientificMatches = (text.match(indicators.scientific) || []).length;
  const technicalMatches = (text.match(indicators.technical) || []).length;
  const casualMatches = (text.match(indicators.casual) || []).length;
  const questionMarks = (text.match(indicators.question) || []).length;
  const complexWords = (text.match(indicators.complex) || []).length;

  // Calcul de pertinence
  relevance += scientificMatches * 0.1;
  relevance += technicalMatches * 0.08;
  relevance -= casualMatches * 0.15;
  relevance += complexWords * 0.02;
  relevance += questionMarks * 0.05;

  // Calcul d'intérêt
  interest = (text.length > 100) ? 0.7 : 0.4;
  interest += questionMarks * 0.1;

  return {
    relevance: Math.max(0, Math.min(1, relevance)),
    interest: Math.max(0, Math.min(1, interest))
  };
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const { stats: heartbeatStats, isBeating, start, recordActivity } = useHeartbeat();
  const { stats: phoenixStats, isRegenerating } = usePhoenix();
  const { stats: loadStats, updateScores, getLLMParams } = useLoadController();

  // Démarrer le heartbeat au montage
  useEffect(() => {
    start();
  }, [start]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Analyser le contenu pour ajuster la charge
    const analysis = analyzeContent(input);
    updateScores(analysis.relevance, analysis.interest);

    // Enregistrer l'activité
    recordActivity(0.6);

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      analysis
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simuler une réponse (à connecter avec un vrai LLM)
    const llmParams = getLLMParams();

    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: generateResponse(input, llmParams),
        timestamp: new Date(),
        llmParams: llmParams._loadInfo
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      recordActivity(0.3);
    }, 1000 + Math.random() * 1500);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
            <div className="message-meta">
              {msg.role === 'user' && msg.analysis && (
                <span className="relevance-badge">
                  Pertinence: {(msg.analysis.relevance * 100).toFixed(0)}%
                </span>
              )}
              {msg.role === 'assistant' && msg.llmParams && (
                <span className="load-badge">
                  Charge: {(msg.llmParams.currentLoad * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message assistant typing">
            <span className="typing-indicator">
              <span></span><span></span><span></span>
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre message..."
          className="chat-input"
        />
        <button type="submit" className="chat-submit">
          Envoyer
        </button>
      </form>
    </div>
  );
}

// Générateur de réponse simulé
function generateResponse(input, params) {
  const responses = {
    high: [
      "Analyse approfondie en cours avec ressources maximales...",
      "Question pertinente détectée. Traitement haute priorité activé.",
      "Exécution avec paramètres optimaux pour une réponse de qualité."
    ],
    medium: [
      "Traitement équilibré de votre demande.",
      "Analyse standard en cours...",
      "Réponse en mode balanced."
    ],
    low: [
      "Réponse rapide en mode économique.",
      "Traitement léger activé.",
      "Mode eco: réponse concise."
    ]
  };

  const load = params._loadInfo?.currentLoad || 0.5;
  const category = load > 0.7 ? 'high' : load > 0.4 ? 'medium' : 'low';
  const base = responses[category][Math.floor(Math.random() * responses[category].length)];

  return `${base}\n\nVotre message: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"`;
}
