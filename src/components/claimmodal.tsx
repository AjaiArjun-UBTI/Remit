// src/components/ClaimModal.tsx
import { useState, useEffect } from 'react';
import { claimsApi } from '../services/claimsApi';

interface Claim {
  _id: string;
  Title: string;
  Amount: number;
  Type: number;                    // R_NO from database (1, 2, 3, 4...)
  TypeDescription: string;         // T_Desc from database (Cab, Food, Stay...)
  Claim_Date: string;
  Claim_Creation_Date: string;
  Description?: string;
}

interface ClaimType {
  R_NO: number;
  T_Desc: string;
}

interface ClaimModalProps {
  claim: Claim;
  onClose: () => void;
  viewOnly?: boolean;
  onSuccess?: () => void;
}

export default function ClaimModal({ 
  claim, 
  onClose, 
  viewOnly = false, 
  onSuccess 
}: ClaimModalProps) {
  const [title, setTitle] = useState(claim.Title);
  const [selectedTypeRNO, setSelectedTypeRNO] = useState<number>(claim.Type);
  const [amount, setAmount] = useState(claim.Amount);
  const [date, setDate] = useState(claim.Claim_Date.split('T')[0]);
  const [description, setDescription] = useState(claim.Description || '');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  // Fetch claim types from database
  const [claimTypes, setClaimTypes] = useState<ClaimType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    const fetchClaimTypes = async () => {
      try {
        const types = await claimsApi.getClaimTypes();
        console.log('Fetched claim types:', types);
        setClaimTypes(types);
        
        // Set the current claim's type
        if (claim.Type) {
          setSelectedTypeRNO(claim.Type);
        }
      } catch (err) {
        console.error('Failed to fetch claim types:', err);
        setMessage('Failed to load claim types');
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchClaimTypes();
  }, [claim.Type]);

  const handleSave = async () => {
    if (!title.trim()) return setMessage("Title is required");
    if (amount <= 0) return setMessage("Amount must be greater than 0");
    if (!selectedTypeRNO) return setMessage("Please select a claim type");

    setLoading(true);
    setMessage(null);

    // Send as JSON object with R_NO
    const claimData = {
      Title: title.trim(),
      Type: selectedTypeRNO,              // Send R_NO (number) directly
      Amount: amount,
      Claim_Date: new Date(date).toISOString(),
      Description: description.trim()
    };

    console.log('Updating claim with data:', claimData);

    try {
      await claimsApi.updateClaim(claim._id, claimData);
      setMessage("Claim updated successfully!");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Update error:', err);
      setMessage(err.response?.data?.message || "Failed to update claim");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {viewOnly ? "Claim Details" : "Edit Claim"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-3xl text-gray-400 hover:text-gray-600 transition hover:rotate-90 leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Title
            </label>
            {viewOnly ? (
              <p className="text-xl font-bold text-gray-900">{title}</p>
            ) : (
              <input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969]" 
                placeholder="Enter claim title"
              />
            )}
          </div>

          {/* Type - Dynamically loaded from database */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Type
            </label>
            {viewOnly ? (
              <p className="text-lg font-medium text-[#3c8969] bg-green-50 px-4 py-2 rounded-lg inline-block">
                {claim.TypeDescription}
              </p>
            ) : loadingTypes ? (
              <div className="text-gray-500 px-4 py-3">Loading types...</div>
            ) : (
              <select 
                value={selectedTypeRNO} 
                onChange={e => setSelectedTypeRNO(Number(e.target.value))} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969]"
              >
                <option value="">Select type...</option>
                {claimTypes.map(type => (
                  <option key={type.R_NO} value={type.R_NO}>
                    {type.T_Desc}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Amount
              </label>
              {viewOnly ? (
                <p className="text-3xl font-bold text-gray-900">₹{amount.toLocaleString()}</p>
              ) : (
                <div className="relative">
                  <span className="absolute left-4 top-3 text-xl font-bold text-gray-600">₹</span>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(Number(e.target.value) || 0)} 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969]" 
                    placeholder="0"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Date
              </label>
              {viewOnly ? (
                <p className="text-gray-700 flex items-center gap-2 text-sm">
                  📅 {formatDate(claim.Claim_Creation_Date)}
                </p>
              ) : (
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969]" 
                />
              )}
            </div>
          </div>

          {/* Description */}
          {(description || !viewOnly) && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Description
              </label>
              {viewOnly ? (
                <p className="text-gray-700">{description || "—"}</p>
              ) : (
                <textarea 
                  rows={3} 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] resize-none" 
                  placeholder="Add notes or details..."
                />
              )}
            </div>
          )}

          {/* Receipt Upload (Optional - only if backend supports it) */}
          {!viewOnly && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Receipt (Optional)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={e => setReceipt(e.target.files?.[0] || null)}
                className="w-full text-sm file:mr-4 file:py-2 file:px-5 file:rounded-full file:border-0 file:bg-[#244034] file:text-white hover:file:bg-[#3c8969] file:cursor-pointer"
              />
              {receipt && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                  ✓ Attached: {receipt.name}
                </p>
              )}
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-xl text-center font-medium ${
              message.includes("success") 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={loading} 
            className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {viewOnly ? "Close" : "Cancel"}
          </button>
          {!viewOnly && (
            <button 
              onClick={handleSave} 
              disabled={loading || loadingTypes} 
              className="px-8 py-3 bg-[#244034] text-white rounded-xl font-bold hover:bg-[#3c8969] disabled:opacity-50 transition"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}