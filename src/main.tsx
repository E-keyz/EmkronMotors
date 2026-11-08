import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import './index.css';

// Owner-only admin lives at /admin. The public site is untouched.
const isAdminPage = window.location.pathname.startsWith('/admin');

createRoot(document.getElementById('root')!).render(isAdminPage ? <AdminApp /> : <App />);
