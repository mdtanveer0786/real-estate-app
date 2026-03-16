import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import Loader from './components/common/Loader';
import ErrorBoundary from './components/common/ErrorBoundary';
import Newsletter from './components/common/Newsletter';
import ScrollToTop from './components/common/ScrollToTop';
import CookieConsent from './components/common/CookieConsent';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const Login = lazy(() => import('./components/auth/Login'));
const Register = lazy(() => import('./components/auth/Register'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Scroll to top on route change
const ScrollToTopOnMount = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

// Analytics tracking (optional)
const PageViewTracker = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Track page view with Google Analytics
        if (window.gtag) {
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: pathname,
            });
        }

        // You can add other analytics here
    }, [pathname]);

    return null;
};

function AppContent() {
    const location = useLocation();
    const isAdminPath = location.pathname.startsWith('/admin');

    return (
        <>
            <ScrollToTopOnMount />
            <PageViewTracker />
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
                {!isAdminPath && <Navbar />}
                <main className={`flex-grow ${!isAdminPath ? 'pt-20' : ''}`}>
                    <Suspense fallback={<Loader />}>
                        <ErrorBoundary>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<HomePage />} />
                                <Route path="/properties" element={<PropertiesPage />} />
                                <Route path="/property/:id" element={<PropertyDetailPage />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                                <Route path="/about" element={<AboutPage />} />
                                <Route path="/contact" element={<ContactPage />} />
                                <Route path="/faq" element={<FAQPage />} />
                                <Route path="/terms" element={<TermsPage />} />
                                <Route path="/privacy" element={<PrivacyPage />} />

                                {/* Protected Routes */}
                                <Route path="/wishlist" element={
                                    <PrivateRoute>
                                        <WishlistPage />
                                    </PrivateRoute>
                                } />
                                <Route path="/profile" element={
                                    <PrivateRoute>
                                        <ProfilePage />
                                    </PrivateRoute>
                                } />

                                {/* Admin Routes */}
                                <Route path="/admin/*" element={
                                    <AdminRoute>
                                        <AdminPage />
                                    </AdminRoute>
                                } />

                                {/* 404 Route */}
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </ErrorBoundary>
                    </Suspense>
                </main>
                {!isAdminPath && <Newsletter />}
                {!isAdminPath && <Footer />}
                <CookieConsent />
            </div>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        fontSize: '14px',
                        borderRadius: '8px',
                        padding: '12px 16px',
                    },
                    success: {
                        duration: 3000,
                        icon: '✅',
                        style: {
                            background: '#10b981',
                        },
                    },
                    error: {
                        duration: 4000,
                        icon: '❌',
                        style: {
                            background: '#ef4444',
                        },
                    },
                    loading: {
                        duration: Infinity,
                        style: {
                            background: '#3b82f6',
                        },
                    },
                }}
            />
        </>
    );
}

function App() {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <AuthProvider>
                    <WishlistProvider>
                        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                            <AppContent />
                        </Router>
                    </WishlistProvider>
                </AuthProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
}

export default App;
