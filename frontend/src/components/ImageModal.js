import React, { useRef, useState, useEffect } from 'react';

const lastTouch = { current: null };

export default function ImageModal({ open, src, alt, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);
  const [showInstruction, setShowInstruction] = useState(false);
  const imgRef = useRef();
  const lastTouchRef = useRef(null);

  useEffect(() => {
    if (zoom > 1) {
      setShowInstruction(true);
      const timer = setTimeout(() => setShowInstruction(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowInstruction(false);
    }
  }, [zoom]);

  if (!open) return null;

  // Mouse wheel zoom
  const handleWheel = e => {
    e.preventDefault();
    let newZoom = zoom + (e.deltaY < 0 ? 0.2 : -0.2);
    newZoom = Math.max(1, Math.min(newZoom, 4));
    setZoom(newZoom);
  };

  // Mouse drag to pan
  const handleMouseDown = e => {
    if (zoom === 1) return;
    setDragStart({ x: e.clientX - drag.x, y: e.clientY - drag.y });
  };
  const handleMouseMove = e => {
    if (!dragStart) return;
    setDrag({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => {
    setDragStart(null);
  };

  // Touch pinch to zoom
  const handleTouchStart = e => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchRef.current = { dist: Math.sqrt(dx * dx + dy * dy), zoom };
    } else if (e.touches.length === 1 && zoom > 1) {
      setDragStart({ x: e.touches[0].clientX - drag.x, y: e.touches[0].clientY - drag.y });
    }
  };
  const handleTouchMove = e => {
    if (e.touches.length === 2 && lastTouchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let newZoom = lastTouchRef.current.zoom * (dist / lastTouchRef.current.dist);
      newZoom = Math.max(1, Math.min(newZoom, 4));
      setZoom(newZoom);
    } else if (e.touches.length === 1 && dragStart) {
      setDrag({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    }
  };
  const handleTouchEnd = e => {
    lastTouchRef.current = null;
    setDragStart(null);
  };

  // Reset zoom/drag on image close
  const handleClose = () => {
    setZoom(1);
    setDrag({ x: 0, y: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={handleClose}>
      {/* Controls fixed at extreme right */}
      <div className="fixed top-1/2 right-6 z-50 flex flex-col items-center gap-3 -translate-y-1/2">
        <button
          className="bg-white bg-opacity-90 rounded-full p-2 shadow hover:bg-opacity-100 transition text-xl font-bold"
          onClick={e => {
            e.stopPropagation();
            setZoom(z => {
              const next = Math.max(1, Math.min(z + 0.2, 4));
              return next;
            });
          }}
          aria-label="Zoom in"
          type="button"
        >
          +
        </button>
        <button
          className="bg-white bg-opacity-90 rounded-full p-2 shadow hover:bg-opacity-100 transition text-xl font-bold"
          onClick={e => {
            e.stopPropagation();
            setZoom(z => {
              const next = Math.max(1, z - 0.2);
              if (next === 1) setDrag({ x: 0, y: 0 });
              return next;
            });
          }}
          aria-label="Zoom out"
          type="button"
          disabled={zoom <= 1}
        >
          -
        </button>
        <button
          className="bg-white bg-opacity-90 rounded-full p-2 shadow hover:bg-opacity-100 transition"
          onClick={e => {
            e.stopPropagation();
            handleClose();
          }}
          aria-label="Close"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div
        className="relative select-none"
        onClick={e => e.stopPropagation()}

        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: zoom > 1 ? 'grab' : 'zoom-out' }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl border-4 border-white"
          style={{
            objectFit: 'contain',
            transform: `scale(${zoom}) translate(${drag.x / zoom}px, ${drag.y / zoom}px)`,
            transition: dragStart ? 'none' : 'transform 0.2s',
            cursor: zoom > 1 ? 'grab' : 'zoom-out',
          }}
        />

        {zoom > 1 && showInstruction && (
          <div className="fixed top-[calc(50%+90px)] right-6 z-50 bg-white bg-opacity-90 rounded px-3 py-2 text-xs text-gray-700 shadow transition-opacity duration-500">
            Drag to pan (when zoomed). Use + and − to zoom. Pinch to zoom on touch devices.
          </div>
        )}

      </div>
    </div>
  );
}

