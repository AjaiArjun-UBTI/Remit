// src/pages/MyClaims.tsx
import { useEffect, useState } from 'react';
import { claimsApi } from '../services/claimsApi';
import ClaimModal from '../components/claimmodal';
import { Claim, LocalData } from '../services/claimsApi';

export default function MyClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All Types");

  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [viewingClaim, setViewingClaim] = useState<Claim | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Updated getStatusConfig — matches ApprovalClaims exactly
  const getStatusConfig = (status: number) => {
    switch (status) {
      case 1:
        return {
          label: "Approved (Level 1)",
          color: "bg-blue-100 text-blue-800 ring-1 ring-blue-300/50 dark:bg-sky-900/70 dark:text-sky-100 dark:ring-blue-400/50",
          dot: "bg-blue-500 dark:bg-blue-400",
        };
      case 2:
        return {
          label: "Pending",
          color: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300/50 dark:bg-amber-900/70 dark:text-amber-100 dark:ring-yellow-400/50",
          dot: "bg-yellow-500 dark:bg-yellow-400",
        };
      case 3:
        return {
          label: "Rejected",
          color: "bg-red-100 text-red-800 ring-1 ring-red-300/50 dark:bg-rose-900/80 dark:text-rose-100 dark:ring-red-400/60",
          dot: "bg-red-500 dark:bg-red-400",
        };
      case 4:
        return {
          label: "Rejected (Admin)",
          color: "bg-red-100 text-red-900 ring-1 ring-red-400/50 dark:bg-red-400/25 dark:text-red-300 dark:ring-red-400/70",
          dot: "bg-red-600 dark:bg-red-400",
        };
      case 5:
        return {
          label: "Approved (Final)",
          color: "bg-green-100 text-green-800 ring-1 ring-green-300/50 dark:bg-emerald-900/70 dark:text-emerald-100 dark:ring-emerald-400/60",
          dot: "bg-green-500 dark:bg-emerald-400",
        };
      default:
        return {
          label: "Unknown",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
          dot: "bg-gray-500 dark:bg-gray-400",
        };
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const raw = sessionStorage.getItem("userData");
        if (!raw) throw new Error("Session expired");
        const data: LocalData = JSON.parse(raw);

        const response = await claimsApi.getClaimsByRole(
          data.UserID.toString(),
          "User",
          data.TenantID.toString()
        );
        setClaims(response || []);
      } catch (err: any) {
        setError(err.message || "Failed to load claims");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this claim?")) return;
    try {
      await claimsApi.deleteClaim(id);
      setClaims(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert("Failed to delete claim");
    }
  };

  const handleEditSuccess = () => {
    const init = async () => {
      try {
        const raw = sessionStorage.getItem("userData");
        if (!raw) return;
        const data: LocalData = JSON.parse(raw);
        const response = await claimsApi.getClaimsByRole(
          data.UserID.toString(),
          "User",
          data.TenantID.toString()
        );
        setClaims(response || []);
      } catch (err) {
        console.error("Failed to refresh claims:", err);
      }
    };
    init();
  };

  const filteredClaims = claims
    .filter(claim => {
      const statusLabel = getStatusConfig(claim.status).label;
      const matchesStatus = filterStatus === "All" || statusLabel.includes(filterStatus);
      const matchesType = filterType === "All Types" || claim.TypeDescription.includes(filterType);
      return matchesStatus && matchesType;
    })
    .sort((a, b) => new Date(b.Claim_Creation_Date).getTime() - new Date(a.Claim_Creation_Date).getTime());

  if (loading) return <div className="pt-24 text-center text-gray-600 text-xl">Loading your claims...</div>;
  if (error) return <div className="pt-24 text-center text-red-600 text-xl">Error: {error}</div>;

  return (
    <>
      <div className="min-h-screen pt-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">My Claims</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Track and manage all your expense claims</p>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition"
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition"
                >
                  <option>All Types</option>
                  <option>Cab</option>
                  <option>Food</option>
                  <option>Stay</option>
                  <option>Others</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="bg-gray-100 dark:bg-gray-700 px-5 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 w-full text-center">
                  Showing <strong>{filteredClaims.length}</strong> of <strong>{claims.length}</strong> claims
                </div>
              </div>
            </div>
          </div>

          {/* Claims Grid */}
          {filteredClaims.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl"></div>
              <p className="text-2xl font-medium text-gray-700 dark:text-gray-200">No claims found</p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {filteredClaims.map((claim) => {
                const status = getStatusConfig(claim.status);
                const canEdit = [2, 3, 4].includes(claim.status); // Pending or Rejected

                return (
                  <div key={claim._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 group">
                    <div className="p-7">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 pr-8">{claim.Title}</h3>
                        <i className="fa-solid fa-ellipsis-v text-gray-400 opacity-0 group-hover:opacity-100 transition"></i>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 line-clamp-2">{claim.Description || "No description"}</p>

                      <div className="flex justify-between items-center mb-6">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{claim.Amount.toLocaleString()}</span>
                        <span className={`ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${status.color}`}>
                          <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
                        <div className="flex items-center gap-2">
                          <i className="fa-regular fa-calendar"></i>
                          {formatDate(claim.Claim_Creation_Date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-tag"></i>
                          {claim.TypeDescription}
                        </div>
                      </div>

                      {/* Bottom Action Bar — Clean & Consistent */}
                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        {claim.status === 5 ? (
                          <div className="text-center text-green-600 dark:text-emerald-400 font-bold py-3 flex items-center justify-center gap-2">
                            <i className="fa-solid fa-check-circle"></i> Fully Approved
                          </div>
                        ) : claim.status === 1 ? (
                          <div className="text-center text-blue-600 dark:text-sky-400 font-medium py-3">
                            Awaiting final approval
                          </div>
                        ) : canEdit ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => setViewingClaim(claim)}
                              className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
                            >
                              <i className="fa-solid fa-eye"></i> View
                            </button>
                            <button
                              onClick={() => setEditingClaim(claim)}
                              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                              <i className="fa-solid fa-pen"></i> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(claim._id)}
                              className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={() => setViewingClaim(claim)}
                              className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
                            >
                              <i className="fa-solid fa-eye"></i> View
                            </button>
                            <div className="flex-1 text-center text-gray-500 dark:text-gray-400 font-medium py-3">
                              No action required
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingClaim && (
        <ClaimModal 
          claim={editingClaim} 
          onClose={() => setEditingClaim(null)}
          onSuccess={handleEditSuccess}
        />
      )}
      
      {viewingClaim && (
        <ClaimModal
          claim={viewingClaim}
          onClose={() => setViewingClaim(null)}
          viewOnly={true}
        />
      )}
    </>
  );
}