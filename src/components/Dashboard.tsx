import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Transaction, Category, BudgetAlert } from '../types/transaction';
import { TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardProps {
  categories: Category[];
  transactions: Transaction[];
  budgetAlerts: BudgetAlert[];
}

export const Dashboard: React.FC<DashboardProps> = ({ categories, transactions, budgetAlerts }) => {
  const totalSpent = categories.reduce((sum, cat) => sum + cat.total, 0);
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);

  const chartData = {
    labels: categories.map(cat => cat.name),
    datasets: [
      {
        data: categories.map(cat => cat.total),
        backgroundColor: categories.map(cat => cat.color),
        borderColor: categories.map(cat => cat.color),
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = ((value / totalSpent) * 100).toFixed(1);
            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.MoreHorizontal;
    return Icon;
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalSpent.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalBudget.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{(totalBudget - totalSpent).toFixed(2)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              totalBudget - totalSpent >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {totalBudget - totalSpent >= 0 ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
            Budget Alerts
          </h3>
          <div className="space-y-3">
            {budgetAlerts.map((alert) => (
              <div
                key={alert.category}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'danger' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${
                      alert.severity === 'danger' ? 'text-red-800' : 'text-orange-800'
                    }`}>
                      {alert.category}
                    </p>
                    <p className={`text-sm ${
                      alert.severity === 'danger' ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      ₹{alert.spent.toFixed(2)} of ₹{alert.budget.toFixed(2)} spent
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    alert.severity === 'danger' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {alert.percentage.toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>
          <div className="h-80">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Details</h3>
          <div className="space-y-4">
            {categories.map((category) => {
              const Icon = getIcon(category.icon);
              const percentage = (category.total / category.budget) * 100;
              
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-500">{category.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{category.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">of ₹{category.budget}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: category.color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};