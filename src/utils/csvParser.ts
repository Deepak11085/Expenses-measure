import Papa from 'papaparse';
import { Transaction } from '../types/transaction';

export interface ParsedCSV {
  data: any[];
  errors: any[];
  meta: any;
}

export const parseCSV = (file: File): Promise<ParsedCSV> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const detectCSVColumns = (data: any[]): {
  dateColumn: string | null;
  descriptionColumn: string | null;
  amountColumn: string | null;
} => {
  if (data.length === 0) {
    return { dateColumn: null, descriptionColumn: null, amountColumn: null };
  }

  const headers = Object.keys(data[0]).map(h => h.toLowerCase());
  
  // Expanded date column names
  const dateColumns = [
    'date', 'transaction date', 'txn date', 'timestamp', 'created_at',
    'posting date', 'value date', 'effective date', 'process date',
    'settlement date', 'booking date', 'trans date', 'tran date',
    'transaction_date', 'post_date', 'posted_date', 'cleared_date'
  ];
  
  // Expanded description column names
  const descriptionColumns = [
    'description', 'details', 'merchant', 'txn details', 'narration', 'reference',
    'particulars', 'remarks', 'payee', 'memo', 'note', 'comment',
    'transaction details', 'trans details', 'purpose', 'reason',
    'beneficiary', 'vendor', 'supplier', 'customer', 'counterparty'
  ];
  
  // Expanded amount column names
  const amountColumns = [
    'amount', 'debit', 'credit', 'txn amount', 'transaction amount', 'value',
    'price', 'cost', 'debit amount', 'credit amount', 'net amount',
    'gross amount', 'total', 'sum', 'balance', 'withdrawal', 'deposit',
    'payment', 'receipt', 'charge', 'fee', 'trans amount', 'tran amount'
  ];

  const findColumn = (possibleNames: string[]) => {
    for (const name of possibleNames) {
      const found = headers.find(h => h.includes(name));
      if (found) return Object.keys(data[0])[headers.indexOf(found)];
    }
    return null;
  };

  return {
    dateColumn: findColumn(dateColumns),
    descriptionColumn: findColumn(descriptionColumns),
    amountColumn: findColumn(amountColumns)
  };
};