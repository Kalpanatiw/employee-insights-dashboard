import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EmployeeRow } from '../data/DataContext';

interface VirtualizedTableProps {
  rows: EmployeeRow[];
  rowHeight?: number;
  overscan?: number;
  onRowClick?: (row: EmployeeRow) => void;
}

// INTENTIONAL BUG (documented in README):
// The scroll effect below is missing a dependency array, so a new
// scroll listener is attached on every render without proper cleanup.
// This creates a subtle memory leak under heavy scrolling.

export const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  rows,
  rowHeight = 40,
  overscan = 5,
  onRowClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(400);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleResize = () => {
      setViewportHeight(el.clientHeight);
    };
    handleResize();
    el.addEventListener('scroll', onScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
    };
  });

  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const totalRows = rows.length;
    const visibleCount = Math.ceil(viewportHeight / rowHeight);
    const rawStart = Math.floor(scrollTop / rowHeight) - overscan;
    const start = Math.max(0, rawStart);
    const end = Math.min(totalRows, start + visibleCount + overscan * 2);
    const offset = start * rowHeight;
    return { startIndex: start, endIndex: end, offsetY: offset };
  }, [rows.length, viewportHeight, rowHeight, scrollTop, overscan]);

  const visibleRows = rows.slice(startIndex, endIndex);

  return (
    <div className="virtualized-container" ref={containerRef}>
      <div className="virtualized-inner" style={{ height: rows.length * rowHeight }}>
        <div className="virtualized-offset" style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleRows.map((row) => (
            <div
              key={row.id}
              className="virtualized-row"
              style={{ height: rowHeight }}
              onClick={() => onRowClick && onRowClick(row)}
            >
              <div className="cell cell-id">{row.id}</div>
              <div className="cell cell-name">{String(row.name)}</div>
              <div className="cell cell-city">{String(row.city)}</div>
              <div className="cell cell-salary">{String(row.salary)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

