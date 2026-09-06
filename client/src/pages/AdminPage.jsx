import { useCallback, useEffect, useState } from "react";
import {
  createProductRequest,
  getDashboardRequest,
  updateProductRequest,
  getUsersRequest,
  sendAdminNotificationRequest,
  getAdminCouponsRequest,
  getAdminBrandsRequest,
  getAdminReportsRequest,
  getAdminSalesAnalyticsRequest,
  getPendingReviewsRequest,
  getAdminGeoAnalyticsRequest,
  getAdminSettingsRequest,
} from "../api/admin.api";
import { getReturnRequests } from "../api/return.api";
import { getNewsletterSubscribersRequest } from "../api/newsletter.api";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { OrderTable } from "../components/admin/OrderTable";
import { ProductForm } from "../components/admin/ProductForm";
import { Modal } from "../components/ui/Modal";
import { useAppContext } from "../hooks/useAppContext";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { AdminOverviewTab } from "../components/admin/AdminOverviewTab";
import { AdminProductsTab } from "../components/admin/AdminProductsTab";
import { AdminUsersTab } from "../components/admin/AdminUsersTab";
import { AdminReportsTab } from "../components/admin/AdminReportsTab";
import { AdminReturnsTab } from "../components/admin/AdminReturnsTab";
import { AdminMessagingTab } from "../components/admin/AdminMessagingTab";
import { AdminNewsletterTab } from "../components/admin/AdminNewsletterTab";
import { AdminCouponsTab } from "../components/admin/AdminCouponsTab";
import { AdminBrandsTab } from "../components/admin/AdminBrandsTab";
import { AdminCategoriesTab } from "../components/admin/AdminCategoriesTab";
import { AdminSellerVerifyTab } from "../components/admin/AdminSellerVerifyTab";
import { AdminReviewModTab } from "../components/admin/AdminReviewModTab";
import { AdminSupportTab } from "../components/admin/AdminSupportTab";
import { AdminSettingsTab } from "../components/admin/AdminSettingsTab";

