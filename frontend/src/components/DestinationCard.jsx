import React from 'react';
import { Link } from 'react-router-dom';

const DestinationCard = ({ destination, onBookClick }) => {
  const { _id, title, location, moodCategory, description, pricePerNight, imageUrl, ratings } = destination;

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-md flex flex-col justify-between hover:border-teal-500/50 transition-all">
      
      {/* Destination Image Banner */}
      <div className="relative h-48 overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 bg-teal-500 text-slate-950 font-bold text-xs px-2.5 py-1 rounded">
          {moodCategory}
        </span>
        <span className="absolute top-3 right-3 bg-slate-950/80 text-amber-400 font-bold text-xs px-2 py-1 rounded">
          ★ {ratings}
        </span>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-lg font-bold text-white line-clamp-1">{title}</h3>
          <p className="text-xs text-teal-400 mt-1">📍 {location}</p>
          <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">{description}</p>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rate</span>
            <span className="text-lg font-bold text-teal-400">${pricePerNight} <span className="text-xs font-normal text-slate-400">/ night</span></span>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/destinations/${_id}`}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded"
            >
              Details
            </Link>
            <button
              onClick={() => onBookClick(destination)}
              className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded"
            >
              Book Escape
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DestinationCard;
