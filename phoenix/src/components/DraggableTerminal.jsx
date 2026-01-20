import React, { useState, useRef, useCallback } from 'react';
import './DraggableTerminal.css';

export default function DraggableTerminal({ children, title = 'Terminal', onClose }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const terminalRef = useRef(null);
  const previousState = useRef({ position: null, size: null });

  const handleMouseDown = useCallback((e) => {
    if (isMaximized) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.preventDefault();
  }, [position, isMaximized]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, e.clientX - dragOffset.current.x),
        y: Math.max(0, e.clientY - dragOffset.current.y)
      });
    } else if (isResizing) {
      const rect = terminalRef.current.getBoundingClientRect();
      setSize({
        width: Math.max(300, e.clientX - rect.left),
        height: Math.max(200, e.clientY - rect.top)
      });
    }
  }, [isDragging, isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const toggleMaximize = () => {
    if (isMaximized) {
      setPosition(previousState.current.position);
      setSize(previousState.current.size);
    } else {
      previousState.current = { position, size };
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    setIsMaximized(!isMaximized);
  };

  if (isMinimized) {
    return (
      <div className="terminal-minimized" onClick={() => setIsMinimized(false)}>
        <span className="terminal-icon">▢</span>
        <span>{title}</span>
      </div>
    );
  }

  return (
    <div
      ref={terminalRef}
      className={`draggable-terminal ${isDragging ? 'dragging' : ''} ${isMaximized ? 'maximized' : ''}`}
      style={{
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 0 : position.y,
        width: isMaximized ? '100%' : size.width,
        height: isMaximized ? '100%' : size.height
      }}
    >
      <div className="terminal-titlebar" onMouseDown={handleMouseDown}>
        <div className="terminal-controls">
          <button className="control close" onClick={onClose} title="Fermer">
            <span>×</span>
          </button>
          <button className="control minimize" onClick={() => setIsMinimized(true)} title="Minimiser">
            <span>−</span>
          </button>
          <button className="control maximize" onClick={toggleMaximize} title="Maximiser">
            <span>□</span>
          </button>
        </div>
        <div className="terminal-title">
          <span className="terminal-icon">⬢</span>
          {title}
        </div>
        <div className="terminal-tabs">
          <span className="tab active">Main</span>
        </div>
      </div>
      <div className="terminal-content">
        {children}
      </div>
      {!isMaximized && (
        <div
          className="terminal-resize-handle"
          onMouseDown={(e) => {
            setIsResizing(true);
            e.preventDefault();
          }}
        />
      )}
    </div>
  );
}
