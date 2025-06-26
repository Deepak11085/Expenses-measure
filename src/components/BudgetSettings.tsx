import React, { useState } from 'react';
import { Category } from '../types/transaction';
import { Settings, Save, RotateCcw } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface BudgetSettingsProps {
  categories: Category[];
}

export const BudgetSettings: React.FC<BudgetSettingsProps> = ({ categories }) => {
  const [budgets, setBudgets] = useState<Record<string, number>>(() => {
    const initialBudgets: Record<string, number> = {};
    categories.forEach(category => {
      initialBudgets[category.name] = category.budget;
    });
    return initialBudgets;
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleBudgetChange = (categoryName: string, value: number) => {
    setBudgets(prev => ({
      ...prev,
      [categoryName]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In a real app, this would save to a backend or localStorage
    console.log('Saving budgets:', budgets);
    setHasChanges(false);
    // Show success message
  };

  const handleReset = () => {
    const originalBudgets: Record<string, number> = {};
    categories.forEach(category => {
      originalBudgets[category.name] = category.budget;
    });
    setBudgets(originalBudgets);
    setHasChanges(false);
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.MoreHorizontal;
    return Icon;
  };

  const totalBudget = Object.values(budgets).reduce((sum, budget) => sum + budget, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-3" />
            Budget Settings
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Customize your monthly budget limits for each category
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Total Budget Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Total Monthly Budget</p>
            <p className="text-3xl font-bold text-blue-900">₹{totalBudget.toFixed(2)}</p>
          </div>
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Budget Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Category Budgets</h3>
          <p className="text-sm text-gray-500 mt-1">
            Set spending limits for each category to help you stay on track
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {categories.map((category) => {
              const Icon = getIcon(category.icon);
              const currentBudget = budgets[category.name] || 0;
              const spentPercentage = (category.total / currentBudget) * 100;
              
              return (
                <div key={category.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: category.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-500">
                          ₹{category.total.toFixed(2)} spent • {category.count} transactions
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Budget</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">₹</span>
                          <input
                            type="number"
                            value={currentBudget}
                            onChange={(e) => handleBudgetChange(category.name, parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            step="100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {spentPercentage.toFixed(1)}% used
                      </span>
                      <span className="text-gray-500">
                        ₹{(currentBudget - category.total).toFixed(2)} remaining
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(spentPercentage, 100)}%`,
                          backgroundColor: spentPercentage > 100 ? '#EF4444' : 
                                         spentPercentage > 80 ? '#F59E0B' : category.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Tips</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Setting Realistic Budgets</h4>
            <p className="text-sm text-gray-600">
              Base your budgets on your past spending patterns and income. Start with slightly higher amounts and adjust as needed.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">The 50/30/20 Rule</h4>
            <p className="text-sm text-gray-600">
              Allocate 50% for needs, 30% for wants, and 20% for savings and debt repayment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};