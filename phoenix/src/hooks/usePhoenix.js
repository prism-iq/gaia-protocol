import { useState, useEffect, useCallback } from 'react';
import { phoenix } from '../systems/Phoenix.js';

export function usePhoenix() {
  const [stats, setStats] = useState(phoenix.getStats());
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [lastImprovement, setLastImprovement] = useState(null);

  useEffect(() => {
    const unsubStart = phoenix.on('regeneration-start', () => {
      setIsRegenerating(true);
    });

    const unsubComplete = phoenix.on('regeneration-complete', (data) => {
      setIsRegenerating(false);
      setStats(phoenix.getStats());
      if (data.improvements.length > 0) {
        setLastImprovement(data.improvements[data.improvements.length - 1]);
      }
    });

    const unsubError = phoenix.on('regeneration-error', () => {
      setIsRegenerating(false);
    });

    const unsubConfig = phoenix.on('config-changed', () => {
      setStats(phoenix.getStats());
    });

    return () => {
      unsubStart();
      unsubComplete();
      unsubError();
      unsubConfig();
    };
  }, []);

  const configure = useCallback((config) => phoenix.configureLLM(config), []);
  const applyPreset = useCallback((preset) => phoenix.applyPreset(preset), []);
  const rollback = useCallback((gen) => phoenix.rollback(gen), []);

  return {
    stats,
    isRegenerating,
    lastImprovement,
    configure,
    applyPreset,
    rollback,
    phoenix
  };
}
