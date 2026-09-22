import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BookingModal = ({ destination, isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Helper function to get default dates
  const getDefaultDates = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const future = new Date();
    future.setDate(future.getDate() + 5);
    return {
      checkIn: tomorrow.toISOString().split('T')[0],
      checkOut: future.toISOString().split('T')[0],
    };
  };

  const defaultDates = getDefaultDates();
  const [checkInDate, setCheckInDate] = useState(defaultDates.checkIn);
  const [checkOutDate, setCheckOutDate] = useState(defaultDates.checkOut);
  const [guests, setGuests] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset modal state every time it opens
  useEffect(() => {
    if (isOpen) {
      const dates = getDefaultDates();
      setCheckInDate(dates.checkIn);
      setCheckOutDate(dates.checkOut);
      setGuests(2);
      setError('');
      setSuccessMessage('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !destination) return null;

  // Calculate total nights and total price safely (guarded against NaN)
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const diffTime = end.getTime() - start.getTime();
  const rawNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const nights = !isNaN(rawNights) && rawNights > 0 ? rawNights : 0;
  const totalPrice = nights * (destination.pricePerNight || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      onClose();
      navigate('/login');
      return;
    }

    if (nights <= 0 || new Date(checkOutDate) <= new Date(checkInDate)) {
      setError('Check-out date must be at least 1 day after check-in date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/bookings', {
        destinationId: destination._id,
        checkInDate,
        checkOutDate,
        guests,
        totalPrice,
      });

      if (res.data.success) {
        setSuccessMessage('Booking successful! Redirecting to Dashboard...');
        setLoading(false);
        setTimeout(() => {
          onClose();
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit booking');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-white relative shadow-xl">
        
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Book Your Escape</h3>
        <p className="text-xs text-teal-400 font-semibold mb-4">📍 {destination.title}, {destination.location}</p>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500 text-rose-300 p-2.5 rounded text-xs mb-4">
            {error}
          </div>
        )}

        {successMessage ? (
          <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-4 rounded text-center text-sm font-bold my-4">
            ✅ {successMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Check-In Date</label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Check-Out Date</label>
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Guests</label>
              <input
                type="number"
                min="1"
                max="10"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Total Cost Display */}
            <div className="bg-slate-800 p-3 rounded text-xs space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>${destination.pricePerNight} × {nights} night(s)</span>
                <span>${destination.pricePerNight * nights}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-700">
                <span>Total Estimated Cost</span>
                <span className="text-teal-400 text-sm">${totalPrice}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || nights <= 0}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded transition-colors"
            >
              {loading ? 'Submitting Booking...' : (isAuthenticated ? 'Confirm & Book Trip' : 'Login to Book')}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default BookingModal;
