import { useState, useEffect, useCallback } from 'react';
import { heartbeat } from '../systems/Heartbeat.js';

export function useHeartbeat() {
  const [stats, setStats] = useState(heartbeat.getStats());
  const [lastPulse, setLastPulse] = useState(null);
  const [isBeating, setIsBeating] = useState(false);

  useEffect(() => {
    const unsubPulse = heartbeat.on('pulse', (data) => {
      setLastPulse(data);
      setStats(heartbeat.getStats());
      setIsBeating(true);
      setTimeout(() => setIsBeating(false), 200);
    });

    const unsubBirth = heartbeat.on('birth', () => {
      setStats(heartbeat.getStats());
    });

    const unsubDeath = heartbeat.on('death', () => {
      setStats(heartbeat.getStats());
    });

    return () => {
      unsubPulse();
      unsubBirth();
      unsubDeath();
    };
  }, []);

  const start = useCallback(() => heartbeat.start(), []);
  const stop = useCallback(() => heartbeat.stop(), []);
  const recordActivity = useCallback((intensity) => heartbeat.recordActivity(intensity), []);

  return {
    stats,
    lastPulse,
    isBeating,
    start,
    stop,
    recordActivity,
    heartbeat
  };
}
