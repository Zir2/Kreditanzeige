export const calculateLoanDetails = (config) => {
  const p = parseFloat(config.principal);
  const r = parseFloat(config.interestRate) / 100 / 12;
  const m = parseFloat(config.monthlyPayment);
  const start = new Date(config.startDate);
  const now = new Date();

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

  while (balance > 0 && months < 600) {
    let interest = balance * r;
    let principalRepayment = m - interest;
    
    if (principalRepayment <= 0) return null;

    if (principalRepayment > balance) {
      principalRepayment = balance;
    }

    balance -= principalRepayment;
    totalInterest += interest;
    
    if (months < monthsToNow) {
      paidPrincipal += principalRepayment;
      paidInterest += interest;
    }

    if (months % 12 === 0 || balance <= 0) {
      chartData.principal.push(balance);
      chartData.interest.push(totalInterest);
      chartData.labels.push(start.getFullYear() + Math.floor(months/12));
    }

    months++;
  }

  return {
    totalInterest,
    currentBalance: p - paidPrincipal,
    paidPrincipal,
    paidInterest,
    remainingMonths: Math.max(0, months - monthsToNow),
    endDate: new Date(start.setMonth(start.getMonth() + months)),
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
