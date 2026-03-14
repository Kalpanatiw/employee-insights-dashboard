import React, { createContext, useContext, useState } from 'react';

export interface EmployeeRow {
  id: string;
  name: string;
  city: string;
  salary: number;
  [key: string]: unknown;
}

// Sample data for testing when API is unavailable
const SAMPLE_DATA: EmployeeRow[] = [
  { id: '1', name: 'John Smith', city: 'New York', salary: 75000 },
  { id: '2', name: 'Sarah Johnson', city: 'Los Angeles', salary: 82000 },
  { id: '3', name: 'Michael Brown', city: 'Chicago', salary: 65000 },
  { id: '4', name: 'Emily Davis', city: 'Houston', salary: 70000 },
  { id: '5', name: 'David Wilson', city: 'Phoenix', salary: 68000 },
  { id: '6', name: 'Jessica Martinez', city: 'Philadelphia', salary: 72000 },
  { id: '7', name: 'James Anderson', city: 'San Antonio', salary: 80000 },
  { id: '8', name: 'Ashley Thomas', city: 'San Diego', salary: 78000 },
  { id: '9', name: 'Christopher Jackson', city: 'Dallas', salary: 69000 },
  { id: '10', name: 'Amanda White', city: 'San Jose', salary: 85000 },
];

interface DataContextValue {
  rows: EmployeeRow[];
  setRows: (rows: EmployeeRow[]) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rows, setRows] = useState<EmployeeRow[]>(SAMPLE_DATA);

  return <DataContext.Provider value={{ rows, setRows }}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within DataProvider');
  }
  return ctx;
};

