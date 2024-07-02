const axios = require('axios');
const getTaskEndPoint = 'https://interview.adpeai.com/api/v2/get-task';
const submitTaskEndPoint = 'https://interview.adpeai.com/api/v2/submit-task';
const periorTransactionYear = 2023;
const transitionType = 'alpha';

 
async function fetchData() {
  try {
     
    const response = await axios.get(getTaskEndPoint);
    const { id, transactions } = response.data;

 
    const transactions2021 = transactions.filter(transaction => {
      const transactionYear = new Date(transaction.timeStamp).getFullYear();
      return transactionYear === periorTransactionYear;
    });
 
    const topEarner = getTopEarner(transactions2021);

    if (!topEarner || !topEarner.transactions) {
      throw new Error('No transactions found for the top earner of 2021.');
    }

     
    const alphaTransactionIDs = topEarner.transactions
      .filter(transaction => transaction.type === transitionType)
      .map(transaction => transaction.transactionID);
 
    const submitResponse = await axios.post(submitTaskEndPoint, {
      id: id,
      result: alphaTransactionIDs
    });

   
    console.log('Submission result:', submitResponse.status);
  } catch (error) {
 
    console.error('Error fetching or submitting data:', error.message);
  }
}
 
function getTopEarner(transactions) {
 
  const employeeTotals = {};
  transactions.forEach(transaction => {
    if (!employeeTotals[transaction.employee.id]) {
      employeeTotals[transaction.employee.id] = {
        employee: transaction.employee,
        totalAmount: 0,
        transactions: []
      };
    }
    employeeTotals[transaction.employee.id].totalAmount += transaction.amount;
    employeeTotals[transaction.employee.id].transactions.push({
      transactionID: transaction.transactionID,
      type: transaction.type
    });
  });

 
  let topEarner = null;
  let maxTotalAmount = -1;
  for (const empId in employeeTotals) {
    if (employeeTotals[empId].totalAmount > maxTotalAmount) {
      maxTotalAmount = employeeTotals[empId].totalAmount;
      topEarner = employeeTotals[empId];
    }
  }

  return topEarner;
}

 
fetchData();
