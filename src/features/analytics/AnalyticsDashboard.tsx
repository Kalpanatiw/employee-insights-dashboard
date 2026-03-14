import React, { useMemo } from 'react';
import { useData } from '../../services/employeeDataStore';

export const AnalyticsDashboard: React.FC = () => {
  const { rows } = useData();

  const citySalary = useMemo(() => {
    const map: Record<string, number> = {};

    rows.forEach((row) => {
      const city = row.city || 'Unknown';
      const salary = Number(row.salary) || 0;

      map[city] = (map[city] || 0) + salary;
    });

    return Object.entries(map).map(([city, totalSalary]) => ({
      city,
      totalSalary,
    }));
  }, [rows]);

  const maxSalary =
    citySalary.length > 0
      ? Math.max(...citySalary.map((c) => c.totalSalary))
      : 0;

  return (
    <section className="page analytics-page">
      <header className="page-header">
        <h2>Salary Distribution by City</h2>
      </header>

      <svg width="700" height="400">
        {citySalary.map((item, index) => {
          const barHeight =
            maxSalary > 0
              ? (item.totalSalary / maxSalary) * 300
              : 0;

          const x = index * 80 + 50;
          const y = 350 - barHeight;

          return (
            <g key={item.city}>
              <rect
                x={x}
                y={y}
                width="40"
                height={barHeight}
                fill="steelblue"
              />

              <text
                x={x + 20}
                y="370"
                textAnchor="middle"
                fontSize="12"
              >
                {item.city}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
};