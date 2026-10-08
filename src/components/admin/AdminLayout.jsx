import React, { useState, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./AdminCommon.css";

const AdminUIContext = createContext(null);

export const useAdminUI = () => {
  const context = useContext(AdminUIContext);
  if (!context) {
    throw new Error("useAdminUI must be used within AdminLayout");
  }
  return context;
};

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toast Notification System
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  // Confirmation Modal System
  const [confirmDialog, setConfirmDialog] = useState(null);
  const confirmAction = ({
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Delete",
    isDanger = true,
    onConfirm,
  }) => {
    setConfirmDialog({
      title,
      message,
      confirmText,
      isDanger,
      onConfirm: async () => {
        setConfirmDialog(null);
        if (onConfirm) await onConfirm();
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <AdminUIContext.Provider value={{ showToast, confirmAction }}>
      <div className="admin-shell">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="admin-sidebar-overlay"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Modular Sidebar Component */}
        <AdminSidebar sidebarOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        <div className="admin-main">
          {/* Top Bar for Mobile */}
          <header className="admin-topbar">
            <button
              type="button"
              className="admin-hamburger-btn"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <span
              style={{
                fontFamily: "'DM Serif Display', serif",
                color: "#ded6c5",
                fontSize: 16,
              }}
            >
              TRINITY CMS
            </span>
            <div style={{ width: 32 }} />
          </header>

          <main className="admin-page-container">
            {children || <Outlet />}
          </main>
        </div>

        {/* Toast Container */}
        <div className="admin-toast-container" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`admin-toast toast-${t.type}`}>
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        {/* Modal Backdrop & Box */}
        {confirmDialog && (
          <div
            className="admin-modal-backdrop"
            role="dialog"
            aria-modal="true"
            onClick={confirmDialog.onCancel}
          >
            <div
              className="admin-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{confirmDialog.title}</h3>
              <p>{confirmDialog.message}</p>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={confirmDialog.onCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`admin-btn ${
                    confirmDialog.isDanger
                      ? "admin-btn-danger"
                      : "admin-btn-primary"
                  }`}
                  onClick={confirmDialog.onConfirm}
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminUIContext.Provider>
  );
}
