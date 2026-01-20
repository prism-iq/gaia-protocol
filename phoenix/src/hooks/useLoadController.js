import { useState, useEffect, useCallback } from 'react';
import { loadController } from '../systems/LoadController.js';

export function useLoadController() {
  const [stats, setStats] = useState(loadController.getStats());
  const [curveData, setCurveData] = useState(loadController.getCurveData());

  useEffect(() => {
    const unsubMode = loadController.on('mode-changed', () => {
      setStats(loadController.getStats());
    });

    const unsubScores = loadController.on('scores-updated', () => {
      setStats(loadController.getStats());
    });

    const unsubLoad = loadController.on('load-adapted', () => {
      setStats(loadController.getStats());
    });

    const unsubCurve = loadController.on('curve-changed', () => {
      setCurveData(loadController.getCurveData());
    });

    return () => {
      unsubMode();
      unsubScores();
      unsubLoad();
      unsubCurve();
    };
  }, []);

  const setMode = useCallback((mode) => loadController.setQualityMode(mode), []);
  const updateScores = useCallback((r, i) => loadController.updateScores(r, i), []);
  const setCurve = useCallback((config) => loadController.setCurve(config), []);
  const getLLMParams = useCallback(() => loadController.getLLMParams(), []);

  return {
    stats,
    curveData,
    setMode,
    updateScores,
    setCurve,
    getLLMParams,
    loadController
  };
}
