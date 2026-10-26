import React, { useState, useEffect } from 'react';

function App() {
  // ----------------------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------------------
  // Destinations catalog
  const [destinations, setDestinations] = useState([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);

  // Filter for regular users: 'all' or 'available'
  const [filterMode, setFilterMode] = useState('all');

  // Form input state for adding a new destination (Admin only)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    days: '',
    budget: '',
    isAvailable: true,
  });

  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('holiday_token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // User Bookings State (Small Cards in User Panel)
  const [myBookings, setMyBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingInProgressId, setBookingInProgressId] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  // Auth Form State (Login / Register)
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Global Notification States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Backend API Base URL
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000'
      : 'https://holiday-mirage-backend.onrender.com');

  const DESTINATIONS_URL = `${API_BASE_URL}/api/destinations`;
  const AUTH_URL = `${API_BASE_URL}/api/auth`;
  const BOOKINGS_URL = `${API_BASE_URL}/api/bookings`;

  // ----------------------------------------------------
  // 1. INITIALIZE & PERSIST USER SESSION (GET /api/auth/me)
  // ----------------------------------------------------
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch(`${AUTH_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        } else {
          // Token is expired or invalid
          localStorage.removeItem('holiday_token');
          setToken('');
          setCurrentUser(null);
        }
      } catch (err) {
        console.warn('Could not verify existing authentication token:', err.message);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    verifyToken();
  }, [token]);

  // ----------------------------------------------------
  // 2. FETCH ALL DESTINATIONS (GET)
  // ----------------------------------------------------
  async function getDestinations() {
    try {
      setError('');
      setIsLoadingDestinations(true);
      const response = await fetch(DESTINATIONS_URL);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load destinations from the server.');
      }

      const data = await response.json();
      setDestinations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingDestinations(false);
    }
  }

  // Load destinations when component mounts
  useEffect(() => {
    getDestinations();
  }, []);

  // ----------------------------------------------------
  // 3. FETCH USER'S BOOKINGS (GET /api/bookings/my)
  // ----------------------------------------------------
  useEffect(() => {
    async function fetchUserBookings() {
      if (!token || !currentUser || currentUser.role !== 'user') {
        setMyBookings([]);
        return;
      }

      try {
        setIsLoadingBookings(true);
        const response = await fetch(`${BOOKINGS_URL}/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMyBookings(data);
        }
      } catch (err) {
        console.warn('Could not load user bookings:', err.message);
      } finally {
        setIsLoadingBookings(false);
      }
    }

    fetchUserBookings();
  }, [token, currentUser]);

  // ----------------------------------------------------
  // 4. AUTHENTICATION HANDLERS
  // ----------------------------------------------------
  function handleAuthFormChange(e) {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value,
    });
  }

  // Handle User Login
  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsAuthSubmitting(true);

    try {
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      // Save token and update state
      localStorage.setItem('holiday_token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setSuccess(`Welcome back, ${data.user.name}! Logged in as ${data.user.role}.`);

      // Clear password field
      setAuthForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  // Handle User Registration
  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsAuthSubmitting(true);

    try {
      const response = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // Save token and update state
      localStorage.setItem('holiday_token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setSuccess(`Account registered successfully! Welcome to Holiday Mirage, ${data.user.name}. You can now book holiday destinations.`);

      // Clear form
      setAuthForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  // Handle Logout
  async function handleLogout() {
    try {
      await fetch(`${AUTH_URL}/logout`, { method: 'POST' }).catch(() => {});
    } finally {
      localStorage.removeItem('holiday_token');
      setToken('');
      setCurrentUser(null);
      setMyBookings([]);
      setSuccess('You have been logged out safely.');
    }
  }

  // ----------------------------------------------------
  // 5. BOOKING HANDLERS (LOGGED-IN USER)
  // ----------------------------------------------------
  async function bookDestination(dest) {
    // If not logged in, prompt user and scroll to the login form
    if (!currentUser) {
      setError(`Please sign in or create an account to book your trip to "${dest.name}".`);
      const authElem = document.getElementById('auth-section');
      if (authElem) {
        authElem.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    try {
      setError('');
      setSuccess('');
      setBookingInProgressId(dest._id);

      const response = await fetch(BOOKINGS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ destinationId: dest._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book destination.');
      }

      // Add new booking to local user panel state
      setMyBookings((prev) => [data.booking, ...prev]);
      setSuccess(`🎉 Trip to "${dest.name}" successfully booked! View your booking card in your User Panel above.`);

      // Smoothly scroll up to the user panel
      const userPanelElem = document.getElementById('user-panel-section');
      if (userPanelElem) {
        userPanelElem.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingInProgressId(null);
    }
  }

  // Cancel a booking
  async function cancelBooking(bookingId, destinationName) {
    if (!window.confirm(`Are you sure you want to cancel your booking for "${destinationName}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      setCancellingBookingId(bookingId);

      const response = await fetch(`${BOOKINGS_URL}/${bookingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking.');
      }

      setMyBookings((prev) => prev.filter((b) => b._id !== bookingId));
      setSuccess(`Booking for "${destinationName}" has been cancelled.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingBookingId(null);
    }
  }

  // Helper: Check if destination is already booked by user
  function isAlreadyBooked(destId) {
    return myBookings.some((b) => b.destinationId === destId);
  }

  // ----------------------------------------------------
  // 6. DESTINATION FORM CHANGE HANDLER (ADMIN)
  // ----------------------------------------------------
  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  // ----------------------------------------------------
  // 7. ADD A NEW DESTINATION (POST — ADMIN ONLY)
  // ----------------------------------------------------
  async function addDestination(e) {
    e.preventDefault();

    try {
      setError('');
      setSuccess('');

      const response = await fetch(DESTINATIONS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add destination.');
      }

      // Append new destination to local state
      setDestinations([...destinations, responseData]);
      setSuccess(`Destination "${responseData.name}" added successfully.`);

      // Reset form fields
      setFormData({
        name: '',
        location: '',
        days: '',
        budget: '',
        isAvailable: true,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  // ----------------------------------------------------
  // 8. TOGGLE AVAILABILITY (PATCH — ADMIN ONLY)
  // ----------------------------------------------------
  async function toggleAvailability(id, currentStatus) {
    try {
      setError('');
      setSuccess('');

      const newStatus = !currentStatus;

      const response = await fetch(`${DESTINATIONS_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update availability.');
      }

      // Update availability in local state
      const updatedList = destinations.map((item) => {
        if (item._id === id) {
          return { ...item, isAvailable: newStatus };
        }
        return item;
      });

      setDestinations(updatedList);
      setSuccess('Destination availability updated successfully.');
    } catch (err) {
      setError(err.message);
    }
  }

  // ----------------------------------------------------
  // 9. DELETE A DESTINATION (DELETE — ADMIN ONLY)
  // ----------------------------------------------------
  async function deleteDestination(id) {
    if (!window.confirm('Are you sure you want to delete this holiday destination?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      const response = await fetch(`${DESTINATIONS_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to delete destination.');
      }

      // Filter out deleted destination from local state
      const remainingList = destinations.filter((item) => item._id !== id);
      setDestinations(remainingList);
      setSuccess('Destination deleted successfully.');
    } catch (err) {
      setError(err.message);
    }
  }

  // Filtered destinations list based on selection
  const displayedDestinations = destinations.filter((dest) => {
    if (filterMode === 'available') {
      const isAvail = dest.isAvailable !== undefined ? dest.isAvailable : true;
      return isAvail;
    }
    return true;
  });

  const isAdmin = currentUser && currentUser.role === 'admin';
  const isUser = currentUser && currentUser.role === 'user';

  // ----------------------------------------------------
  // USER INTERFACE (JSX)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* ==================================================== */}
        {/* HEADER & TOP NAVIGATION BAR */}
        {/* ==================================================== */}
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-teal-700 tracking-tight">
                Holiday Mirage
              </h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                Plan Your Perfect Escape — Holiday Destination Directory & Booking
              </p>
            </div>

            {/* Authentication Status & Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {isCheckingAuth ? (
                <span className="text-xs text-slate-500 animate-pulse">Checking session...</span>
              ) : currentUser ? (
                <div className="flex items-center gap-3 flex-wrap justify-end">
                  {/* User Profile Pill */}
                  <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full text-xs">
                    <span className="font-semibold text-slate-700">{currentUser.name}</span>
                    <span className="text-slate-400">({currentUser.email})</span>
                  </div>

                  {/* Role Indicator Badge */}
                  {isAdmin ? (
                    <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 border border-purple-300 text-xs font-bold rounded-full shadow-sm">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold rounded-full shadow-sm">
                      User
                    </span>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold py-1.5 px-3 rounded-full border border-rose-200 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Guest Mode (Browsing Only)
                  </span>
                  <a
                    href="#auth-section"
                    className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold py-1.5 px-3 rounded-full transition-colors"
                  >
                    Sign In to Book
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ==================================================== */}
        {/* NOTIFICATIONS (ERROR & SUCCESS) */}
        {/* ==================================================== */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-xl flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <span><strong>Notice:</strong> {error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-700 font-bold ml-4 hover:underline text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <span>{success}</span>
            </div>
            <button
              onClick={() => setSuccess('')}
              className="text-emerald-800 font-bold ml-4 hover:underline text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ==================================================== */}
        {/* USER PANEL: MY BOOKINGS (LOGGED-IN USER ONLY) */}
        {/* ==================================================== */}
        {isUser && (
          <section id="user-panel-section" className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-teal-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  <h2 className="text-xl font-bold text-slate-800">
                    User Panel — My Booked Destinations
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Welcome, <strong className="text-slate-700">{currentUser.name}</strong>. Here are all your confirmed travel bookings.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 font-semibold px-3 py-1 rounded-full">
                  {myBookings.length} {myBookings.length === 1 ? 'Trip Booked' : 'Trips Booked'}
                </span>
              </div>
            </div>

            {/* Small Cards Grid for Bookings */}
            {isLoadingBookings ? (
              <div className="text-center py-6 text-xs text-slate-400 animate-pulse">
                Loading your bookings...
              </div>
            ) : myBookings.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No booked destinations yet!
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Browse the destinations catalog below and click <strong className="text-teal-700">"Book Destination"</strong> to reserve your getaway.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {myBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-teal-50/30 border border-teal-200 hover:border-teal-400 rounded-xl p-3.5 shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Destination Name & Confirmed Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-800 text-sm tracking-tight truncate" title={booking.destinationName}>
                          ✈️ {booking.destinationName}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Confirmed
                        </span>
                      </div>

                      {/* Small Compact Details */}
                      <div className="space-y-1 text-xs text-slate-600 mb-3">
                        <p className="truncate">
                          <span className="font-semibold text-slate-700">📍 Location:</span> {booking.location}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">⏳ Duration:</span> {booking.days} Days
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">💰 Budget:</span> ₹{Number(booking.budget).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          📅 Booked on {booking.bookedAt ? new Date(booking.bookedAt).toLocaleDateString() : 'Confirmed'}
                        </p>
                      </div>
                    </div>

                    {/* Small Card Action Footer */}
                    <div className="pt-2 border-t border-teal-100 flex items-center justify-between">
                      <span className="text-[11px] text-teal-700 font-medium">Ready to travel</span>
                      <button
                        onClick={() => cancelBooking(booking._id, booking.destinationName)}
                        disabled={cancellingBookingId === booking._id}
                        className="text-[11px] text-rose-600 hover:text-rose-800 hover:underline font-semibold disabled:opacity-50"
                      >
                        {cancellingBookingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ==================================================== */}
        {/* AUTHENTICATION PORTAL (FOR GUESTS / LOGGED-OUT USERS) */}
        {/* ==================================================== */}
        {!currentUser && (
          <section id="auth-section" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-10">
            {/* Tab Buttons to switch between Sign In & Register */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-3 text-center font-bold text-sm transition-colors border-b-2 ${
                  authMode === 'login'
                    ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In to Your Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-3 text-center font-bold text-sm transition-colors border-b-2 ${
                  authMode === 'register'
                    ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Create New Account
              </button>
            </div>

            {/* LOGIN FORM */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
                <p className="text-xs text-slate-500 text-center mb-2">
                  Sign in as a <strong>User</strong> to book destinations, or as an <strong>Administrator</strong> to manage destinations.
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={authForm.email}
                    onChange={handleAuthFormChange}
                    placeholder="e.g. admin@holidaymirage.com or traveler@example.com"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={authForm.password}
                    onChange={handleAuthFormChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition-colors text-sm"
                >
                  {isAuthSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-4 max-w-md mx-auto">
                <p className="text-xs text-slate-500 text-center mb-2">
                  Register a traveler account to book holiday destinations.
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={authForm.name}
                    onChange={handleAuthFormChange}
                    placeholder="e.g. John Doe"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={authForm.email}
                    onChange={handleAuthFormChange}
                    placeholder="e.g. traveler@example.com"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Password (Min. 6 characters)
                  </label>
                  <input
                    type="password"
                    name="password"
                    minLength={6}
                    value={authForm.password}
                    onChange={handleAuthFormChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition-colors text-sm"
                >
                  {isAuthSubmitting ? 'Creating Account...' : 'Register as User'}
                </button>
              </form>
            )}
          </section>
        )}

        {/* ==================================================== */}
        {/* ROLE-SPECIFIC STATUS BANNERS (ADMIN) */}
        {/* ==================================================== */}
        {isAdmin && (
          <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <h2 className="text-base font-bold text-purple-900">
                Administrator Panel Active
              </h2>
              <p className="text-xs text-purple-700 mt-0.5">
                Full administrative privileges: add destinations, toggle booking availability, and delete records.
              </p>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-purple-200 text-purple-900 text-xs font-bold rounded-lg uppercase tracking-wider">
              Admin Access
            </span>
          </div>
        )}

        {/* ==================================================== */}
        {/* FORM: ADD NEW DESTINATION (ADMIN ONLY) */}
        {/* ==================================================== */}
        {isAdmin && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-10">
            <div className="pb-3 mb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                Add a Holiday Destination
              </h2>
            </div>

            <form onSubmit={addDestination} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Destination Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Destination Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Goa Beach Resort"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              {/* Country or Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Country / Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Goa, India"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              {/* Number of Days */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Number of Days
                </label>
                <input
                  type="number"
                  name="days"
                  min="1"
                  value={formData.days}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              {/* Approximate Budget */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Approximate Budget (₹)
                </label>
                <input
                  type="number"
                  name="budget"
                  min="0"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g. 15000"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              {/* Availability Checkbox */}
              <div className="md:col-span-2 flex items-center mt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="isAvailable" className="ml-2 text-sm font-medium text-slate-700 cursor-pointer">
                  Mark as Available for Booking immediately
                </label>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 mt-2">
                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition-colors text-sm"
                >
                  Save Destination
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ==================================================== */}
        {/* DESTINATIONS LIST & BOOKING CONTROLS */}
        {/* ==================================================== */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Holiday Destinations ({displayedDestinations.length})
              </h2>
              <p className="text-xs text-slate-500">
                {isAdmin
                  ? 'Manage packages, update availability, or delete entries below.'
                  : currentUser
                  ? 'Browse getaways and click "Book Destination" to confirm your trip.'
                  : 'Browse holiday destinations freely. Sign in to book any destination!'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter toggle */}
              <div className="bg-slate-200 p-1 rounded-lg flex text-xs font-semibold">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterMode === 'all'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  All ({destinations.length})
                </button>
                <button
                  onClick={() => setFilterMode('available')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterMode === 'available'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Available Only
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={getDestinations}
                disabled={isLoadingDestinations}
                className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-1.5 px-3 rounded-lg transition-colors"
              >
                {isLoadingDestinations ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {displayedDestinations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
              <p className="text-slate-600 text-base font-semibold mt-2">No destinations to display.</p>
              <p className="text-slate-400 text-xs mt-1">
                {filterMode === 'available'
                  ? 'No packages are currently marked as available.'
                  : isAdmin
                  ? 'Use the form above to add your first destination.'
                  : 'Check back soon for upcoming travel escapes.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedDestinations.map((dest) => {
                const displayName = dest.name || dest.title || 'Unnamed Destination';
                const displayBudget = dest.budget !== undefined ? dest.budget : (dest.pricePerNight || 0);
                const displayDays = dest.days || 3;
                const isAvail = dest.isAvailable !== undefined ? dest.isAvailable : true;
                const alreadyBooked = isAlreadyBooked(dest._id);

                return (
                  <div
                    key={dest._id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Title & Status Badge */}
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                          {displayName}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${
                            isAvail
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          {isAvail ? 'Available' : 'Not Available'}
                        </span>
                      </div>

                      {/* Destination Details */}
                      <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                        <p>
                          <span className="font-semibold text-slate-700">Location:</span> {dest.location}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">Duration:</span> {displayDays} Days
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">Approx. Budget:</span> ₹{displayBudget.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* ACTION CONTROLS */}
                    {/* 1. ADMIN CONTROLS */}
                    {isAdmin ? (
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => toggleAvailability(dest._id, isAvail)}
                          className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${
                            isAvail
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200'
                              : 'bg-teal-100 text-teal-800 hover:bg-teal-200 border border-teal-200'
                          }`}
                        >
                          {isAvail ? 'Mark Unavailable' : 'Mark Available'}
                        </button>

                        <button
                          onClick={() => deleteDestination(dest._id)}
                          className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    ) : isUser ? (
                      /* 2. LOGGED-IN USER CONTROLS */
                      <div className="pt-3 border-t border-slate-100">
                        {alreadyBooked ? (
                          <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 text-center">
                            <span>✓</span>
                            <span>Booked (In Your Panel)</span>
                          </div>
                        ) : isAvail ? (
                          <button
                            onClick={() => bookDestination(dest)}
                            disabled={bookingInProgressId === dest._id}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {bookingInProgressId === dest._id ? (
                              <span>Confirming Booking...</span>
                            ) : (
                              <>
                                <span>Book Destination</span>
                                <span>→</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-slate-100 text-slate-400 font-semibold py-2 px-3 rounded-lg text-xs cursor-not-allowed text-center"
                          >
                            Currently Unavailable
                          </button>
                        )}
                      </div>
                    ) : (
                      /* 3. GUEST (UNAUTHENTICATED) CONTROLS */
                      <div className="pt-3 border-t border-slate-100">
                        {isAvail ? (
                          <button
                            onClick={() => bookDestination(dest)}
                            className="w-full bg-slate-800 hover:bg-teal-700 text-white font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5"
                          >
                            <span>Book Destination</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-slate-100 text-slate-400 font-semibold py-2 px-3 rounded-lg text-xs cursor-not-allowed text-center"
                          >
                            Currently Unavailable
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default App;
