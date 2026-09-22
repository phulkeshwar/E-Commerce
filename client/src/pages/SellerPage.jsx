import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSellerDashboardRequest,
  createSellerProductRequest,
  updateSellerProductRequest,
  deleteSellerProductRequest,
  getSellerFAQsRequest,
  updateSellerOrderStatusRequest,
  getSellerProductsRequest,
  getSellerOrdersRequest,
  getSellerSalesAnalyticsRequest,
  bulkUploadProductsRequest,
  getSellerCouponsRequest,
  createSellerCouponRequest,
  deleteSellerCouponRequest,
} from "../api/seller.api";
import { getReviewsRequest } from "../api/reviews.api";
import { answerQuestionRequest } from "../api/faq.api";
import { getReturnRequests, updateReturnRequestStatus } from "../api/return.api";
import { ProductForm } from "../components/admin/ProductForm";
import { StatCard } from "../components/admin/StatCard";
import { OrderTable } from "../components/admin/OrderTable";
import { Modal } from "../components/ui/Modal";
import { Pagination } from "../components/ui/Pagination";
import { useAppContext } from "../hooks/useAppContext";
import { formatCurrency } from "../utils/formatCurrency";
import { ReportModal } from "../components/ui/ReportModal";
import { OrderChatDrawer } from "../components/ui/OrderChatDrawer";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { apiRequest } from "../api/axios";
import { SellerOverviewTab } from "../components/seller/SellerOverviewTab";
import { SellerProductsTab } from "../components/seller/SellerProductsTab";
import { SellerOrdersTab } from "../components/seller/SellerOrdersTab";
import { SellerReturnsTab } from "../components/seller/SellerReturnsTab";
import { SellerReviewsTab } from "../components/seller/SellerReviewsTab";
import { SellerFaqsTab } from "../components/seller/SellerFaqsTab";
import { SellerCouponsTab } from "../components/seller/SellerCouponsTab";
import { SellerBulkUploadTab } from "../components/seller/SellerBulkUploadTab";
import { scrollToTop } from "../utils/scrollToTop";

