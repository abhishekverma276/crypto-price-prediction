"use client";
import { useState, useRef } from "react";
import { parseCSVData } from "../../utils/usePrediction";

export default function UploadInput({ onSequenceUpdate }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
      setUploadStatus({ type: 'error', message: 'Please upload a CSV file' });
      return;
    }

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setUploadStatus({ type: 'error', message: 'File size must be less than 1MB' });
      return;
    }

    setFileName(file.name);
    setUploadStatus({ type: 'loading', message: 'Processing file...' });

    try {
      const text = await file.text();
      const sequence = parseCSVData(text);
      
      onSequenceUpdate(sequence);
      setUploadStatus({ 
        type: 'success', 
        message: `Successfully loaded ${sequence.length} price values` 
      });
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: error.message || 'Failed to parse CSV file' 
      });
      onSequenceUpdate([]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const downloadSampleCSV = () => {
    const sampleData = Array.from({ length: 60 }, (_, i) => 
      (45000 + Math.random() * 5000).toFixed(2)
    );
    
    const csvContent = sampleData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_btc_prices.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            CSV File Upload
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload a CSV file containing exactly 60 price values
          </p>
        </div>
        
        <button
          onClick={downloadSampleCSV}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
        >
          <i className="fas fa-download mr-2"></i>
          Sample CSV
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-cloud-upload-alt text-white text-2xl"></i>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isDragOver ? "Drop your CSV file here" : "Drag & drop your CSV file"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              or{" "}
              <button
                onClick={openFileDialog}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                browse to upload
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* File Format Requirements */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
          <i className="fas fa-info-circle text-blue-500 mr-2"></i>
          CSV Format Requirements
        </h5>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• File must contain exactly 60 numeric values</li>
          <li>• Values can be in a single column or comma-separated</li>
          <li>• All values must be positive numbers</li>
          <li>• File size must be less than 1MB</li>
        </ul>
      </div>

      {/* Upload Status */}
      {uploadStatus && (
        <div className={`p-4 rounded-lg ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : uploadStatus.type === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center">
            {uploadStatus.type === 'loading' && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            )}
            {uploadStatus.type === 'success' && (
              <i className="fas fa-check-circle text-green-600 mr-3"></i>
            )}
            {uploadStatus.type === 'error' && (
              <i className="fas fa-exclamation-circle text-red-600 mr-3"></i>
            )}
            <div>
              <p className={`font-medium ${
                uploadStatus.type === 'success' 
                  ? 'text-green-800 dark:text-green-200'
                  : uploadStatus.type === 'error'
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-blue-800 dark:text-blue-200'
              }`}>
                {uploadStatus.message}
              </p>
              {fileName && uploadStatus.type === 'success' && (
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  File: {fileName}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}