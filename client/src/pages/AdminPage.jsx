import { useCallback, useEffect, useState } from "react";
import {
  createProductRequest,
  getDashboardRequest,
  updateOrderStatusRequest,
  updateProductRequest,
} from "../api/admin.api";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { OrderTable } from "../components/admin/OrderTable";
import { ProductForm } from "../components/admin/ProductForm";
import { ProductTable } from "../components/admin/ProductTable";
import { StatCard } from "../components/admin/StatCard";
import { Modal } from "../components/ui/Modal";
import { useAppContext } from "../hooks/useAppContext";

export function AdminPage() {
  const { user, notify } = useAppContext();
  const [section, setSection] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadDashboard = useCallback(async () => {
    const data = await getDashboardRequest();
    setDashboard(data);
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      loadDashboard().catch(() => {});
    }
  }, [loadDashboard, user]);

  if (!user || user.role !== "admin") {
    return (
      <section className="page-content">
        <p>Admin access required.</p>
      </section>
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
            <>
              <div className="stats-grid">
                <StatCard label="Revenue" value={dashboard.stats.revenue} currency />
                <StatCard label="Orders" value={dashboard.stats.orders} />
                <StatCard label="Products" value={dashboard.stats.products} />
                <StatCard label="Users" value={dashboard.stats.users} />
              </div>
              <OrderTable
                orders={dashboard.recentOrders}
                onUpdateStatus={async (id, status) => {
                  await updateOrderStatusRequest(id, status);
                  notify("Order status updated.");
                  loadDashboard().catch(() => {});
                }}
              />
            </>
          ) : null}

          {section === "products" && dashboard ? (
            <>
              <div className="section-head">
                <h1 className="page-title">Products</h1>
                <button className="button button-primary" onClick={() => setShowCreateModal(true)}>
                  Add product
                </button>
              </div>
              <ProductTable products={dashboard.products} onEdit={setEditingProduct} />
            </>
          ) : null}

          {section === "orders" && dashboard ? (
            <OrderTable
              orders={dashboard.recentOrders}
              onUpdateStatus={async (id, status) => {
                await updateOrderStatusRequest(id, status);
                notify("Order status updated.");
                loadDashboard().catch(() => {});
              }}
            />
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
        </div>
      </div>

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
    </section>
  );
}
