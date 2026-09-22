import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await axios.get('/api/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await axios.delete(`/api/bookings/${bookingId}`);
      if (res.data.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  // Calculate user metrics
  const activeBookings = bookings.filter((b) => b.status === 'Confirmed');
  const totalSpent = activeBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">User Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="font-bold text-teal-400">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded"
        >
          Refresh Bookings
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-xs font-bold text-slate-400 uppercase block">Active Bookings</span>
          <span className="text-2xl font-extrabold text-white mt-1 block">{activeBookings.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-xs font-bold text-slate-400 uppercase block">Total Amount Spent</span>
          <span className="text-2xl font-extrabold text-teal-400 mt-1 block">${totalSpent}</span>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Your Bookings</h2>

        {loading ? (
          <div className="text-center py-10 text-slate-400">Loading your bookings...</div>
        ) : error ? (
          <div className="bg-rose-500/20 text-rose-300 p-4 rounded text-xs">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-slate-400">
            No trip bookings found. Browse destinations to book your first escape!
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const dest = booking.destination || {};
              const isCancelled = booking.status === 'Cancelled';
              const checkIn = new Date(booking.checkInDate).toLocaleDateString();
              const checkOut = new Date(booking.checkOutDate).toLocaleDateString();

              return (
                <div
                  key={booking._id}
                  className={`bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isCancelled ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={dest.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}
                      alt={dest.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isCancelled ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {booking.status}
                        </span>
                        {dest.moodCategory && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {dest.moodCategory}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{dest.title || 'Destination'}</h3>
                      <p className="text-xs text-slate-400">📍 {dest.location}</p>
                    </div>
                  </div>

                  {/* Dates & Guests */}
                  <div className="text-xs text-slate-300">
                    <div><strong>Dates:</strong> {checkIn} – {checkOut}</div>
                    <div><strong>Guests:</strong> {booking.guests}</div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">TOTAL PRICE</span>
                      <span className="text-lg font-bold text-teal-400">${booking.totalPrice}</span>
                    </div>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
