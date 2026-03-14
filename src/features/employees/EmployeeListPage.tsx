import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, type EmployeeRow } from '../../services/employeeDataStore';
import { VirtualEmployeeGrid } from './VirtualEmployeeGrid';

interface ApiRow {
  [key: string]: unknown;
}

export const EmployeeListPage: React.FC = () => {
  const { rows, setRows } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (rows.length) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          'https://backend.jotish.in/backend_dev/gettabledata.php',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'test',
              password: '123456',
            }),
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: ApiRow[] = await res.json();

        const mapped: EmployeeRow[] = data.map((row, index) => {
          const id = String(row.id ?? index + 1);

          const name =
            (row.name as string | undefined) ??
            (row.employee_name as string | undefined) ??
            `Employee ${index + 1}`;

          const city =
            (row.city as string | undefined) ??
            (row.location as string | undefined) ??
            'Unknown';

          const salaryRaw =
            (row.salary as number | string | undefined) ??
            (row.ctc as number | string | undefined) ??
            0;

          const salary =
            typeof salaryRaw === 'number'
              ? salaryRaw
              : Number.parseFloat(String(salaryRaw)) || 0;

          return {
            id,
            name,
            city,
            salary,
            ...row,
          };
        });

        setRows(mapped);
      } catch (err) {
        console.error(err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rows.length, setRows]);

  const handleRowClick = (row: EmployeeRow) => {
    navigate(`/details/${encodeURIComponent(row.id)}`);
  };

  return (
    <section className="page list-page">
      <header className="page-header">
        <h2>Employee List</h2>
      </header>

      {loading && <p>Loading data...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && rows.length === 0 && <p>No data loaded.</p>}

      {rows.length > 0 && (
        <div className="table-wrapper">
          <div className="table-header">
            <div className="cell cell-id">ID</div>
            <div className="cell cell-name">Name</div>
            <div className="cell cell-city">City</div>
            <div className="cell cell-salary">Salary</div>
          </div>

          <VirtualEmployeeGrid
            rows={rows}
            onRowClick={handleRowClick}
          />
        </div>
      )}
    </section>
  );
};