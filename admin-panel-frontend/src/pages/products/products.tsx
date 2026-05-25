import { Navigate } from 'react-router-dom';

/**
 * Products page — redirects to the metadata-driven entity page.
 * The dynamic entity engine handles all CRUD for "products" via /entities/products.
 */
export default function ProductsPage() {
  return <Navigate to="/entities/products" replace />;
}
