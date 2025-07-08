import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from './UserMenu';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Đặt lịch hẹn', path: '/appointments' },
    { name: 'Xét nghiệm', path: '/tests' },
    { name: 'Điều trị', path: '/treatments' },
    { name: 'Bài viết', path: '/articles' },
  ];

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">R</span>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                  Red Ribbon
                </span>
                <span className="block text-sm text-gray-500">Life Healthcare</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-center">
            <nav className="flex space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActivePath(item.path)
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex-shrink-0 flex items-center">
            {isAuthenticated ? (
              <UserMenu user={user} onLogout={logout} />
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-red-500 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 