export function SellerPage() {
  const { user, notify, confirm } = useAppContext();
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");

  useEffect(() => {
    scrollToTop({ behavior: "instant" });
  }, [section]);

  // AI draft states
  const [loadingAIDraft, setLoadingAIDraft] = useState({});
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [loadingReviewDraft, setLoadingReviewDraft] = useState({});

  const handleAIDraftReview = async (reviewId, rating, body) => {
    setLoadingReviewDraft((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const data = await apiRequest("/ai/reply-review", {
        method: "POST",
        body: { rating, reviewText: body, productId: selectedReviewProductId }
      });
      if (data && data.reply) {
        setReviewDrafts((prev) => ({ ...prev, [reviewId]: data.reply }));
        notify("✨ Review reply drafted with AI!");
      }
    } catch (err) {
      console.error("AI Review Reply Draft error:", err);
      notify(err.message || "Failed to generate reply draft.");
    } finally {
      setLoadingReviewDraft((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleAIDraftAnswer = async (faqId, question, productId) => {
    setLoadingAIDraft((prev) => ({ ...prev, [faqId]: true }));
    try {
      const data = await apiRequest("/ai/reply-qna", {
        method: "POST",
        body: { question, productId }
      });
      if (data && data.reply) {
        setAnswerDrafts((prev) => ({ ...prev, [faqId]: data.reply }));
        notify("✨ Answer drafted with AI!");
      }
    } catch (err) {
      console.error("AI Draft error:", err);
      notify(err.message || "Failed to generate draft answer.");
    } finally {
      setLoadingAIDraft((prev) => ({ ...prev, [faqId]: false }));
    }
  };

  // Coupon states
  const [couponsList, setCouponsList] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderAmount: "",
  });

  // Bulk import states
  const [bulkJson, setBulkJson] = useState("");
  const [importing, setImporting] = useState(false);

  useDocumentMetadata({
    title: "Merchant Dashboard",
    description: "Manage your seller profile, list organic products, track store orders, and view performance insights on GaramBazaar.",
    noindex: true
  });

  const [dashboard, setDashboard] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Paginated lists
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsPage, setProductsPage] = useState(1);
  const [productsPagination, setProductsPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [ordersList, setOrdersList] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPagination, setOrdersPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [returnsList, setReturnsList] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [returnsPage, setReturnsPage] = useState(1);
  const [returnsPagination, setReturnsPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [chatOrder, setChatOrder] = useState(null);

  // Sales Analytics
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Report States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState({ type: "seller", id: "", name: "" });

  const handleOpenReport = (type, id, name) => {
    setReportTarget({ type, id, name });
    setReportModalOpen(true);
  };
  
  // Reviews Tab States
  const [selectedReviewProductId, setSelectedReviewProductId] = useState("");
  const [productReviews, setProductReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // FAQ Answer States
  const [submittingAnswers, setSubmittingAnswers] = useState({});
  const [answerDrafts, setAnswerDrafts] = useState({});

  const loadSellerData = useCallback(async () => {
    try {
      const dbData = await getSellerDashboardRequest();
      setDashboard(dbData);
      
      const faqData = await getSellerFAQsRequest();
      setFaqs(faqData.faqs || []);

      if (dbData.products?.length > 0 && !selectedReviewProductId) {
        setSelectedReviewProductId(dbData.products[0].id);
      }
    } catch (err) {
      notify("Failed to load seller panel data.");
    }
  }, [notify, selectedReviewProductId]);

  const loadSellerProducts = useCallback(async (page = 1) => {
    setLoadingProducts(true);
    try {
      const data = await getSellerProductsRequest(page, 10);
      setProductsList(data.products || []);
      if (data.pagination) {
        setProductsPagination(data.pagination);
      }
    } catch (err) {
      notify("Failed to load products list.");
    } finally {
      setLoadingProducts(false);
    }
  }, [notify]);

  const loadSellerOrders = useCallback(async (page = 1) => {
    setLoadingOrders(true);
    try {
      const data = await getSellerOrdersRequest(page, 10);
      setOrdersList(data.orders || []);
      if (data.pagination) {
        setOrdersPagination(data.pagination);
      }
    } catch (err) {
      notify("Failed to load orders list.");
    } finally {
      setLoadingOrders(false);
    }
  }, [notify]);

  const loadReturns = useCallback(async (page = 1) => {
    setLoadingReturns(true);
    try {
      const res = await getReturnRequests(page, 10);
      setReturnsList(res.returns || []);
      if (res.pagination) {
        setReturnsPagination(res.pagination);
      }
    } catch (err) {
      notify("Failed to load returns list.");
    } finally {
      setLoadingReturns(false);
    }
  }, [notify]);

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const data = await getSellerSalesAnalyticsRequest();
      setSalesAnalytics(data);
    } catch (err) {
      notify("Failed to load sales analytics.");
    } finally {
      setLoadingAnalytics(false);
    }
  }, [notify]);

  const loadCoupons = useCallback(async () => {
    setLoadingCoupons(true);
    try {
      const res = await getSellerCouponsRequest();
      setCouponsList(res.coupons || []);
    } catch (err) {
      notify(err.message || "Failed to load coupons.");
    } finally {
      setLoadingCoupons(false);
    }
  }, [notify]);

  useEffect(() => {
    if (section === "coupons") {
      loadCoupons().catch(() => {});
    }
  }, [section, loadCoupons]);

  useEffect(() => {
    if (user?.role === "seller" || user?.role === "admin") {
      loadSellerData().catch(() => {});
    }
  }, [loadSellerData, user]);

  useEffect(() => {
    if ((user?.role === "seller" || user?.role === "admin") && section === "products") {
      loadSellerProducts(productsPage).catch(() => {});
    }
  }, [section, productsPage, loadSellerProducts, user]);

  useEffect(() => {
    if ((user?.role === "seller" || user?.role === "admin") && section === "orders") {
      loadSellerOrders(ordersPage).catch(() => {});
    }
  }, [section, ordersPage, loadSellerOrders, user]);

  useEffect(() => {
    if ((user?.role === "seller" || user?.role === "admin") && section === "returns") {
      loadReturns(returnsPage).catch(() => {});
    }
  }, [section, returnsPage, loadReturns, user]);

  useEffect(() => {
    if ((user?.role === "seller" || user?.role === "admin") && section === "overview") {
      loadAnalytics().catch(() => {});
    }
  }, [section, loadAnalytics, user]);

  // Load reviews when selected product changes
  useEffect(() => {
    if (selectedReviewProductId && section === "reviews") {
      setLoadingReviews(true);
      getReviewsRequest(selectedReviewProductId)
        .then((data) => {
          setProductReviews(data.reviews || []);
        })
        .catch(() => {
          notify("Failed to load product reviews.");
        })
        .finally(() => {
          setLoadingReviews(false);
        });
    }
  }, [selectedReviewProductId, section, notify]);

  const handleExportCSV = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5001";
      const session = JSON.parse(localStorage.getItem("GaramBazaar_auth") || "{}");
      const token = session?.token;
      if (!token) throw new Error("Authentication required.");

      const response = await fetch(`${backendUrl}/api/seller/analytics/export`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to export sales CSV report.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `seller-sales-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notify("CSV report downloaded successfully!");
    } catch (err) {
      notify(err.message || "Failed to download CSV.");
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue) {
      notify("Code and value are required.");
      return;
    }
    try {
      await createSellerCouponRequest({
        ...newCoupon,
        discountValue: Number(newCoupon.discountValue),
        minOrderAmount: Number(newCoupon.minOrderAmount || 0),
      });
      notify("Coupon created successfully.");
      setNewCoupon({
        code: "",
        discountType: "percent",
        discountValue: "",
        minOrderAmount: "",
      });
      loadCoupons().catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to create coupon.");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!(await confirm("Are you sure you want to delete this coupon?"))) return;
    try {
      await deleteSellerCouponRequest(id);
      notify("Coupon deleted successfully.");
      loadCoupons().catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to delete coupon.");
    }
  };

  const handleBulkImportSubmit = async (e) => {
    e.preventDefault();
    setImporting(true);
    try {
      let productsArray;
      try {
        productsArray = JSON.parse(bulkJson.trim());
      } catch (parseErr) {
        throw new Error("Invalid JSON syntax. Please check the JSON format.");
      }

      if (!Array.isArray(productsArray)) {
        throw new Error("JSON must be a valid array of product objects.");
      }

      const res = await bulkUploadProductsRequest(productsArray);
      notify(res.message || "Products uploaded successfully!");
      setBulkJson("");
      loadSellerProducts(productsPage).catch(() => {});
      loadSellerData().catch(() => {});
      setSection("products");
    } catch (err) {
      notify(err.message || "Failed to import products.");
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setBulkJson(evt.target.result);
    };
    reader.readAsText(file);
  };

  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    return (
      <section className="page-content text-center py-20">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <span className="text-5xl">🛑</span>
          <h2 className="text-2xl font-black text-gray-900 mt-4 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm mb-6">
            You must be logged in as a registered Seller to access the merchant control panel.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="w-full bg-[#c4622d] text-white font-bold py-3 px-6 rounded-xl hover:shadow-md transition-all"
          >
            Go to Login Page
          </button>
        </div>
      </section>
    );
  }

  const handleDeleteProduct = async (id) => {
    if (await confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteSellerProductRequest(id);
        notify("Product deleted successfully.");
        loadSellerProducts(productsPage);
        loadSellerData();
      } catch (err) {
        notify(err.message || "Failed to delete product.");
      }
    }
  };

  const handleAnswerSubmit = async (faqId) => {
    const draft = answerDrafts[faqId];
    if (!draft?.trim()) return;

    setSubmittingAnswers((prev) => ({ ...prev, [faqId]: true }));
    try {
      await answerQuestionRequest(faqId, draft);
      notify("Your answer has been submitted!");
      setAnswerDrafts((prev) => ({ ...prev, [faqId]: "" }));
      // Reload FAQs
      const faqData = await getSellerFAQsRequest();
      setFaqs(faqData.faqs || []);
    } catch (err) {
      notify("Failed to submit answer.");
    } finally {
      setSubmittingAnswers((prev) => ({ ...prev, [faqId]: false }));
    }
  };

  const drawLineChart = (data, width = 600, height = 200) => {
    if (!data || data.length === 0) return { points: [], path: "", areaPath: "" };
    const maxVal = Math.max(...data, 100);
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 40) + 20;
      const y = height - ((val / maxVal) * (height - 40) + 20);
      return { x, y, val, label: salesAnalytics?.labels?.[idx] || "" };
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
      return { x, y, width: barWidth, height: barHeight, val, label: salesAnalytics?.labels?.[idx] || "" };
    });
  };

  const filteredProducts = productsList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections = [
    { id: "overview", label: "Dashboard Overview", icon: "📊" },
    { id: "products", label: "My Products", icon: "📦" },
    { id: "orders", label: "Order History", icon: "🛒" },
    { id: "returns", label: "Returns Management", icon: "🔄" },
    { id: "reviews", label: "Customer Reviews", icon: "⭐" },
    { id: "faqs", label: "Buyer Q&A (FAQs)", icon: "❓" },
    { id: "coupons", label: "My Coupons", icon: "🎟️" },
    { id: "bulk-import", label: "Bulk Product Import", icon: "📥" },
  ];

  return (
    <section className="page-content admin-page">
      <div className="admin-page-head">
        <div>
          <div className="sec-label">Seller Panel</div>
          <h1 className="page-title">Merchant Center Dashboard</h1>
        </div>
        <div className="bg-[#2c1a0e]/5 border border-[#2c1a0e]/10 rounded-xl px-4 py-2 text-right">
          <p className="text-[0.72rem] text-gray-500 uppercase font-bold tracking-wider">Logged in as Merchant</p>
          <p className="text-xs font-bold text-[#c4622d]">{user.name}</p>
        </div>
      </div>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {sections.map((entry) => (
            <button
              key={entry.id}
              className={`flex items-center gap-2 text-left py-3 px-4 w-full rounded-xl transition-all border-0 cursor-pointer ${
                section === entry.id
                  ? "bg-[#c4622d] text-white font-bold"
                  : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => setSection(entry.id)}
            >
              <span className="text-lg">{entry.icon}</span>
              <span className="text-sm">{entry.label}</span>
            </button>
          ))}
          <div className="border-t border-gray-200/50 my-4 pt-4 px-2">
            <button
              type="button"
              onClick={() => handleOpenReport("seller", user.id || "seller-id", user.name)}
              className="flex items-center gap-2 text-left py-2 px-3 w-full rounded-xl transition-all border border-red-200 bg-red-50/10 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold cursor-pointer text-xs"
            >
              ⚠️ Report Issue to Admin
            </button>
          </div>
        </aside>

        {/* Workspace */}
        <div className="stack flex-1">
          {section === "overview" && dashboard ? (
            <SellerOverviewTab
              dashboard={dashboard}
              salesAnalytics={salesAnalytics}
              onExportCSV={handleExportCSV}
              onChatOrder={(order) => setChatOrder(order)}
              onUpdateOrderStatus={async (id, status, paymentStatus) => {
                try {
                  await updateSellerOrderStatusRequest(id, status, paymentStatus);
                  notify("Order status updated successfully.");
                  loadSellerData().catch(() => {});
                } catch (err) {
                  notify(err.message || "Failed to update order status.");
                }
              }}
              drawLineChart={drawLineChart}
              drawBarChart={drawBarChart}
              hoveredPoint={hoveredPoint}
              setHoveredPoint={setHoveredPoint}
            />
          ) : null}

          {section === "products" && dashboard ? (
            <SellerProductsTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onAddNewProduct={() => setShowCreateModal(true)}
              loadingProducts={loadingProducts}
              filteredProducts={filteredProducts}
              productsPagination={productsPagination}
              setProductsPage={setProductsPage}
              onEditProduct={setEditingProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          ) : null}

          {section === "orders" ? (
            <SellerOrdersTab
              loadingOrders={loadingOrders}
              ordersList={ordersList}
              ordersPagination={ordersPagination}
              setOrdersPage={setOrdersPage}
              onChatOrder={(order) => setChatOrder(order)}
              onUpdateOrderStatus={async (id, status, paymentStatus) => {
                try {
                  await updateSellerOrderStatusRequest(id, status, paymentStatus);
                  notify("Order status updated successfully.");
                  loadSellerOrders(ordersPage).catch(() => {});
                } catch (err) {
                  notify(err.message || "Failed to update order status.");
                }
              }}
            />
          ) : null}

          {section === "returns" ? (
            <SellerReturnsTab
              loadingReturns={loadingReturns}
              returnsList={returnsList}
              returnsPagination={returnsPagination}
              setReturnsPage={setReturnsPage}
              onApproveReturn={async (id) => {
                if (await confirm("Are you sure you want to APPROVE this return request? Stock will be restored and refund initiated.")) {
                  try {
                    await updateReturnRequestStatus(id, "approved");
                    notify("Return request approved.");
                    loadReturns(returnsPage).catch(() => {});
                  } catch (err) {
                    notify(err.message || "Failed to approve return.");
                  }
                }
              }}
              onRejectReturn={async (id) => {
                if (await confirm("Are you sure you want to REJECT this return request?")) {
                  try {
                    await updateReturnRequestStatus(id, "rejected");
                    notify("Return request rejected.");
                    loadReturns(returnsPage).catch(() => {});
                  } catch (err) {
                    notify(err.message || "Failed to reject return.");
                  }
                }
              }}
            />
          ) : null}

          {section === "reviews" && dashboard ? (
            <SellerReviewsTab
              dashboard={dashboard}
              selectedReviewProductId={selectedReviewProductId}
              setSelectedReviewProductId={setSelectedReviewProductId}
              loadingReviews={loadingReviews}
              productReviews={productReviews}
              handleAIDraftReview={handleAIDraftReview}
              loadingReviewDraft={loadingReviewDraft}
              reviewDrafts={reviewDrafts}
              notify={notify}
            />
          ) : null}

          {section === "faqs" && (
            <SellerFaqsTab
              faqs={faqs}
              dashboard={dashboard}
              answerDrafts={answerDrafts}
              setAnswerDrafts={setAnswerDrafts}
              handleAnswerSubmit={handleAnswerSubmit}
              submittingAnswers={submittingAnswers}
              handleAIDraftAnswer={handleAIDraftAnswer}
              loadingAIDraft={loadingAIDraft}
            />
          )}

          {section === "coupons" ? (
            <SellerCouponsTab
              newCoupon={newCoupon}
              setNewCoupon={setNewCoupon}
              handleCreateCoupon={handleCreateCoupon}
              loadingCoupons={loadingCoupons}
              couponsList={couponsList}
              handleDeleteCoupon={handleDeleteCoupon}
            />
          ) : null}

          {section === "bulk-import" ? (
            <SellerBulkUploadTab
              handleBulkImportSubmit={handleBulkImportSubmit}
              bulkJson={bulkJson}
              setBulkJson={setBulkJson}
              handleFileChange={handleFileChange}
              importing={importing}
            />
          ) : null}
        </div>
      </div>

      {/* Product Modals */}
      {editingProduct ? (
        <Modal title={`Edit ${editingProduct.name}`} onClose={() => setEditingProduct(null)}>
          <ProductForm
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSubmit={async (payload) => {
              try {
                await updateSellerProductRequest(payload.id, payload);
                notify("Product updated successfully.");
                setEditingProduct(null);
                loadSellerProducts(productsPage);
                loadSellerData();
              } catch (err) {
                notify(err.message || "Failed to update product.");
              }
            }}
          />
        </Modal>
      ) : null}

      {showCreateModal ? (
        <Modal title="Add Product" onClose={() => setShowCreateModal(false)}>
          <ProductForm
            onClose={() => setShowCreateModal(false)}
            onSubmit={async (payload) => {
              try {
                await createSellerProductRequest(payload);
                notify("Product created successfully.");
                setShowCreateModal(false);
                loadSellerProducts(productsPage);
                loadSellerData();
              } catch (err) {
                notify(err.message || "Failed to create product.");
              }
            }}
          />
        </Modal>
      ) : null}

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportType={reportTarget.type}
        targetId={reportTarget.id}
        targetName={reportTarget.name}
      />

      {chatOrder && (
        <OrderChatDrawer
          orderId={chatOrder.id}
          orderNumber={chatOrder.orderNumber || chatOrder.id}
          recipientId={chatOrder.userId?.id || chatOrder.userId?._id || chatOrder.userId}
          onClose={() => setChatOrder(null)}
        />
      )}
    </section>
  );
}
