import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BookingModal from '../components/BookingModal';

const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/destinations/${id}`);
        if (res.data.success) {
          setDestination(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching destination details:', err);
        setError('Destination not found');
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading destination details...</div>;
  }

  if (error || !destination) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Destination Not Found</h2>
        <Link to="/destinations" className="inline-block px-4 py-2 bg-slate-800 text-white rounded text-xs font-bold">
          ← Back to All Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-xs text-slate-400 hover:text-white font-semibold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded"
      >
        ← Back
      </button>

      {/* Main Image Header */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 h-80 sm:h-96">
        <img src={destination.imageUrl} alt={destination.title} className="w-full h-full object-cover" />
        <span className="absolute top-4 left-4 bg-teal-500 text-slate-950 font-bold text-xs px-3 py-1 rounded">
          {destination.moodCategory}
        </span>
        <span className="absolute top-4 right-4 bg-slate-950/80 text-amber-400 font-bold text-xs px-3 py-1 rounded">
          ★ {destination.ratings} / 5.0
        </span>
      </div>

      {/* Content Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">{destination.title}</h1>
            <p className="text-sm text-teal-400 font-semibold mt-1">📍 {destination.location}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
            <h2 className="text-lg font-bold text-white">About Destination</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{destination.description}</p>
          </div>

          {/* Amenities List */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
            <h2 className="text-lg font-bold text-white">Included Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {destination.amenities?.map((item, idx) => (
                <span key={idx} className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded font-medium">
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Price & Action */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 text-center">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">NIGHTLY RATE</span>
              <span className="text-3xl font-extrabold text-teal-400">${destination.pricePerNight}</span>
              <span className="text-xs text-slate-400 block">/ night</span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded transition-colors"
            >
              Book Destination Package
            </button>
          </div>
        </div>

      </div>

      {/* Booking Engine Modal */}
      <BookingModal
        destination={destination}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
};

export default DestinationDetails;
