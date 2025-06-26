import { Transaction } from '../types/transaction';

export interface CategoryRule {
  category: string;
  keywords: string[];
  color: string;
  icon: string;
  budget: number;
}

export const categoryRules: CategoryRule[] = [
  {
    category: 'Food & Dining',
    keywords: ['zomato', 'swiggy', 'uber eats', 'dominos', 'mcdonald', 'kfc', 'pizza', 'restaurant', 'cafe', 'food', 'dining', 'eat', 'meal'],
    color: '#EF4444',
    icon: 'utensils',
    budget: 1000
  },
  {
    category: 'Shopping',
    keywords: ['amazon', 'flipkart', 'myntra', 'nykaa', 'shopping', 'retail', 'store', 'mall', 'purchase', 'buy'],
    color: '#8B5CF6',
    icon: 'shopping-bag',
    budget: 1500
  },
  {
    category: 'Transportation',
    keywords: ['uber', 'ola', 'taxi', 'metro', 'bus', 'train', 'petrol', 'fuel', 'transport', 'travel'],
    color: '#06B6D4',
    icon: 'car',
    budget: 800
  },
  {
    category: 'Entertainment',
    keywords: ['netflix', 'spotify', 'amazon prime', 'hotstar', 'movie', 'cinema', 'entertainment', 'gaming', 'music'],
    color: '#F59E0B',
    icon: 'play-circle',
    budget: 500
  },
  {
    category: 'Education',
    keywords: ['course', 'udemy', 'coursera', 'books', 'education', 'learning', 'study', 'fees', 'tuition'],
    color: '#10B981',
    icon: 'book-open',
    budget: 2000
  },
  {
    category: 'Healthcare',
    keywords: ['medical', 'pharmacy', 'hospital', 'doctor', 'medicine', 'health', 'clinic', 'appointment'],
    color: '#EC4899',
    icon: 'hospital',
    budget: 1000
  },
  {
    category: 'Utilities',
    keywords: ['electricity', 'water', 'gas', 'internet', 'mobile', 'phone', 'recharge', 'bill', 'utility'],
    color: '#6366F1',
    icon: 'zap',
    budget: 800
  }
];

export const categorizeTransaction = (description: string, merchant?: string): CategoryRule => {
  const text = `${description} ${merchant || ''}`.toLowerCase();
  
  for (const rule of categoryRules) {
    if (rule.keywords.some(keyword => text.includes(keyword))) {
      return rule;
    }
  }
  
  // Default category
  return {
    category: 'Others',
    keywords: [],
    color: '#6B7280',
    icon: 'more-horizontal',
    budget: 500
  };
};

export const processTransactions = (rawData: any[], columnMapping: {
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
}): Transaction[] => {
  return rawData.map((row, index) => {
    const description = row[columnMapping.descriptionColumn] || '';
    const amount = Math.abs(parseFloat(row[columnMapping.amountColumn]) || 0);
    const date = row[columnMapping.dateColumn] || '';
    
    const categoryInfo = categorizeTransaction(description);
    
    return {
      id: `txn-${index}`,
      date,
      description,
      merchant: description.split(' ')[0] || 'Unknown',
      amount,
      category: categoryInfo.category,
      originalData: row
    };
  }).filter(t => t.amount > 0); // Only include transactions with positive amounts
};