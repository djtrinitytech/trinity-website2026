import PublicGallery from './components/PublicGallery';
import AdminPanel from './components/AdminPanel';

export default function App() {
  return window.location.pathname.startsWith('/admin') ? <AdminPanel /> : <PublicGallery />;
}
