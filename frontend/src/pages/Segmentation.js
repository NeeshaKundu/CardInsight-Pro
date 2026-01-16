import { useState, useEffect } from "react";
import axios from "axios";
import { Users, TrendingUp, Globe, Clock } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Segmentation = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const response = await axios.get(`${API}/segments`);
      setSegments(response.data);
    } catch (error) {
      toast.error("Failed to load segments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSegmentColor = (name) => {
    if (name.includes("High-Growth")) return "blue";
    if (name.includes("Travel-Heavy")) return "emerald";
    if (name.includes("At-Risk")) return "rose";
    return "purple";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-600">Loading segments...</div>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Segmentation Analysis</h1>
        <p className="text-slate-600 mb-8">K-Means clustering results and segment characteristics</p>
        <div className="bg-white rounded-lg p-12 border border-slate-200 text-center">
          <p className="text-slate-600 text-lg mb-2">No segments available</p>
          <p className="text-slate-500">Please run segmentation analysis from Data Management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2" data-testid="segmentation-title">
          Segmentation Analysis
        </h1>
        <p className="text-slate-600">K-Means clustering results and segment characteristics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {segments.map((segment) => {
          const color = getSegmentColor(segment.name);
          return (
            <div
              key={segment.id}
              data-testid={`segment-card-${segment.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{segment.name}</h3>
                  <p className="text-sm text-slate-600">{segment.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-full bg-${color}-100 text-${color}-700 text-sm font-medium`}>
                  {segment.customer_count} customers
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${color}-50`}>
                    <TrendingUp className={`w-4 h-4 text-${color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Avg Monthly Spend</p>
                    <p className="text-lg font-bold text-slate-900">
                      ${(segment.avg_monthly_spend / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${color}-50`}>
                    <Globe className={`w-4 h-4 text-${color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">International Ratio</p>
                    <p className="text-lg font-bold text-slate-900">
                      {(segment.characteristics.avg_international_ratio * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${color}-50`}>
                    <Clock className={`w-4 h-4 text-${color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Payment Timeliness</p>
                    <p className="text-lg font-bold text-slate-900">
                      {(segment.characteristics.avg_payment_timeliness * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Segmentation;