import { useState } from "react";
import { StatCard } from "./StatCard";
import { OrderTable } from "./OrderTable";

export function AdminOverviewTab({
  dashboard,
  salesAnalytics,
  geoAnalytics,
  loadingGeo,
  handleExportCSV,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const drawLineChart = (data, width = 600, height = 200) => {
    if (!data || data.length === 0) return { points: [], path: "", areaPath: "" };
    const maxVal = Math.max(...data, 100);
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 40) + 20;
      const y = height - ((val / maxVal) * (height - 40) + 20);
      return { x, y, val, label: salesAnalytics.labels[idx] };
    });
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    const areaPath = `${path} L ${points[points.length - 1].x} ${height - 10} L ${points[0].x} ${height - 10} Z`;
    return { points, path, areaPath };
  };

  const drawBarChart = (data, width = 600, height = 200) => {
    if (!data || data.length === 0) return [];
    const maxVal = Math.max(...data, 5);
    const barWidth = ((width - 40) / data.length) * 0.7;
    const gap = ((width - 40) / data.length) * 0.3;
    return data.map((val, idx) => {
      const x = 20 + idx * (barWidth + gap);
      const barHeight = (val / maxVal) * (height - 40);
      const y = height - barHeight - 20;
      return { x, y, width: barWidth, height: barHeight, val, label: salesAnalytics.labels[idx] };
    });
  };

  if (!dashboard) return null;

  return (
    <>
      <div className="flex justify-between items-center my-4 flex-wrap gap-2">
        <h2 className="text-base font-bold text-gray-800 m-0">📊 Performance Overview</h2>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-[#c4622d] hover:from-amber-500 hover:to-[#a35225] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border-0 inline-flex items-center gap-1.5"
        >
          📥 Export CSV Revenue Report
        </button>
      </div>

      <div className="stats-grid">
        <StatCard label="Revenue" value={dashboard.stats.revenue} currency />
        <StatCard label="Orders" value={dashboard.stats.orders} />
        <StatCard label="Products" value={dashboard.stats.products} />
        <StatCard label="Users" value={dashboard.stats.users} />
      </div>

      {/* Custom Interactive SVG Charts */}
      {salesAnalytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6 relative">
          {/* Revenue Line Chart */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm relative">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#9b6b3a] mb-4">
              💰 30-Day Revenue Trend
            </h3>
            {(() => {
              const { points, path, areaPath } = drawLineChart(salesAnalytics.revenueData);
              return (
                <div className="relative">
                  <svg className="w-full h-52 overflow-visible" viewBox="0 0 600 200">
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c4622d" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#c4622d" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="20" y1="20" x2="580" y2="20" stroke="#f1f1f1" strokeWidth="1" />
                    <line x1="20" y1="80" x2="580" y2="80" stroke="#f1f1f1" strokeWidth="1" />
                    <line x1="20" y1="140" x2="580" y2="140" stroke="#f1f1f1" strokeWidth="1" />
                    <line x1="20" y1="180" x2="580" y2="180" stroke="#e0e0e0" strokeWidth="1.5" />

                    <path d={areaPath} fill="url(#revGrad)" />
                    <path d={path} fill="none" stroke="#c4622d" strokeWidth="3" strokeLinecap="round" />

                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r="5"
                        className="fill-white stroke-[#c4622d] stroke-[2px] cursor-pointer hover:r-[7px] hover:fill-[#c4622d] transition-all"
                        onMouseEnter={() => setHoveredPoint({ ...p, type: "revenue" })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </svg>

                  <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-2 px-4">
                    <span>{salesAnalytics.labels[0]}</span>
                    <span>{salesAnalytics.labels[14]}</span>
                    <span>{salesAnalytics.labels[29]}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Orders Bar Chart */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm relative">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#9b6b3a] mb-4">
              📦 30-Day Orders Volume
            </h3>
            {(() => {
              const bars = drawBarChart(salesAnalytics.orderData);
              return (
                <div className="relative">
                  <svg className="w-full h-52 overflow-visible" viewBox="0 0 600 200">
                    <line x1="20" y1="20" x2="580" y2="20" stroke="#f1f1f1" strokeWidth="1" />
                    <line x1="20" y1="80" x2="580" y2="80" stroke="#f1f1f1" strokeWidth="1" />
                    <line x1="20" y1="140" x2="580" y2="140" stroke="#f1f1f1" strokeWidth="1" />
                    <line x1="20" y1="180" x2="580" y2="180" stroke="#e0e0e0" strokeWidth="1.5" />

                    {bars.map((b, idx) => (
                      <rect
                        key={idx}
                        x={b.x}
                        y={b.y}
                        width={b.width}
                        height={b.height}
                        rx="3"
                        className="fill-[#e0a96d] hover:fill-[#c4622d] transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredPoint({ ...b, type: "orders" })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </svg>

                  <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-2 px-4">
                    <span>{salesAnalytics.labels[0]}</span>
                    <span>{salesAnalytics.labels[14]}</span>
                    <span>{salesAnalytics.labels[29]}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {hoveredPoint && (
            <div
              className="absolute z-20 bg-gray-900/90 text-white rounded-xl px-3 py-2 text-[10px] shadow-lg pointer-events-none font-bold backdrop-blur-sm border border-gray-800"
              style={{
                left: `${(hoveredPoint.x / 600) * 100}%`,
                top: `${(hoveredPoint.y / 200) * 100 - 25}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div>Date: {hoveredPoint.label}</div>
              <div className="text-orange mt-0.5">
                {hoveredPoint.type === "revenue"
                  ? `Revenue: ₹${hoveredPoint.val}`
                  : `Orders: ${hoveredPoint.val}`}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-455 italic my-4 px-2">Loading interactive sales charts...</p>
      )}

      {/* Geographic Sales Distribution Card */}
      <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm my-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#9b6b3a] mb-4">
          🌍 Geographic Sales Distribution
        </h3>
        {loadingGeo ? (
          <p className="text-xs text-gray-500 italic py-4 animate-pulse">
            Loading geographic statistics...
          </p>
        ) : geoAnalytics && geoAnalytics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {geoAnalytics.map((stat, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-800">{stat.city}</span>
                    <span className="text-gray-400 font-medium ml-1">({stat.state})</span>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-gray-900">₹{stat.revenue}</div>
                    <div className="text-[10px] text-gray-400 font-bold">
                      {stat.salesCount} {stat.salesCount === 1 ? "order" : "orders"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                Revenue Breakdown by City
              </p>
              <div className="space-y-3">
                {geoAnalytics.slice(0, 5).map((stat, idx) => {
                  const maxRevenue = geoAnalytics[0]?.revenue || 1;
                  const percent = Math.max(5, Math.min(100, (stat.revenue / maxRevenue) * 100));
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-gray-700">{stat.city}</span>
                        <span className="text-orange">₹{stat.revenue}</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-[#c4622d] rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic py-4">No geographic sales data recorded yet.</p>
        )}
      </div>

      <OrderTable orders={dashboard.recentOrders} readOnly={true} />
    </>
  );
}
