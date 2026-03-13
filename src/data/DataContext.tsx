import React, { createContext, useContext, useState } from 'react';

export interface EmployeeRow {
  id: string;
  name: string;
  city: string;
  salary: number;
  [key: string]: unknown;
}

interface DataContextValue {
  rows: EmployeeRow[];
  setRows: (rows: EmployeeRow[]) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rows, setRows] = useState<EmployeeRow[]>([]);

  return <DataContext.Provider value={{ rows, setRows }}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within DataProvider');
  }
  return ctx;
};

