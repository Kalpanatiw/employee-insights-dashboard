import React, { useMemo } from 'react';
import { useData } from '../data/DataContext';

interface CityStat {
  city: string;
  totalSalary: number;
  count: number;
}

export const AnalyticsPage: React.FC = () => {
  const { rows } = useData();
  const auditImage = window.sessionStorage.getItem('audit-image');

  const cityStats = useMemo<CityStat[]>(() => {
    const map = new Map<string, CityStat>();
    for (const row of rows) {
      const city = row.city || 'Unknown';
      const existing = map.get(city) ?? { city, totalSalary: 0, count: 0 };
      existing.totalSalary += row.salary;
      existing.count += 1;
      map.set(city, existing);
    }
    return Array.from(map.values());
  }, [rows]);

  const maxSalary = cityStats.reduce((max, c) => Math.max(max, c.totalSalary), 0) || 1;

  const cityCoordinates: Record<string, { x: number; y: number }> = {
    Mumbai: { x: 80, y: 140 },
    Delhi: { x: 110, y: 70 },
    Bengaluru: { x: 100, y: 170 },
    Hyderabad: { x: 115, y: 155 },
    Chennai: { x: 115, y: 190 },
    Pune: { x: 85, y: 150 },
    Kolkata: { x: 150, y: 110 },
  };

  return (
    <section className="page analytics-page">
      <header className="page-header">
        <h2>Photo Result &amp; Analytics</h2>
      </header>

      <div className="analytics-grid">
        <div className="audit-panel">
          <h3>Audit Image</h3>
          {auditImage ? (
            <img src={auditImage} alt="Audit" className="audit-image" />
          ) : (
            <p>No audit image found. Complete verification first.</p>
          )}
        </div>

        <div className="charts-panel">
          <h3>Salary Distribution per City</h3>
          {cityStats.length === 0 ? (
            <p>No data available. Load the list first.</p>
          ) : (
            <svg className="chart" viewBox="0 0 400 220" role="img" aria-label="Salary by city">
              <line x1="40" y1="10" x2="40" y2="200" stroke="#ccc" />
              <line x1="40" y1="200" x2="380" y2="200" stroke="#ccc" />
              {cityStats.map((c, index) => {
                const barWidth = 24;
                const gap = 16;
                const x = 50 + index * (barWidth + gap);
                const barHeight = (c.totalSalary / maxSalary) * 150;
                const y = 200 - barHeight;
                return (
                  <g key={c.city}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="#4f46e5"
                      rx={3}
                    />
                    <text x={x + barWidth / 2} y={210} textAnchor="middle" fontSize="10">
                      {c.city}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          <h3>City Map</h3>
          <svg className="map" viewBox="0 0 220 240" role="img" aria-label="City map">
            <rect x="10" y="20" width="200" height="200" rx="12" fill="#0f172a" />
            {cityStats.map((c) => {
              const coord = cityCoordinates[c.city] ?? { x: 60 + Math.random() * 100, y: 60 };
              const radius = 4 + Math.min(6, c.count);
              return (
                <g key={c.city}>
                  <circle cx={coord.x} cy={coord.y} r={radius} fill="#22c55e" />
                  <text
                    x={coord.x + 6}
                    y={coord.y}
                    fontSize="9"
                    fill="#e5e7eb"
                    alignmentBaseline="middle"
                  >
                    {c.city}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
};

