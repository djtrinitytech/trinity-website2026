import React from "react";
import AdminLayout from "../components/admin/AdminLayout";

/**
 * Route-level page for /admin.
 * Uses AdminLayout which provides the sidebar, toasts, confirmation modal, and <Outlet />.
 */
export default function Admin() {
  return <AdminLayout />;
}
