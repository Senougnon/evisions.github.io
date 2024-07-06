import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PaymentWindow = ({ ticketName, price, onSuccess, onCancel }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onSuccess();
    }
  }, [countdown, onSuccess]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Paiement en cours</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <p className="mb-4">Ticket : {ticketName}</p>
        <p className="mb-4">Prix : {price} F</p>
        <div className="mb-4 h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(5 - countdown) * 20}%` }}
          ></div>
        </div>
        <p className="text-center">
          Simulation de paiement en cours... {countdown}
        </p>
      </div>
    </div>
  );
};

export default PaymentWindow;
