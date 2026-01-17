import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `BACKEND_URL`;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, selectedSegment]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      toast.error("Failed to load customers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter((c) =>
        c.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSegment !== "all") {
      filtered = filtered.filter((c) => c.segment === selectedSegment);
    }

    setFilteredCustomers(filtered);
  };

  const getSegmentBadgeColor = (segment) => {
    if (!segment) return "bg-slate-100 text-slate-600";
    if (segment.includes("High-Growth")) return "bg-blue-100 text-blue-700";
    if (segment.includes("Travel-Heavy")) return "bg-emerald-100 text-emerald-700";
    if (segment.includes("At-Risk")) return "bg-rose-100 text-rose-700";
    return "bg-purple-100 text-purple-700";
  };

  const uniqueSegments = [...new Set(customers.map((c) => c.segment).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-600">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-2" data-testid="customers-title">
          Corporate Customers
        </h1>
        <p className="text-slate-600">View and analyze customer portfolio</p>
      </div>

      <div className="bg-white rounded-lg p-4 mb-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers..."
              data-testid="search-customers-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedSegment}
            data-testid="segment-filter-select"
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Segments</option>
            {uniqueSegments.map((seg) => (
              <option key={seg} value={seg}>
                {seg}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Segment
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Monthly Spend
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Intl. Ratio
                </th>
                <th className="text-center px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  data-testid={`customer-row-${customer.id}`}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{customer.company_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        getSegmentBadgeColor(customer.segment)
                      }`}
                    >
                      {customer.segment || "Unassigned"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    ${(customer.monthly_spend / 1000).toFixed(1)}K
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {customer.total_transactions || 0}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {(customer.international_ratio * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      data-testid={`view-customer-${customer.id}`}
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <p>No customers found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;