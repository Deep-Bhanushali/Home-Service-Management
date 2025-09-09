'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import NotificationOverlay from './NotificationOverlay';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      console.log('User signed out successfully');
      setTimeout(() => {
        router.push('/login');
      }, 100);
    } catch (error) {
      console.error('Error signing out:', error);
      router.push('/login');
    }
  };

  const isLoading = status === 'loading';

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-xl font-bold">HSM</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-blue-200 transition duration-200 font-medium">
              Home
            </Link>

            {session && (
              <>
                <Link href="/dashboard" className="hover:text-blue-200 transition duration-200 font-medium">
                  Dashboard
                </Link>
                {session.user?.role !== 'provider' && <Link href="/services" className="hover:text-blue-200 transition duration-200 font-medium">
                  Services
                </Link>}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <button
                ref={notificationButtonRef}
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsMobileMenuOpen(false);
                }}
                className="hover:text-blue-200 transition duration-200 font-medium relative"
              >
                <Bell className="inline-block w-5 h-5" />
              </button>
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs opacity-75 capitalize">{session.user?.role}</p>
                  </div>
                </div>

                {/* Logout Button - Hidden on Mobile */}
                <button
                  onClick={handleSignOut}
                  className="hidden md:flex bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition duration-200 items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-white hover:text-blue-200 font-medium transition duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  setIsNotificationOpen(false);
                }}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu */}
          <div className="fixed top-0 left-0 right-0 z-50 md:hidden">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-xl">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-blue-500">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-white">HSM</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="px-4 py-6 space-y-6 max-h-[calc(100vh-80px)] overflow-y-auto">
                {/* Navigation Links */}
                <div className="space-y-2">
                  <Link
                    href="/"
                    className="block text-white hover:text-blue-200 transition-colors font-medium py-3 px-4 rounded-lg hover:bg-blue-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🏠 Home
                  </Link>

                  {session && (
                    <>
                      <Link
                        href="/dashboard"
                        className="block text-white hover:text-blue-200 transition-colors font-medium py-3 px-4 rounded-lg hover:bg-blue-500"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        📊 Dashboard
                      </Link>
                      {session.user?.role !== 'provider' && (
                        <Link
                          href="/services"
                          className="block text-white hover:text-blue-200 transition-colors font-medium py-3 px-4 rounded-lg hover:bg-blue-500"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          🔧 Services
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsNotificationOpen(true);
                        }}
                        className="block text-white hover:text-blue-200 transition-colors font-medium py-3 px-4 rounded-lg hover:bg-blue-500 text-left w-full"
                      >
                        🔔 Notifications
                      </button>
                      
                    </>
                  )}
                </div>

                {/* User Actions */}
                <div className="border-t border-blue-500 pt-6">
                  {isLoading ? (
                    <div className="w-10 h-10 bg-blue-500 rounded-full animate-pulse mx-auto"></div>
                  ) : session ? (
                    <div className="space-y-4">
                      {/* User Info */}
                      <Link href='/profile' className="flex items-center space-x-4 bg-blue-500 bg-opacity-20 rounded-lg p-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-white">
                            {session.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{session.user?.name}</p>
                          <p className="text-blue-200 text-sm capitalize">{session.user?.role}</p>
                        </div>
                      </Link>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/login"
                        className="block text-white hover:text-blue-200 transition-colors font-medium py-3 px-6 rounded-lg hover:bg-blue-500 text-center border border-blue-400"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        🔐 Login
                      </Link>
                      <Link
                        href="/register"
                        className="block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition duration-200 text-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        📝 Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notification Overlay */}
      <NotificationOverlay
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        anchorRef={notificationButtonRef}
      />
    </nav>
  );
}
