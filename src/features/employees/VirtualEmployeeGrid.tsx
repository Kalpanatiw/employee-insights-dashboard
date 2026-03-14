import React, { useRef, useState } from 'react';
import type { EmployeeRow } from '../../services/employeeDataStore';

interface Props {
  rows: EmployeeRow[];
  onRowClick: (row: EmployeeRow) => void;
}

const ROW_HEIGHT = 40;
const BUFFER = 5;

export const VirtualEmployeeGrid: React.FC<Props> = ({ rows, onRowClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = rows.length * ROW_HEIGHT;

  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ROW_HEIGHT) - BUFFER
  );

  const visibleCount =
    Math.ceil(400 / ROW_HEIGHT) + BUFFER * 2;

  const endIndex = Math.min(
    rows.length,
    startIndex + visibleCount
  );

  const visibleRows = rows.slice(startIndex, endIndex);

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: 400,
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        {visibleRows.map((row, i) => {
          const index = startIndex + i;

          return (
            <div
              key={row.id}
              onClick={() => onRowClick(row)}
              style={{
                position: 'absolute',
                top: index * ROW_HEIGHT,
                height: ROW_HEIGHT,
                display: 'flex',
                width: '100%',
                cursor: 'pointer',
                borderBottom: '1px solid #ddd'
              }}
            >
              <div style={{ width: 80 }}>{row.id}</div>
              <div style={{ width: 200 }}>{row.name}</div>
              <div style={{ width: 200 }}>{row.city}</div>
              <div style={{ width: 120 }}>{row.salary}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};