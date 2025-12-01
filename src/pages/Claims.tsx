import { useEffect, useState } from 'react';
import { claimsApi } from '../services/claimsApi';
import { getDiligenceFabricSDK } from "../services/DFService";

interface LocalData {
  TenantID: number;
  UserID: number;
  Roles: string;
}

interface Claim {
  _id: string;
  Title: string;
  Amount: number;
  status: number;
  Claim_Creation_Date: string;
  TypeDescription: string;
  Description: string;
}

// Reusable View Modal — exactly like MyClaims
function ViewClaimModal({ claim, onClose }: { claim: Claim; onClose: () => void }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 
                backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#e8f3ed] to-[#f5faf7] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 my-8 
                  dark:from-gray-800 dark:to-gray-900 dark:border dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#244034] dark:text-green-400">Claim Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none 
                                      dark:text-gray-400 dark:hover:text-gray-200">×</button>
        </div>
        <div className="text-center py-20">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{claim.Title}</p>
          <p className="text-4xl font-bold text-[#244034] dark:text-green-400 mt-4">₹{claim.Amount.toLocaleString()}</p>
          <p className="text-lg text-[#3c8969] dark:text-green-400 mt-2">{claim.TypeDescription}</p>
          <p className="text-gray-600 mt-6 max-w-2xl dark:text-gray-300 mx-auto">{claim.Description || "No description provided"}</p>
          <p className="text-sm text-gray-500 mt-8 dark:text-gray-400">Submitted on {formatDate(claim.Claim_Creation_Date)}</p>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"Approver" | "Admin" | "">("");
  const [userData, setUserData] = useState<LocalData | null>(null);
  const [viewingClaim, setViewingClaim] = useState<Claim | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

// ... (imports and types stay the same)

const getStatusConfig = (status: number) => {
  switch (status) {
    case 2: // Pending
      return {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300/50 dark:bg-amber-900/70 dark:text-amber-100 dark:ring-yellow-400/50",
        dot: "bg-yellow-500 dark:bg-yellow-400",
      };

    case 1: // Approved (Level 1)
      return {
        label: "Approved (Level 1)",
        color: "bg-blue-100 text-blue-800 ring-1 ring-blue-300/50 dark:bg-sky-900/70 dark:text-sky-100 dark:ring-blue-400/50",
        dot: "bg-blue-500 dark:bg-blue-400",
      };

    case 5: // Final Approved
      return {
        label: "Approved (Final)",
        color: "bg-green-100 text-green-800 ring-1 ring-green-300/50 dark:bg-emerald-900/70 dark:text-emerald-100 dark:ring-emerald-400/60",
        dot: "bg-green-500 dark:bg-emerald-400",
      };

    case 3: // Rejected (by Approver)
      return {
        label: "Rejected",
        color: "bg-red-100 text-red-800 ring-1 ring-red-300/50 dark:bg-rose-900/80 dark:text-rose-100 dark:ring-red-400/60",
        dot: "bg-red-500 dark:bg-red-400",
      };

    case 4: // Rejected (by Admin)
      return {
        label: "Rejected (Admin)",
        color: "bg-red-100 text-red-900 ring-1 ring-red-400/50 dark:bg-red-400/25 dark:text-red-300 dark:ring-red-400/70",
        dot: "bg-red-600 dark:bg-red-400",
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
        const env = sessionStorage.getItem("appEnvironmentCODE");
        if (!raw || !env) throw new Error("Session missing");

        const data: LocalData = JSON.parse(raw);
        setUserData(data);

        const client = getDiligenceFabricSDK();
        const res = await client.getApplicationRoleService().getUserAppRole({
          tenantID: data.TenantID,
          appEnvironmentCODE: JSON.parse(env)
        });

        let role: any = "";
        const roleItem = data.Roles === "ORGADM"
          ? res?.Result?.find((r: any) => r.UserID === data.UserID)
          : res?.Result?.[0];

        if (roleItem?.AppRoles) {
          const roles = JSON.parse(roleItem.AppRoles).map((r: any) => r.AppRoleName);
          if (roles.includes("Admin")) role = "Admin";
          else if (roles.includes("Approver")) role = "Approver";
        }
        setUserRole(role);

        if (role === "Approver" || role === "Admin") {
          const response = await claimsApi.getClaimsForApproval(
            data.UserID.toString(),
            role,
            data.TenantID.toString()
          );
          setClaims(response || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleApprove = async (claim: Claim) => {
    if (!userData || !confirm(
      userRole === "Approver"
        ? "Approve and send to Admin?"
        : "Grant final approval?"
    )) return;

    try {
      await claimsApi.approveClaimByRole(claim._id, userRole, userData.UserID.toString());
      alert(userRole === "Approver" ? "Sent to Admin!" : "Approved!");
      setClaims(prev => prev.filter(c => c._id !== claim._id));
    } catch (err: any) {
      alert("Error: " + (err.response?.data?.message || "Failed"));
    }
  };

  const handleReject = async (claim: Claim) => {
    if (!userData || !confirm(`Reject this claim?`)) return;

    try {
      await claimsApi.rejectClaimByRole(claim._id, userRole, userData.UserID.toString());
      alert("Rejected");
      setClaims(prev => prev.filter(c => c._id !== claim._id));
    } catch (err: any) {
      alert("Error: " + (err.response?.data?.message || "Failed"));
    }
  };

const pendingCount = claims.filter((claim) => {
  if (userRole === "Approver") {
    // Approver should only act on fresh pending claims (status 2)
    return claim.status === 2;
  }
  
  if (userRole === "Admin") {
    // Admin should only act on claims approved by Approver (status 1), awaiting final approval
    return claim.status === 1;
  }
  
  return false;
}).length;

  if (loading) return <div className="pt-24 text-center text-gray-600 text-xl">Loading approval queue...</div>;
  if (!userRole) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-20 px-4 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-5xl font-bold text-gray-900 mb-3 dark:text-white">
              {userRole === "Approver" ? "Approval Queue" : "Final Review"}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {userRole === "Approver" ? "Review team expense claims" : "Give final approval"}
            </p>
          </div>

          {/* Action Banner */}
          {pendingCount > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 rounded-r-2xl flex items-center gap-4 
                dark:from-orange-900/30 dark:to-amber-900/20 dark:border-orange-600 dark:bg-orange-950/40">
              <i className="fa-solid fa-bell text-3xl text-orange-600 dark:text-orange-400"></i>
              <div>
                <p className="font-bold text-orange-900 dark:text-orange-300">Action Required</p>
                <p className="text-orange-800 dark:text-orange-400">{pendingCount} claim{pendingCount > 1 ? "s" : ""} need your attention</p>
              </div>
            </div>
          )}

          {/* Claims Grid — EXACT SAME AS MYCLAIMS */}
          {claims.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 border-2 border-dashed border-gray-300 rounded-xl dark:bg-gray-700 dark:border-gray-600"></div>
              <p className="text-2xl font-medium text-gray-700 dark:text-gray-200">No claims to review</p>
              <p className="text-gray-500 mt-2 dark:text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
{/* Inside the map — replace your entire card with this one */}
{claims.map((claim) => {
  const status = getStatusConfig(claim.status);
  const canAct = (userRole === "Approver" && (claim.status === 2 || claim.status === 3)) ||
                 (userRole === "Admin" && claim.status === 1);

  const isFinalApproved = claim.status === 5;
  const isAdminRejected = claim.status === 4;
  const isApproverRejected = claim.status === 3 && userRole === "Approver";

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-200 group 
                dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600">
      <div className="p-7">
        {/* Title + ellipsis */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 pr-8 dark:text-white">
            {claim.Title}
          </h3>
          <i className="fa-solid fa-ellipsis-v text-gray-400 opacity-0 group-hover:opacity-100 transition"></i>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-5 line-clamp-2 dark:text-gray-300">
          {claim.Description || "No description"}
        </p>

        {/* Amount + Status Badge */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            ₹{claim.Amount.toLocaleString()}
          </span>
          <span className={`ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${status.color}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
            {status.label}
          </span>
        </div>

        {/* Date + Type */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <i className="fa-regular fa-calendar"></i>
            {formatDate(claim.Claim_Creation_Date)}
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-tag"></i>
            {claim.TypeDescription}
          </div>
        </div>

        {/* BOTTOM ACTION BAR — perfectly aligned in ALL states */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          {/* Case 1: User can act → show View + Approve + Reject */}
          {canAct ? (
            <div className="flex gap-3">
              <button
                onClick={() => setViewingClaim(claim)}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-eye"></i> View
              </button>
              <button
                onClick={() => handleApprove(claim)}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-check"></i> Approve
              </button>
              <button
                onClick={() => handleReject(claim)}
                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          ) : isFinalApproved ? (
            /* Case 2: Fully approved */
            <div className="text-center text-green-600 font-bold py-3 flex items-center justify-center gap-2">
              <i className="fa-solid fa-check-circle"></i> Fully Approved
            </div>
          ) : isAdminRejected ? (
            /* Case 3: Admin rejected → final */
            <div className="text-center text-red-600 dark:text-rose-500 font-bold py-3 text-sm">
              Rejected by Admin
            </div>
          ) : (
            /* Case 4: No action possible (e.g. already processed by other role) */
            <div className="flex gap-3">
              <button
                onClick={() => setViewingClaim(claim)}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-eye"></i> View
              </button>
              <div className="flex-1 text-center text-gray-500 font-medium py-3">
                No action required
              </div>
            </div>
          )}

          {/* Optional subtle note when Approver sees their own rejection */}
          {isApproverRejected && (
            <p className="text-xs text-orange-600 text-center mt-3">
              You previously rejected this claim
            </p>
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

      {viewingClaim && <ViewClaimModal claim={viewingClaim} onClose={() => setViewingClaim(null)} />}
    </>
  );
}