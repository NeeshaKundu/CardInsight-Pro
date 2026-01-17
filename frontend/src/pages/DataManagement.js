import { useState } from "react";
import axios from "axios";
import { Database, Play, CheckCircle, Loader, Upload, Download, FileText } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `BACKEND_URL`;

const DataManagement = () => {
  const [seedingData, setSeedingData] = useState(false);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadingCustomers, setUploadingCustomers] = useState(false);
  const [uploadingTransactions, setUploadingTransactions] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleSeedData = async () => {
    setSeedingData(true);
    setSeedResult(null);
    try {
      const response = await axios.post(`${API}/data/seed`);
      setSeedResult(response.data);
      toast.success(`Created ${response.data.customers_created} customers with ${response.data.transactions_created} transactions`);
    } catch (error) {
      toast.error("Failed to seed data");
      console.error(error);
    } finally {
      setSeedingData(false);
    }
  };

  const handleRunAnalysis = async () => {
    setRunningAnalysis(true);
    setAnalysisResult(null);
    try {
      const response = await axios.post(`${API}/analyze`);
      setAnalysisResult(response.data);
      toast.success("Segmentation analysis completed successfully");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to run analysis");
      console.error(error);
    } finally {
      setRunningAnalysis(false);
    }
  };

  const handleUploadCustomers = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingCustomers(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API}/data/upload-customers`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(response.data);
      toast.success(`Uploaded ${response.data.customers_created} customers`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to upload customers");
      console.error(error);
    } finally {
      setUploadingCustomers(false);
      event.target.value = null;
    }
  };

  const handleUploadTransactions = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingTransactions(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API}/data/upload-transactions`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`Uploaded ${response.data.transactions_created} transactions`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to upload transactions");
      console.error(error);
    } finally {
      setUploadingTransactions(false);
      event.target.value = null;
    }
  };

  const downloadTemplate = async (type) => {
    try {
      const response = await axios.get(`${API}/data/download-template/${type}`);
      const { columns, sample_data } = response.data;
      
      const csvContent = [
        columns.join(','),
        ...sample_data.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_template.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${type} template`);
    } catch (error) {
      toast.error("Failed to download template");
      console.error(error);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2" data-testid="data-management-title">
          Data Management
        </h1>
        <p className="text-slate-600">Upload your data or generate synthetic data for analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <Upload className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Upload Your Data</h2>
              <p className="text-sm text-slate-600">Import customers and transactions from CSV</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-3">Step 1: Upload Customers</h3>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => downloadTemplate('customers')}
                  data-testid="download-customers-template"
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
              <label className="block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleUploadCustomers}
                  data-testid="upload-customers-input"
                  disabled={uploadingCustomers}
                  className="hidden"
                  id="customers-upload"
                />
                <label
                  htmlFor="customers-upload"
                  className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
                    uploadingCustomers ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploadingCustomers ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>Choose Customers CSV</span>
                    </>
                  )}
                </label>
              </label>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-3">Step 2: Upload Transactions</h3>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => downloadTemplate('transactions')}
                  data-testid="download-transactions-template"
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
              <label className="block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleUploadTransactions}
                  data-testid="upload-transactions-input"
                  disabled={uploadingTransactions}
                  className="hidden"
                  id="transactions-upload"
                />
                <label
                  htmlFor="transactions-upload"
                  className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
                    uploadingTransactions ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploadingTransactions ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>Choose Transactions CSV</span>
                    </>
                  )}
                </label>
              </label>
            </div>

            {uploadResult && (
              <div className="flex items-start gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-emerald-900">{uploadResult.message}</p>
                  <p className="text-emerald-700">
                    {uploadResult.customers_created && `${uploadResult.customers_created} customers uploaded`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Generate Synthetic Data</h2>
              <p className="text-sm text-slate-600">Create sample data for testing</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-2">What will be created:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• 150 corporate customers</li>
                <li>• 3,000+ transaction records</li>
                <li>• Multiple merchant categories</li>
                <li>• International & domestic transactions</li>
              </ul>
            </div>

            <button
              onClick={handleSeedData}
              disabled={seedingData}
              data-testid="seed-data-button"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seedingData ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating Data...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Generate Data</span>
                </>
              )}
            </button>

            {seedResult && (
              <div className="flex items-start gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-emerald-900">Data seeded successfully</p>
                  <p className="text-emerald-700">
                    {seedResult.customers_created} customers, {seedResult.transactions_created} transactions
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-emerald-50">
            <Play className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Run Segmentation Analysis</h2>
            <p className="text-sm text-slate-600">Execute K-Means clustering on your data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 mb-2">Analysis includes:</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• K-Means clustering (k=4)</li>
              <li>• Feature engineering</li>
              <li>• Segment characterization</li>
              <li>• Customer assignment</li>
            </ul>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleRunAnalysis}
              disabled={runningAnalysis}
              data-testid="run-analysis-button"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {runningAnalysis ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Running Analysis...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Run Segmentation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {analysisResult && (
          <div className="flex items-start gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg mt-4">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-emerald-900">Analysis completed</p>
              <p className="text-emerald-700">{analysisResult.segments_created} segments created</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">Quick Start Guide</h3>
        <ol className="text-sm text-blue-800 space-y-2">
          <li><strong>Option 1 - Upload Your Data:</strong></li>
          <li className="ml-4">1. Download CSV templates for customers and transactions</li>
          <li className="ml-4">2. Fill in your data following the template format</li>
          <li className="ml-4">3. Upload both CSV files</li>
          <li className="mt-3"><strong>Option 2 - Use Synthetic Data:</strong></li>
          <li className="ml-4">1. Click "Generate Data" to create sample data</li>
          <li className="mt-3"><strong>Next Steps:</strong></li>
          <li className="ml-4">2. Click "Run Segmentation" to analyze customers using K-Means clustering</li>
          <li className="ml-4">3. Navigate to Dashboard and Segmentation pages to view results</li>
          <li className="ml-4">4. Explore individual customer details and product recommendations</li>
        </ol>
      </div>
    </div>
  );
};

export default DataManagement;