export function AdminPage() {
  const { user, login, logout, notify, categories, reloadCategories, confirm } = useAppContext();
  const [section, setSection] = useState("overview");

  // Custom AI popup prompt configuration
  const [promptConfig, setPromptConfig] = useState(null);

  // Admin login states
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useDocumentMetadata({
    title: "Administrator Panel",
    description: "Manage system dashboard, moderate products, review orders, verify user profiles, and send notifications on GaramBazaar.",
    noindex: true,
  });

  // Core Dashboard state
  const [dashboard, setDashboard] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Analytics
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [geoAnalytics, setGeoAnalytics] = useState([]);
  const [loadingGeo, setLoadingGeo] = useState(false);

  // Users state
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPagination, setUsersPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  // Message individual user modal state
  const [selectedUserForMsg, setSelectedUserForMsg] = useState(null);
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [sendEmailCheckbox, setSendEmailCheckbox] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Reports state
  const [reportsList, setReportsList] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsPage, setReportsPage] = useState(1);

  // Returns state
  const [returnsList, setReturnsList] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [returnsPage, setReturnsPage] = useState(1);
  const [returnsPagination, setReturnsPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  // Newsletter state
  const [subscribersList, setSubscribersList] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  // Coupons state
  const [couponsList, setCouponsList] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderAmount: "",
    expiresAt: "",
  });

  // Brands state
  const [brandsList, setBrandsList] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Seller verifications state
  const [sellersList, setSellersList] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [sellersPage, setSellersPage] = useState(1);
  const [sellersPagination, setSellersPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  // Review moderation state
  const [pendingReviewsList, setPendingReviewsList] = useState([]);
  const [loadingPendingReviews, setLoadingPendingReviews] = useState(false);
  const [pendingReviewsPage, setPendingReviewsPage] = useState(1);
  const [pendingReviewsPagination, setPendingReviewsPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  // Site Settings state
  const [siteSettings, setSiteSettings] = useState({
    shippingFee: 49,
    shippingFreeThreshold: 500,
    homepageBanners: [],
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Data Loading callbacks
  const loadDashboard = useCallback(async () => {
    const data = await getDashboardRequest();
    setDashboard(data);
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await getAdminSalesAnalyticsRequest();
      setSalesAnalytics(data);
    } catch (err) {
      notify(err.message || "Failed to load sales analytics.");
    }
  }, [notify]);

  const loadGeoAnalytics = useCallback(async () => {
    setLoadingGeo(true);
    try {
      const data = await getAdminGeoAnalyticsRequest();
      setGeoAnalytics(data.geoStats || []);
    } catch (err) {
      notify(err.message || "Failed to load geographic analytics.");
    } finally {
      setLoadingGeo(false);
    }
  }, [notify]);

  const loadUsers = useCallback(
    async (page = 1) => {
      setLoadingUsers(true);
      try {
        const data = await getUsersRequest(page, 10);
        setUsersList(data.users || []);
        if (data.pagination) setUsersPagination(data.pagination);
      } catch (err) {
        notify(err.message || "Failed to load users.");
      } finally {
        setLoadingUsers(false);
      }
    },
    [notify]
  );

  const loadReports = useCallback(
    async (page = 1) => {
      setLoadingReports(true);
      try {
        const res = await getAdminReportsRequest(page, 10);
        setReportsList(res.reports || []);
      } catch (err) {
        notify(err.message || "Failed to load reports.");
      } finally {
        setLoadingReports(false);
      }
    },
    [notify]
  );

  const loadReturns = useCallback(
    async (page = 1) => {
      setLoadingReturns(true);
      try {
        const res = await getReturnRequests(page, 10);
        setReturnsList(res.returns || []);
        if (res.pagination) setReturnsPagination(res.pagination);
      } catch (err) {
        notify(err.message || "Failed to load returns.");
      } finally {
        setLoadingReturns(false);
      }
    },
    [notify]
  );

  const loadSubscribers = useCallback(async () => {
    setLoadingSubscribers(true);
    try {
      const data = await getNewsletterSubscribersRequest();
      setSubscribersList(data.subscribers || []);
    } catch (err) {
      notify(err.message || "Failed to load newsletter subscribers.");
    } finally {
      setLoadingSubscribers(false);
    }
  }, [notify]);

  const loadCoupons = useCallback(async () => {
    setLoadingCoupons(true);
    try {
      const res = await getAdminCouponsRequest();
      setCouponsList(res.coupons || []);
    } catch (err) {
      notify(err.message || "Failed to load coupons.");
    } finally {
      setLoadingCoupons(false);
    }
  }, [notify]);

  const loadBrands = useCallback(async () => {
    setLoadingBrands(true);
    try {
      const res = await getAdminBrandsRequest();
      setBrandsList(res.brands || []);
    } catch (err) {
      notify(err.message || "Failed to load brands.");
    } finally {
      setLoadingBrands(false);
    }
  }, [notify]);

  const loadPendingSellers = useCallback(
    async (page = 1) => {
      setLoadingSellers(true);
      try {
        const data = await getUsersRequest(page, 10, "seller", "new");
        setSellersList(data.users || []);
        if (data.pagination) setSellersPagination(data.pagination);
      } catch (err) {
        notify(err.message || "Failed to load pending sellers.");
      } finally {
        setLoadingSellers(false);
      }
    },
    [notify]
  );

  const loadPendingReviews = useCallback(
    async (page = 1) => {
      setLoadingPendingReviews(true);
      try {
        const data = await getPendingReviewsRequest(page, 10);
        setPendingReviewsList(data.reviews || []);
        if (data.pagination) setPendingReviewsPagination(data.pagination);
      } catch (err) {
        notify(err.message || "Failed to load pending reviews.");
      } finally {
        setLoadingPendingReviews(false);
      }
    },
    [notify]
  );

  const loadSiteSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const data = await getAdminSettingsRequest();
      if (data) {
        setSiteSettings({
          shippingFee: data.shippingFee ?? 49,
          shippingFreeThreshold: data.shippingFreeThreshold ?? 500,
          homepageBanners: data.homepageBanners || [],
        });
      }
    } catch (err) {
      notify(err.message || "Failed to load site settings.");
    } finally {
      setLoadingSettings(false);
    }
  }, [notify]);

  // CSV Export
  const handleExportCSV = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5001";
      const session = JSON.parse(localStorage.getItem("GaramBazaar_auth") || "{}");
      const token = session?.token;
      if (!token) throw new Error("Authentication required.");

      const response = await fetch(`${backendUrl}/api/admin/analytics/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to export admin CSV report.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-sales-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notify("CSV report downloaded successfully!");
    } catch (err) {
      notify(err.message || "Failed to download CSV.");
    }
  };

  // Direct Message to User Modal Submit
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUserForMsg || !msgTitle || !msgBody) return;
    setSendingMsg(true);
    try {
      await sendAdminNotificationRequest({
        userId: selectedUserForMsg.id,
        title: msgTitle,
        message: msgBody,
        sendEmailCheckbox,
      });
      notify(`Message sent successfully to ${selectedUserForMsg.name}.`);
      setSelectedUserForMsg(null);
      setMsgTitle("");
      setMsgBody("");
    } catch (err) {
      notify(err.message || "Failed to send message.");
    } finally {
      setSendingMsg(false);
    }
  };

  // Admin login handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!adminEmail.trim() || !adminPassword) {
      setLoginError("Please enter both email and password.");
      return;
    }
    setLoginLoading(true);
    try {
      const loggedInUser = await login({ email: adminEmail.trim(), password: adminPassword });
      if (loggedInUser.role !== "admin") {
        setLoginError("Access denied. Admin credentials required.");
        await logout();
      } else {
        notify("Welcome back, Administrator! 🛠️");
      }
    } catch (err) {
      setLoginError(err?.message || "Invalid credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Section Effects
  useEffect(() => {
    if (user?.role === "admin") {
      loadDashboard().catch(() => {});
    }
  }, [loadDashboard, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "overview") {
      loadAnalytics().catch(() => {});
      loadGeoAnalytics().catch(() => {});
    }
  }, [section, loadAnalytics, loadGeoAnalytics, user]);

  useEffect(() => {
    if (user?.role === "admin" && (section === "users" || section === "messaging")) {
      loadUsers(usersPage).catch(() => {});
    }
  }, [section, loadUsers, user, usersPage]);

  useEffect(() => {
    if (user?.role === "admin" && section === "reports") {
      loadReports(reportsPage).catch(() => {});
    }
  }, [section, loadReports, user, reportsPage]);

  useEffect(() => {
    if (user?.role === "admin" && section === "returns") {
      loadReturns(returnsPage).catch(() => {});
    }
  }, [section, loadReturns, user, returnsPage]);

  useEffect(() => {
    if (user?.role === "admin" && section === "newsletter") {
      loadSubscribers().catch(() => {});
    }
  }, [section, loadSubscribers, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "coupons") {
      loadCoupons().catch(() => {});
    }
  }, [section, loadCoupons, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "brands") {
      loadBrands().catch(() => {});
    }
  }, [section, loadBrands, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "seller-verifications") {
      loadPendingSellers(sellersPage).catch(() => {});
    }
  }, [section, loadPendingSellers, user, sellersPage]);

  useEffect(() => {
    if (user?.role === "admin" && section === "review-moderations") {
      loadPendingReviews(pendingReviewsPage).catch(() => {});
    }
  }, [section, loadPendingReviews, user, pendingReviewsPage]);

  useEffect(() => {
    if (user?.role === "admin" && section === "settings") {
      loadSiteSettings().catch(() => {});
    }
  }, [section, loadSiteSettings, user]);

  // Auth Guard
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-[#1f2937] p-8 rounded-2xl border border-gray-700 shadow-2xl">
          <div>
            <div className="flex justify-center text-4xl mb-3">🛠️</div>
            <h2 className="text-center text-2xl font-extrabold text-white">
              GaramBazaar Admin Portal
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Sign in to manage the platform settings, users, and listings
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
            {loginError && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 text-xs rounded-xl p-3 text-center font-medium">
                {loginError}
              </div>
            )}
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@garambazaar.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 text-xs font-semibold"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loginLoading ? "Authenticating..." : "Sign In to Admin Portal →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <section className="page-content admin-page">
      <div className="admin-page-head">
        <div>
          <div className="sec-label">Admin Panel</div>
          <h1 className="page-title">Store Control Center</h1>
        </div>
      </div>

      <div className="admin-layout">
        <AdminSidebar section={section} onChange={setSection} />

        <div className="stack">
          {section === "overview" && dashboard ? (
            <AdminOverviewTab
              dashboard={dashboard}
              salesAnalytics={salesAnalytics}
              geoAnalytics={geoAnalytics}
              loadingGeo={loadingGeo}
              handleExportCSV={handleExportCSV}
            />
          ) : null}

          {section === "products" && dashboard ? (
            <AdminProductsTab
              dashboard={dashboard}
              onAddProduct={() => setShowCreateModal(true)}
              onEditProduct={setEditingProduct}
            />
          ) : null}

          {section === "orders" && dashboard ? (
            <OrderTable orders={dashboard.recentOrders} readOnly={true} />
          ) : null}

          {section === "reviews" && dashboard ? (
            <div className="stack">
              {dashboard.reviews.map((review) => (
                <article key={review.id} className="rcard">
                  <div className="rcard-head">
                    <span className="rcard-name">{review.title}</span>
                  </div>
                  <div className="rcard-text">{review.body}</div>
                </article>
              ))}
            </div>
          ) : null}

          {section === "users" ? (
            <AdminUsersTab
              usersList={usersList}
              loadingUsers={loadingUsers}
              usersPagination={usersPagination}
              usersPage={usersPage}
              setUsersPage={setUsersPage}
              loadUsers={loadUsers}
              onMessageUser={setSelectedUserForMsg}
              notify={notify}
              confirm={confirm}
            />
          ) : null}

          {section === "reports" ? (
            <AdminReportsTab
              loadingReports={loadingReports}
              reportsList={reportsList}
              reportsPage={reportsPage}
              loadReports={loadReports}
              loadDashboard={loadDashboard}
              notify={notify}
              confirm={confirm}
            />
          ) : null}

          {section === "returns" ? (
            <AdminReturnsTab
              returnsList={returnsList}
              loadingReturns={loadingReturns}
              returnsPagination={returnsPagination}
              returnsPage={returnsPage}
              setReturnsPage={setReturnsPage}
              loadReturns={loadReturns}
              notify={notify}
              confirm={confirm}
            />
          ) : null}

          {section === "messaging" ? (
            <AdminMessagingTab
              usersList={usersList}
              notify={notify}
              setPromptConfig={setPromptConfig}
            />
          ) : null}

          {section === "newsletter" ? (
            <AdminNewsletterTab
              subscribersList={subscribersList}
              loadingSubscribers={loadingSubscribers}
              notify={notify}
            />
          ) : null}

          {section === "coupons" ? (
            <AdminCouponsTab
              couponsList={couponsList}
              loadingCoupons={loadingCoupons}
              newCoupon={newCoupon}
              setNewCoupon={setNewCoupon}
              loadCoupons={loadCoupons}
              notify={notify}
              confirm={confirm}
            />
          ) : null}

          {section === "brands" ? (
            <AdminBrandsTab
              brandsList={brandsList}
              loadingBrands={loadingBrands}
              loadBrands={loadBrands}
              notify={notify}
              confirm={confirm}
              setPromptConfig={setPromptConfig}
            />
          ) : null}

          {section === "categories" ? (
            <AdminCategoriesTab
              categories={categories}
              reloadCategories={reloadCategories}
              notify={notify}
              confirm={confirm}
            />
          ) : null}

          {section === "seller-verifications" ? (
            <AdminSellerVerifyTab
              sellersList={sellersList}
              loadingSellers={loadingSellers}
              sellersPagination={sellersPagination}
              sellersPage={sellersPage}
              setSellersPage={setSellersPage}
              loadPendingSellers={loadPendingSellers}
              notify={notify}
            />
          ) : null}

          {section === "review-moderations" ? (
            <AdminReviewModTab
              pendingReviewsList={pendingReviewsList}
              loadingPendingReviews={loadingPendingReviews}
              pendingReviewsPagination={pendingReviewsPagination}
              pendingReviewsPage={pendingReviewsPage}
              setPendingReviewsPage={setPendingReviewsPage}
              loadPendingReviews={loadPendingReviews}
              notify={notify}
              confirm={confirm}
            />
          ) : null}

          {section === "support-tickets" ? (
            <AdminSupportTab notify={notify} confirm={confirm} />
          ) : null}

          {section === "settings" ? (
            <AdminSettingsTab
              siteSettings={siteSettings}
              setSiteSettings={setSiteSettings}
              loadingSettings={loadingSettings}
              savingSettings={savingSettings}
              setSavingSettings={setSavingSettings}
              loadSiteSettings={loadSiteSettings}
              notify={notify}
              setPromptConfig={setPromptConfig}
            />
          ) : null}
        </div>
      </div>

      {/* Product Edit Modal */}
      {editingProduct ? (
        <Modal title={`Edit ${editingProduct.name}`} onClose={() => setEditingProduct(null)}>
          <ProductForm
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSubmit={async (payload) => {
              await updateProductRequest(payload.id, payload);
              notify("Product updated.");
              setEditingProduct(null);
              loadDashboard().catch(() => {});
            }}
          />
        </Modal>
      ) : null}

      {/* Product Create Modal */}
      {showCreateModal ? (
        <Modal title="Add Product" onClose={() => setShowCreateModal(false)}>
          <ProductForm
            onClose={() => setShowCreateModal(false)}
            onSubmit={async (payload) => {
              await createProductRequest(payload);
              notify("Product created.");
              setShowCreateModal(false);
              loadDashboard().catch(() => {});
            }}
          />
        </Modal>
      ) : null}

      {/* Direct User Message Modal */}
      {selectedUserForMsg ? (
        <Modal
          title={`Send Message to ${selectedUserForMsg.name || "Unknown User"}`}
          onClose={() => setSelectedUserForMsg(null)}
        >
          <form onSubmit={handleSendMessage} className="stack text-sm">
            <div className="field">
              <label className="label">Subject / Title</label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. Special Offer or Account Update"
                value={msgTitle}
                onChange={(e) => setMsgTitle(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Message Body</label>
              <textarea
                className="input min-h-[120px]"
                required
                placeholder="Write your message here..."
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="sendEmailCheckbox"
                checked={sendEmailCheckbox}
                onChange={(e) => setSendEmailCheckbox(e.target.checked)}
                className="cursor-pointer"
              />
              <label
                htmlFor="sendEmailCheckbox"
                className="font-semibold text-gray-700 cursor-pointer select-none"
              >
                📧 Send direct Email to user
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setSelectedUserForMsg(null)}
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary" disabled={sendingMsg}>
                {sendingMsg ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {/* AI Draft Prompt Modal */}
      {promptConfig ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dk/50 backdrop-blur-md transition-opacity duration-300 ease-out animate-fade-in"
          onClick={() => setPromptConfig(null)}
        >
          <div
            className="relative transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-bd/30 transition-all sm:w-full sm:max-w-md animate-fadeUp text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-[#c4622d] border border-amber-100 shadow-sm mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold leading-6 text-dk font-serif mb-2">
                {promptConfig.title}
              </h3>
              <p className="text-sm text-gray-500 font-semibold leading-relaxed mb-4">
                {promptConfig.description}
              </p>
              <div className="field">
                <input
                  type="text"
                  className="input py-2.5 w-full text-sm rounded-xl border border-gray-250 focus:border-amber-500 focus:ring-amber-500 outline-none"
                  placeholder={promptConfig.placeholder}
                  id="modalPromptInput"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = e.target.value;
                      promptConfig.onSubmit(val);
                      setPromptConfig(null);
                    }
                  }}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button
                type="button"
                className="inline-flex w-full sm:w-auto justify-center rounded-xl bg-warm px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm border border-bd/50 hover:bg-cream/40 transition-colors cursor-pointer"
                onClick={() => setPromptConfig(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex w-full sm:w-auto justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md bg-tc hover:bg-tcl hover:shadow-lg transition-all cursor-pointer border-0"
                onClick={() => {
                  const val = document.getElementById("modalPromptInput")?.value;
                  promptConfig.onSubmit(val);
                  setPromptConfig(null);
                }}
              >
                Draft with AI
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
