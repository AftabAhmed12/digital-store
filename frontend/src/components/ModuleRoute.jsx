import { Navigate } from "react-router-dom";
import { canAccess, firstAccessibleRoute } from "../utils/adminAccess.js";

// Guards an admin route by module access. Backend enforces this too, so even a
// manually copy-pasted URL cannot reach a module the admin isn't allowed to see.
// Denied admins are sent to their first granted tab (never the dashboard, which
// is super-admin only), avoiding the old redirect-to-dashboard loop.
export default function ModuleRoute({ module, action = "view", children }) {
  if (!canAccess(module, action)) return <Navigate to={firstAccessibleRoute()} replace />;
  return children;
}