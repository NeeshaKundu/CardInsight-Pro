import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Globe, DollarSign, CreditCard, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const API = '/api';

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetchCustomerData();
  fetchRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [customerId]);

  const fetchCustomerData = async () => {
    try {
      const response = await axios.get(`${API}/customers/${customerId}`);
      setData(response.data);
    } catch (error) {
      toast.error("Failed to load customer data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`${API}/recommendations/${customerId}`);
      setRecommendations(response.data);
    } catch (error) {
      console.error("Failed to load recommendations", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-600">Loading customer details...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-slate-600">Customer not found</p>
      </div>
    );
  }

  const { customer, transactions } = data;

  const getPriorityColor = (priority) => {
    if (priority === "high") return "bg-rose-100 text-rose-700";
    if (priority === "medium") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="p-6 md:p-8">
      <button
        onClick={() => navigate("/customers")}
        data-testid="back-to-customers-button"
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Customers</span>
      </button>

      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-2" data-testid="customer-name">
          {customer.company_name}
        </h1>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              customer.segment?.includes("High-Growth")
                ? "bg-blue-100 text-blue-700"
                : customer.segment?.includes("Travel-Heavy")
                ? "bg-emerald-100 text-emerald-700"
                : customer.segment?.includes("At-Risk")
                ? "bg-rose-100 text-rose-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {customer.segment || "Unassigned"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-50">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-600">Monthly Spend</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">${(customer.monthly_spend / 1000).toFixed(1)}K</p>
        </div>

        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-50">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-slate-600">Total Transactions</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{customer.total_transactions}</p>
        </div>

        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-50">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-slate-600">International Ratio</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{(customer.international_ratio * 100).toFixed(0)}%</p>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4" data-testid="recommendations-title">
            Beyond-the-Card Product Recommendations
          </h2>
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                data-testid={`recommendation-${idx}`}
                className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-900">{rec.product_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                    {rec.priority} priority
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-2">{rec.reason}</p>
                <p className="text-emerald-600 text-sm font-medium">{rec.expected_value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900" data-testid="transactions-title">
            Recent Transactions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-center px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 20).map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {format(new Date(txn.transaction_date), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{txn.merchant_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{txn.merchant_category}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">
                    ${txn.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        txn.is_international ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {txn.is_international ? "International" : "Domestic"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;