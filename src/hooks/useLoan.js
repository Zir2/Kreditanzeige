import { useState, useEffect } from 'react';
import { calculateLoanDetails } from '../utils/loanCalculations';

export const useLoan = (config) => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const calculation = calculateLoanDetails(config);
    setResult(calculation);
  }, [config]);

  return result;
};
