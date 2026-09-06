import { StatCard } from "../admin/StatCard";
import { OrderTable } from "../admin/OrderTable";

export function SellerOverviewTab({
  dashboard,
  salesAnalytics,
  onExportCSV,
  onChatOrder,
  onUpdateOrderStatus,
  drawLineChart,
  drawBarChart,
  hoveredPoint,
  setHoveredPoint,
}) {
  if (!dashboard) return null;

  return (
    <>
      <div className="flex justify-between items-center my-4 flex-wrap gap-2">
        <h2 className="text-base font-bold text-gray-800 m-0">📊 Performance Overview</h2>
        <button
          onClick={onExportCSV}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-[#c4622d] hover:from-amber-500 hover:to-[#a35225] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border-0 inline-flex items-center gap-1.5"
        >
          📥 Export CSV Sales Report
        </button>
      </div>

      <div className="stats-grid">
        <StatCard label="My Sales Revenue" value={dashboard.stats.revenue} currency />
        <StatCard label="My Products" value={dashboard.stats.products} />
        <StatCard label="Customer Orders" value={dashboard.stats.orders} />
      </div>

      {/* Custom Interactive SVG Charts */}
      {salesAnalytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6 relative">
          {/* Revenue Line Chart */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm relative">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#9b6b3a] mb-4">💰 30-Day Revenue Trend</h3>
            {(() => {
              const { points, path, areaPath } = drawLineChart(salesAnalytics.revenueData);
              return (
                <div className="relative">
                  {points.length > 0 ? (
                    <>
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
                        <span>{salesAnalytics.labels?.[0]}</span>
                        <span>{salesAnalytics.labels?.[14]}</span>
                        <span>{salesAnalytics.labels?.[29]}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-10">No revenue data available.</p>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Orders Bar Chart */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm relative">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#9b6b3a] mb-4">📦 30-Day Orders Volume</h3>
            {(() => {
              const bars = drawBarChart(salesAnalytics.orderData);
              return (
                <div className="relative">
                  {bars.length > 0 ? (
                    <>
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
                        <span>{salesAnalytics.labels?.[0]}</span>
                        <span>{salesAnalytics.labels?.[14]}</span>
                        <span>{salesAnalytics.labels?.[29]}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-10">No orders data available.</p>
                  )}
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
        <p className="text-xs text-gray-400 italic my-4 px-2 animate-pulse">Loading sales performance analytics...</p>
      )}

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">📦 Recent Orders Containing My Products</h2>
      {dashboard.recentOrders?.length > 0 ? (
        <OrderTable
          orders={dashboard.recentOrders.slice(0, 5)}
          onChat={onChatOrder}
          onUpdateStatus={onUpdateOrderStatus}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 text-sm">
          No orders placed for your products yet. Keep building! 🚀
        </div>
      )}
    </>
  );
}
