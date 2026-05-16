export const calculateLoanDetails = (config) => {
  const p = parseFloat(config.principal);
  const r = parseFloat(config.interestRate) / 100 / 12;
  const m = parseFloat(config.monthlyPayment);
  const start = new Date(config.startDate);
  const now = new Date();
  const extraPayments = config.extraPayments || [];

  let balance = p;
  let totalInterest = 0;
  let months = 0;
  let paidPrincipal = 0;
  let paidInterest = 0;
  let monthsToNow = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30.44));
  
  const chartData = {
    labels: [],
    principal: [],
    interest: []
  };

  // Helper to find extra payments for current month
  const getExtraForMonth = (mIdx) => {
    return extraPayments.filter(ep => {
      const epDate = new Date(ep.date);
      const diffMonths = (epDate.getFullYear() - start.getFullYear()) * 12 + (epDate.getMonth() - start.getMonth());
      return diffMonths === mIdx;
    }).reduce((sum, ep) => sum + parseFloat(ep.amount), 0);
  };

  while (balance > 0 && months < 600) {
    let interest = balance * r;
    let principalRepayment = m - interest;
    
    if (principalRepayment <= 0) return null;

    if (principalRepayment > balance) {
      principalRepayment = balance;
    }

    balance -= principalRepayment;
    
    // Apply extra payments for this month
    const extra = getExtraForMonth(months);
    balance -= extra;
    
    totalInterest += interest;
    
    if (months < monthsToNow) {
      paidPrincipal += (principalRepayment + extra);
      paidInterest += interest;
    }

    if (months % 12 === 0 || balance <= 0) {
      chartData.principal.push(Math.max(0, balance));
      chartData.interest.push(totalInterest);
      chartData.labels.push(start.getFullYear() + Math.floor(months/12));
    }

    if (balance <= 0) break;
    months++;
  }

  return {
    totalInterest,
    currentBalance: Math.max(0, p - paidPrincipal),
    paidPrincipal,
    paidInterest,
    remainingMonths: Math.max(0, months - monthsToNow),
    endDate: new Date(new Date(config.startDate).setMonth(new Date(config.startDate).getMonth() + months)),
    chartData
  };
};

export const calculatePenalty = (extraAmount, loanResult, config) => {
  if (!extraAmount || extraAmount <= 0) return null;

  const remainingYears = loanResult.remainingMonths / 12;
  const interestDiff = (config.interestRate - config.marketRate) / 100;
  
  let penalty = 0;
  if (interestDiff > 0) {
    penalty = extraAmount * interestDiff * remainingYears;
  }

  const savings = extraAmount * (config.interestRate / 100) * remainingYears;
  
  return {
    penalty: Math.max(0, penalty),
    savings
  };
};
