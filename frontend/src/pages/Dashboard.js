import { useState, useEffect } from "react";
import axios from "axios";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { toast } from "sonner";

const API = '/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-600">Loading dashboard...</div>
      </div>
    );
  }

  const COLORS = ["#2563EB", "#10B981", "#F43F5E", "#F59E0B"];

  const statCards = [
    {
      title: "Total Customers",
      value: stats?.total_customers || 0,
      icon: Users,
      color: "blue",
    },
    {
      title: "Total Monthly Spend",
      value: `$${((stats?.total_spend || 0) / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: "emerald",
    },
    {
      title: "Avg Spend/Customer",
      value: `$${((stats?.avg_spend_per_customer || 0) / 1000).toFixed(1)}K`,
      icon: TrendingUp,
      color: "purple",
    },
    {
      title: "Total Transactions",
      value: stats?.total_transactions || 0,
      icon: Activity,
      color: "rose",
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2" data-testid="dashboard-title">
          Corporate Card Analytics
        </h1>
        <p className="text-slate-600">Portfolio segmentation and beyond-the-card insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${card.color}-50`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4" data-testid="segment-distribution-title">
            Segment Distribution
          </h2>
          {stats?.segment_distribution && stats.segment_distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.segment_distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.segment_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <p>No segmentation data available</p>
                <p className="text-sm mt-2">Run analysis from Data Management</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4" data-testid="customers-by-segment-title">
            Customers by Segment
          </h2>
          {stats?.segment_distribution && stats.segment_distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.segment_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <p>No segmentation data available</p>
                <p className="text-sm mt-2">Run analysis from Data Management</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;