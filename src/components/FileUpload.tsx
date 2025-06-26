import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseCSV } from '../utils/csvParser';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onUpload: (data: any[]) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploadStatus('idle');
      setErrorMessage('');
      
      const result = await parseCSV(file);
      
      if (result.errors.length > 0) {
        throw new Error(`CSV parsing error: ${result.errors[0].message}`);
      }

      if (result.data.length === 0) {
        throw new Error('CSV file is empty or invalid');
      }

      setUploadStatus('success');
      onUpload(result.data);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
    disabled: isLoading
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Upload Your Expenses
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Simply upload a CSV file exported from your bank or payment app, and we'll automatically 
          categorize your transactions and provide insights into your spending patterns.
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-3xl mx-auto">
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            isDragActive 
              ? 'border-blue-400 bg-blue-50 scale-105' 
              : uploadStatus === 'success' 
                ? 'border-green-400 bg-green-50'
                : uploadStatus === 'error'
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            ) : uploadStatus === 'success' ? (
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            ) : uploadStatus === 'error' ? (
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            ) : (
              <Upload className={`mx-auto h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            )}
            
            <div>
              {isLoading ? (
                <p className="text-lg font-medium text-gray-900">Processing your file...</p>
              ) : uploadStatus === 'success' ? (
                <p className="text-lg font-medium text-green-600">File uploaded successfully!</p>
              ) : uploadStatus === 'error' ? (
                <div>
                  <p className="text-lg font-medium text-red-600">Upload failed</p>
                  <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
                </div>
              ) : isDragActive ? (
                <p className="text-lg font-medium text-blue-600">Drop your CSV file here</p>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                </div>
              )}
            </div>
          </div>

          {!isLoading && uploadStatus === 'idle' && (
            <button
              type="button"
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <FileText className="w-5 h-5 mr-2" />
              Choose CSV File
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to export your data:</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Bank Statements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Log into your online banking</li>
                <li>• Navigate to account statements</li>
                <li>• Download as CSV format</li>
                <li>• Ensure columns include date, description, and amount</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Payment Apps:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Open your payment app (GPay, PhonePe, etc.)</li>
                <li>• Go to transaction history</li>
                <li>• Look for export or download option</li>
                <li>• Select CSV format if available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};