import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { BudgetSettings } from './components/BudgetSettings';
import { Transaction, Category, BudgetAlert } from './types/transaction';
import { processTransactions, categoryRules } from './utils/categorizer';
import { detectCSVColumns } from './utils/csvParser';
import { Settings, TrendingUp, Upload, List } from 'lucide-react';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard' | 'transactions' | 'settings'>('upload');
  const [isLoading, setIsLoading] = useState(false);

  const handleCSVUpload = async (data: any[]) => {
    setIsLoading(true);
    try {
      const columnMapping = detectCSVColumns(data);
      
      if (!columnMapping.dateColumn || !columnMapping.descriptionColumn || !columnMapping.amountColumn) {
        throw new Error('Could not detect required columns in CSV file');
      }

      const processedTransactions = processTransactions(data, columnMapping);
      setTransactions(processedTransactions);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert('Error processing CSV file. Please check the format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      // Calculate categories with totals
      const categoryMap = new Map<string, { total: number; count: number; rule: any }>();
      
      transactions.forEach(transaction => {
        const existing = categoryMap.get(transaction.category) || { total: 0, count: 0, rule: null };
        const rule = categoryRules.find(r => r.category === transaction.category);
        
        categoryMap.set(transaction.category, {
          total: existing.total + transaction.amount,
          count: existing.count + 1,
          rule: rule || { color: '#6B7280', icon: 'more-horizontal', budget: 500 }
        });
      });

      const calculatedCategories: Category[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        color: data.rule.color,
        icon: data.rule.icon,
        budget: data.rule.budget
      }));

      setCategories(calculatedCategories);

      // Calculate budget alerts
      const alerts: BudgetAlert[] = calculatedCategories
        .filter(category => category.total > category.budget * 0.8)
        .map(category => ({
          category: category.name,
          spent: category.total,
          budget: category.budget,
          percentage: (category.total / category.budget) * 100,
          severity: category.total > category.budget ? 'danger' : 'warning'
        }));

      setBudgetAlerts(alerts);
    }
  }, [transactions]);

  const tabs = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: List },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Budget Tracker</h1>
                <p className="text-sm text-gray-500">Smart expense management</p>
              </div>
            </div>
            
            {transactions.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-lg font-semibold text-gray-900">{transactions.length}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <FileUpload onUpload={handleCSVUpload} isLoading={isLoading} />
        )}
        
        {activeTab === 'dashboard' && transactions.length > 0 && (
          <Dashboard 
            categories={categories} 
            transactions={transactions} 
            budgetAlerts={budgetAlerts}
          />
        )}
        
        {activeTab === 'transactions' && transactions.length > 0 && (
          <TransactionList transactions={transactions} categories={categories} />
        )}
        
        {activeTab === 'settings' && (
          <BudgetSettings categories={categories} />
        )}

        {/* Empty State */}
        {transactions.length === 0 && activeTab !== 'upload' && (
          <div className="text-center py-16">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No data yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload a CSV file to get started with your budget tracking.
            </p>
            <button
              onClick={() => setActiveTab('upload')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Upload CSV File
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;