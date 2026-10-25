import React, { useState, useEffect } from 'react';

function App() {
  // ----------------------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------------------
  // List of all destinations fetched from backend
  const [destinations, setDestinations] = useState([]);

  // Form input state for adding a new destination
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    days: '',
    budget: '',
    isAvailable: true,
  });

  // Simple error message state
  const [error, setError] = useState('');

  // Backend API URL
  const API_URL = 'http://localhost:5000/api/destinations';

  // ----------------------------------------------------
  // 1. FETCH ALL DESTINATIONS (GET)
  // ----------------------------------------------------
  async function getDestinations() {
    try {
      setError('');
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Failed to load destinations from the server.');
      }

      const data = await response.json();
      setDestinations(data);
    } catch (err) {
      setError(err.message);
    }
  }

  // Load destinations when component mounts
  useEffect(() => {
    getDestinations();
  }, []);

  // ----------------------------------------------------
  // FORM INPUT CHANGE HANDLER
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
  // 2. ADD A NEW DESTINATION (POST)
  // ----------------------------------------------------
  async function addDestination(e) {
    e.preventDefault();

    try {
      setError('');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add destination.');
      }

      const newDestination = await response.json();

      // Append new destination to local state
      setDestinations([...destinations, newDestination]);

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
  // 3. TOGGLE AVAILABILITY (PATCH)
  // ----------------------------------------------------
  async function toggleAvailability(id, currentStatus) {
    try {
      setError('');

      const newStatus = !currentStatus;

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update availability.');
      }

      // Update availability in local state
      const updatedList = destinations.map((item) => {
        if (item._id === id) {
          return { ...item, isAvailable: newStatus };
        }
        return item;
      });

      setDestinations(updatedList);
    } catch (err) {
      setError(err.message);
    }
  }

  // ----------------------------------------------------
  // 4. DELETE A DESTINATION (DELETE)
  // ----------------------------------------------------
  async function deleteDestination(id) {
    try {
      setError('');

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete destination.');
      }

      // Filter out deleted destination from local state
      const remainingList = destinations.filter((item) => item._id !== id);
      setDestinations(remainingList);
    } catch (err) {
      setError(err.message);
    }
  }

  // ----------------------------------------------------
  // USER INTERFACE (JSX)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Website Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-teal-700 tracking-tight mb-2">
            Holiday Mirage
          </h1>
          <p className="text-lg text-slate-600">
            Plan Your Perfect Escape — Add, explore, and manage your dream holiday destinations.
          </p>
        </header>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex justify-between items-center">
            <span><strong>Error:</strong> {error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-700 font-bold ml-4 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Form: Add New Destination */}
        <section className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
            Add a Holiday Destination
          </h2>

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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="isAvailable" className="ml-2 text-sm font-medium text-slate-700">
                Mark as Available for Booking
              </label>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 mt-2">
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition-colors"
              >
                Save Destination
              </button>
            </div>
          </form>
        </section>

        {/* Destination List (Cards) */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Available Destinations ({destinations.length})
            </h2>
            <button
              onClick={getDestinations}
              className="text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-1.5 px-3 rounded-lg transition-colors"
            >
              Refresh List
            </button>
          </div>

          {destinations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-lg">No destinations added yet.</p>
              <p className="text-slate-400 text-sm mt-1">Use the form above to add your first travel destination.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((dest) => {
                const displayName = dest.name || dest.title || 'Unnamed Destination';
                const displayBudget = dest.budget !== undefined ? dest.budget : (dest.pricePerNight || 0);
                const displayDays = dest.days || 3;
                const isAvail = dest.isAvailable !== undefined ? dest.isAvailable : true;

                return (
                  <div
                    key={dest._id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Title & Status Badge */}
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
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
                      <div className="space-y-1.5 text-sm text-slate-600 mb-5">
                        <p>
                          <span className="font-semibold text-slate-700">Location:</span> {dest.location}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">Duration:</span> {displayDays} Days
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">Approx. Budget:</span> ₹{displayBudget}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => toggleAvailability(dest._id, isAvail)}
                        className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${
                          isAvail
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                        }`}
                      >
                        {isAvail ? 'Mark Not Available' : 'Mark Available'}
                      </button>

                      <button
                        onClick={() => deleteDestination(dest._id)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
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
