import { useLocation,Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const hideNavbarFooter = ['/auth/signin', '/auth/signup'].includes(location.pathname);

  return (
    <>
      {!hideNavbarFooter && <Navbar />}
      <main className="min-h-screen">
        <Outlet />
      </main>
      {!hideNavbarFooter && <Footer />}
    </>
  );
};

export default MainLayout;