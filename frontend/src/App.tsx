import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { SearchMedicines } from './pages/customer/SearchMedicines';
import { MedicineDetails } from './pages/customer/MedicineDetails';
import { Inventory } from './pages/pharmacy/Inventory';
import { AddMedicine } from './pages/pharmacy/AddMedicine';
import { PrescriptionUpload } from './pages/customer/PrescriptionUpload';
import { PrescriptionVerification } from './pages/pharmacist/PrescriptionVerification';
import { Cart } from './pages/customer/Cart';
import { Checkout } from './pages/customer/Checkout';
import { Orders } from './pages/customer/Orders';
import { OrderTracking } from './pages/customer/OrderTracking';
import { LabTests } from './pages/customer/LabTests';
import { Healthcare } from './pages/customer/Healthcare';
import { OrderManagement } from './pages/pharmacy/OrderManagement';
import { DeliveryLayout } from './layouts/DeliveryLayout';
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard';
import { MyDeliveries } from './pages/delivery/MyDeliveries';
import { DeliveryPickups } from './pages/delivery/DeliveryPickups';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PharmacyLogin } from './pages/pharmacy/auth/PharmacyLogin';
import { PharmacyDashboard } from './pages/pharmacy/Dashboard';
import { PharmacyLayout } from './layouts/PharmacyLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRedirect } from './components/RoleRedirect';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
              <Routes>
                {/* Pharmacy Auth Route (Standalone) */}
                <Route path="/pharmacy/login" element={<RoleRedirect><PharmacyLogin /></RoleRedirect>} />

                {/* Pharmacy Portal Routes (Wrapped in PharmacyLayout) */}
                <Route path="/pharmacy" element={<ProtectedRoute allowedRoles={['PHARMACY_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']}><PharmacyLayout /></ProtectedRoute>}>
                  <Route path="dashboard" element={<PharmacyDashboard />} />
                  <Route path="inventory" element={<ProtectedRoute allowedRoles={['PHARMACY_ADMIN', 'SUPER_ADMIN']}><Inventory /></ProtectedRoute>} />
                  <Route path="medicines/add" element={<ProtectedRoute allowedRoles={['PHARMACY_ADMIN', 'SUPER_ADMIN']}><AddMedicine /></ProtectedRoute>} />
                  <Route path="orders" element={<ProtectedRoute allowedRoles={['PHARMACY_ADMIN', 'SUPER_ADMIN']}><OrderManagement /></ProtectedRoute>} />
                  <Route path="prescriptions/pending" element={<ProtectedRoute allowedRoles={['PHARMACIST', 'SUPER_ADMIN']}><PrescriptionVerification /></ProtectedRoute>} />
                </Route>

                {/* Super Admin Portal Routes (Wrapped in AdminLayout) */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminLayout /></ProtectedRoute>}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>

                {/* Delivery Agent Portal Routes (Wrapped in DeliveryLayout) */}
                <Route path="/delivery" element={<ProtectedRoute allowedRoles={['DELIVERY_AGENT']}><DeliveryLayout /></ProtectedRoute>}>
                  <Route path="dashboard" element={<DeliveryDashboard />} />
                  <Route path="my-deliveries" element={<MyDeliveries />} />
                  <Route path="pickups" element={<DeliveryPickups />} />
                </Route>

                {/* Main Website Routes (Wrapped in Navbar/Footer) */}
                <Route path="/*" element={
                  <RoleRedirect>
                    <>
                      <Navbar />
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<SearchMedicines />} />
                        <Route path="/medicines/:id" element={<MedicineDetails />} />
                        <Route path="/lab-tests" element={<LabTests />} />
                        <Route path="/healthcare" element={<Healthcare />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Customer Authenticated Routes */}
                        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                        <Route path="/orders/:id/track" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                        <Route path="/customer/prescriptions/upload" element={<ProtectedRoute><PrescriptionUpload /></ProtectedRoute>} />

                        {/* Removed old delivery routes from here */}
                      </Routes>
                      <Footer />
                    </>
                  </RoleRedirect>
                } />
              </Routes>
            </div>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
