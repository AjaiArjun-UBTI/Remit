import edit from '../assets/Admin Dashboard UI/edit.svg'
import eye from '../assets/Admin Dashboard UI/eye.svg'
import { getDiligenceFabricSDK } from "../services/DFService";
import deletion from '../assets/Admin Dashboard UI/delete.svg'
import { useEffect, useRef, useState } from 'react';

type Category = "Cab" | "Food" | "Stay" | "Others";

const ClaimData = [
    {
        title: "Claim for Dinner Expenses",
        date: "2023-08-15",
        amount: 89.00,
        status: "Approved",
        type: "Food & Beverages",
        location: "Hyderabad, India",
        category: "Food" as Category,
        description: "Team dinner at conference"
    },
    {
        title: "Travel Reimbursement",
        date: "2023-08-10",
        amount: 150.00,
        status: "Pending",
        type: "Travel",
        location: "Bangalore, India",
        category: "Cab" as Category,
        description: "Airport transportation"
    },
    {
        title: "Claim for Night Cab",
        date: "2023-08-05",
        amount: 145.00,
        status: "Rejected",
        type: "Transport",
        location: "Chennai, India",
        category: "Cab" as Category,
        description: "Late night client meeting"
    },
    {
        title: "Office Supplies Reimbursement",
        date: "2023-07-28",
        amount: 75.00,
        status: "Approved",
        type: "Supplies",
        location: "Chennai, India",
        category: "Others" as Category,
        description: "Office supplies for team"
    }
];

const statusColors: { [key: string]: string } = {
    "Approved": "bg-green-500 text-green-800",
    "Pending": "bg-yellow-300 text-yellow-800",
    "Rejected": "bg-red-600 text-red-800"
};

function extractTenantId(service: unknown): string | null {
    return (service as any)?.tenantId ?? null;
}

// Edit Modal Component
function EditModal({ claim, onClose, viewOnly = false }: { claim: any; onClose: () => void; viewOnly?: boolean }) {
  const [category, setCategory] = useState<Category>(claim.category);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState<number | "">(claim.amount);
  const [date, setDate] = useState<string>(claim.date);
  const [description, setDescription] = useState(claim.description);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const reset = () => {
    setCategory(claim.category);
    setReason("");
    setAmount(claim.amount);
    setDate(claim.date);
    setDescription(claim.description);
    setReceipt(null);
    setMessage(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setReceipt(f);
  };

  const validate = () => {
    if (!date) return "Please select a date.";
    if (!amount || Number(amount) <= 0) return "Enter a valid amount.";
    if (category === "Others" && reason.trim().length === 0) return "Please provide a reason for 'Others'.";
    return null;
  };



  const handleSubmit = () => {
    const err = validate();
    if (err) {
      setMessage(err);
      return;
    }

    const payload = {
      category,
      reason: category === "Others" ? reason.trim() : undefined,
      amount: Number(amount),
      date,
      description: description.trim(),
      receiptName: receipt?.name ?? null,
      submittedAt: new Date().toISOString(),
    };

    console.log("Updating expense:", payload);
    setMessage("Updated successfully!");
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#e8f3ed] to-[#f5faf7] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#244034]">{viewOnly ? 'View Expense' : 'Edit Expense'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-3xl shadow-lg p-6 transform rotate-[-0.5deg] hover:rotate-0 transition-transform">
              <label className="block text-sm font-semibold text-[#244034] mb-3">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                disabled={viewOnly}
                className="w-full p-3 bg-[#f0f9f4] border-2 border-[#3c8969] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="Cab">🚖 Cab</option>
                <option value="Food">🍽️ Food</option>
                <option value="Stay">🏨 Stay</option>
                <option value="Others">📝 Others</option>
              </select>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 transform rotate-[0.5deg] hover:rotate-0 transition-transform">
              <label className="block text-sm font-semibold text-[#244034] mb-3">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 text-lg">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount as any}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={viewOnly}
                  className="w-full pl-8 p-3 bg-[#f0f9f4] border-2 border-[#3c8969] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 transform rotate-[-0.3deg] hover:rotate-0 transition-transform">
              <label className="block text-sm font-semibold text-[#244034] mb-3">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={viewOnly}
                className="w-full p-3 bg-[#f0f9f4] border-2 border-[#3c8969] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {category === "Others" && (
              <div className="bg-white rounded-3xl shadow-lg p-6 transform rotate-[0.4deg] hover:rotate-0 transition-transform md:col-span-2">
                <label className="block text-sm font-semibold text-[#244034] mb-3">Reason for "Others"</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={viewOnly}
                  placeholder="Provide a short reason"
                  className="w-full p-3 bg-[#f0f9f4] border-2 border-[#3c8969] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            )}

            <div className={`bg-white rounded-3xl shadow-lg p-6 transform rotate-[0.2deg] hover:rotate-0 transition-transform ${category === "Others" ? "" : "md:col-span-2 lg:col-span-3"}`}>
              <label className="block text-sm font-semibold text-[#244034] mb-3">Receipt</label>
              <div className="relative">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFile}
                  disabled={viewOnly}
                  className="w-full p-3 bg-[#f0f9f4] border-2 border-[#3c8969] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#244034] file:text-white file:cursor-pointer hover:file:bg-[#3c8969] disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              {receipt && (
                <p className="mt-2 text-sm text-gray-600">📎 {receipt.name}</p>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 transform rotate-[-0.2deg] hover:rotate-0 transition-transform md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-semibold text-[#244034] mb-3">Description (optional)</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={viewOnly}
                className="w-full p-3 bg-[#f0f9f4] border-2 border-[#3c8969] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] text-gray-800 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Add any additional details..."
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          {!viewOnly && (
            <div className="flex items-center gap-4 justify-center">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-full bg-[#244034] text-white font-semibold hover:bg-[#3c8969] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Update Expense
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 rounded-full bg-white border-2 border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyClaims(){

    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const dropdownRefs = useRef<Array<HTMLDivElement | null>>([]);
    const [isSortedOpen, setIsSortedOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState("All");
    const sortRef = useRef<HTMLDivElement | null>(null);
    const [filter, setFilter] = useState("All Claims");
    const [editingClaim, setEditingClaim] = useState<any | null>(null);
    const [viewingClaim, setViewingClaim] = useState<any | null>(null);
    const [userRole, setUserRole] = useState<string>("user"); // Default to "user"
    const [tenantId, setTenantId] = useState<string | null>(null);
    
    const claimsToDisplay = filter === "New" ? ClaimData.slice(-4) : ClaimData;

    const filteredClaims = selectedSort === "All" ? claimsToDisplay : claimsToDisplay.filter(claim => claim.status === selectedSort);

    // Fetch user role from API
    useEffect(() => {
    const fetchTenant = async () => {
      const res = await fetch("http://localhost:5731/get-tenant", {
        credentials: "include",
      });
      const data = await res.json();
      setTenantId(data.tenantId || "Not set");
    };

    fetchTenant();
  }, []);
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                // Uncomment when you have the SDK available
                const client = getDiligenceFabricSDK();
                

                //setUserRole(role.toLowerCase());
                
                // For now, simulating with a mock role - change this to test different roles
                // setUserRole("admin"); // Try "admin", "manager", "user" etc.
                setUserRole("user");
            } catch (error) {
                console.error("Error fetching user role:", error);
                setUserRole("user"); // Fallback to user role
            }
        };
        fetchUserRole();
    }, []);

    const handleApprove = (claim: any) => {
        console.log("Approving claim:", claim);
        // Add your approval logic here
        setActiveDropdown(null);
    };

    const handleReject = (claim: any) => {
        console.log("Rejecting claim:", claim);
        // Add your rejection logic here
        setActiveDropdown(null);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const clickOutsideDropdown = dropdownRefs.current.every((ref) => ref && !ref.contains(event.target as Node));
            if(
                clickOutsideDropdown &&
                sortRef.current &&
                !sortRef.current.contains(event.target as Node)
            ){
                setIsSortedOpen(false);
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return(
        <>
        <div className='pt-20'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-6'>
            <h2 className='text-5xl font-[500] text-black py-2'> My Claims</h2>

            <div className='flex flex-col sm:flex-row items-start md:items-center gap-4 bg-[#f0f5f3] p-4 rounded-xl'>
                <div className='flex items-center gap-2'>
                    <button onClick={() => setFilter("All Claims")} 
                    className={`px-5 py-1.5 rounded-full font-[600] text-sm 
                    ${filter === "All Claims" ? 'bg-[#d9f04f] text-[#244034]' : 'bg-[#e0e2e1] text-[#044034] hover:bg-gray-200'}`}>
                        All
                    </button>
                    <button onClick={() => setFilter("New")} 
                    className={`px-5 py-1.5 rounded-full font-[600] text-sm 
                    ${filter === "New" ? 'bg-[#d9f04f] text-[#244034]' : 'bg-[#e0e2e1] text-[#044034] hover:bg-gray-200'}`}>
                        New
                    </button>
                </div>
                <div className="flex items-center gap-2 relative" ref={sortRef}>
                        <span className='text-[#244034] text-lg font-[500]'>
                            Sort by:
                        </span>

                        <button 
                          onClick={() => setIsSortedOpen(!isSortedOpen)}
                          className='w-[180px] px-3 py-2 border border-gray-300 rounded-full flex items-center justify-between cursor-pointer'
                          aria-expanded={isSortedOpen}
                        >
                            <span>{selectedSort}</span>
                            <i className="fa-solid fa-angle-down" aria-hidden="true"></i>
                        </button>

                        <ul className={`absolute top-full right-0 mt-2 w-[180px] bg-white rounded-lg shadow-md z-50 border border-gray-200 py-2 transition-all duration-200 origin-top ${isSortedOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
                            {["All", "Approved", "Pending", "Rejected"].map((option) => (
                                <li 
                                key={option}
                                onClick={() => {
                                    setSelectedSort(option);
                                    setIsSortedOpen(false);
                                }}
                                className={`px-4 py-2 text-md rounded-md transition hover:bg-gray-100 cursor-pointer ${selectedSort === option ? 'text-[#3c8968] font-medium' : 'text-gray-800'}`}>
                                    {option}
                                </li>
                            ))}
                        </ul>
                </div>
            </div>
        </div>
        <div className='bg-white p-6 md:p-10 rounded-xl overflow-x-auto shadow-md'>
        <table className='min-w-full table-auto'>
            <thead className='bg-[#eaf5f2] text-gray-600 text-left hidden md:table-header-group'>
                <tr>
                    <th className='py-3 px-4 text-lg font-[500] text-[#244034]'>Title</th>
                    <th className='py-3 px-4 text-lg font-[500] text-[#244034]'>Claim Created</th>
                    <th className='py-3 px-4 text-lg font-[500] text-[#244034]'>Amount</th>
                    <th className='py-3 px-4 text-lg font-[500] text-[#244034]'>Status</th>
                    <th className='py-3 px-4 text-lg font-[500] text-[#244034]'>Type</th>
                    <th className='py-3 px-4 text-lg font-[500] text-[#244034]'>Actions</th>
                </tr>
            </thead>
            <tbody className='text-gray-700 text-xs md:text-md'>
                {filteredClaims.map((claim, index) => (
                    <tr key={index} 
                    className="border-b border-gray-200 flex flex-col md:table-row md:flex-row gap-4 md:gap-0 py-4
                    md:py-0 px-4 md:px-0 hover:bg-gray-50">
                        <td className='md:py-4 md:px-4'>
                            <div className='md:font-[500] md:text-lg'>
                                <span className='block md:hidden font-semibold text-sm text-gray-500 mr-2'>Title:</span>
                                <div className='text-lg font-[500]'>
                                    {claim.title}
                                </div>
                                <div className='text-base font-[300] text-[rgba(36,64,52,.7)]'>
                                    {claim.type} - {claim.location}
                                </div>
                            </div>
                        </td>
                        <td className='md:py-4 md:px-4 text-lg font-[300] text-[#212529]'>
                            <span className='block md:hidden font-semibold text-sm text-gray-500 mr-2'>Claim Created:</span>
                            {claim.date}
                        </td>
                        <td className='md:py-4 md:px-4 text-lg font-[300] text-[#212529]'>
                            <span className='block md:hidden font-semibold text-sm text-gray-500 mr-2'>Amount</span>
                            {claim.amount} Rupees
                        </td>
                        <td className='md:py-4 md:px-4'>
                            <span className='block md:hidden font-semibold text-sm text-gray-500 mr-2'>Status</span>
                            <span className='inline-flex items-center gap-2'>
                                <span className={`h-2 w-2 rounded-full ${statusColors[claim.status]}`}></span>
                                <span className='text-lg text-[#212529] font-[300]'>
                                    {claim.status}
                                </span>
                            </span>
                        </td>
                        <td className='md:py-4 md:px-4 relative'
                        ref={el => dropdownRefs.current[index] = el}>
                            <span className='block md:hidden font-semibold text-sm text-gray-500 mr-2'>Actions</span>
                            <i className="fa-solid fa-ellipsis cursor-pointer
                             w-full text-right text-xl text-gray-400"
                             onClick={() => setActiveDropdown((prev) => (prev === index ? null : index))
                             }>
                            </i>
                            {activeDropdown === index && (
                                <ul className='absolute space-y-2 right-0 mt-2 min-w-[140px] bg-white rounded-lg z-50 p-5'
                                style={{boxShadow: '0 30px 60px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #f1f1f1'
                                }}>
                                    {userRole !== "user" ? (
                                        // Admin/Manager Actions
                                        <>
                                            <li 
                                                onClick={() => {
                                                    setViewingClaim(claim);
                                                    setActiveDropdown(null);
                                                }}
                                                className='text-base rounded-md transition hover:bg-gray-100 cursor-pointer flex items-center gap-3'>
                                                <img src={eye} alt="view-icon" className='w-4 h-4'/>
                                                View
                                            </li>
                                            <li 
                                                onClick={() => handleApprove(claim)}
                                                className='text-base rounded-md transition hover:bg-green-50 cursor-pointer flex items-center gap-3 text-green-700'>
                                                <span className='text-lg'>✓</span>
                                                Approve
                                            </li>
                                            <li 
                                                onClick={() => handleReject(claim)}
                                                className='text-base rounded-md transition hover:bg-red-50 cursor-pointer flex items-center gap-3 text-red-700'>
                                                <span className='text-lg'>✗</span>
                                                Reject
                                            </li>
                                        </>
                                    ) : (
                                        // User Actions
                                        <>
                                            <li 
                                                onClick={() => {
                                                    setViewingClaim(claim);
                                                    setActiveDropdown(null);
                                                }}
                                                className='text-base rounded-md transition hover:bg-gray-100 cursor-pointer flex items-center gap-3'>
                                                <img src={eye} alt="view-icon" className='w-4 h-4'/>
                                                View
                                            </li>
                                            <li 
                                                onClick={() => {
                                                    setEditingClaim(claim);
                                                    setActiveDropdown(null);
                                                }}
                                                className='text-base rounded-md transition hover:bg-gray-100 cursor-pointer flex items-center gap-3'>
                                                <img src={edit} alt="edit-icon" className='w-4 h-4'/>
                                                Edit
                                            </li>
                                            <li className='text-base rounded-md transition hover:bg-gray-100 cursor-pointer flex items-center gap-3'>
                                                <img src={deletion}
                                                    alt="delete-icon" className='w-4 h-4'/>
                                                Delete
                                            </li>
                                        </>
                                    )}
                                </ul>
                            )}  
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    </div>

    {editingClaim && (
        <EditModal 
            claim={editingClaim} 
            onClose={() => setEditingClaim(null)} 
        />
    )}

    {viewingClaim && (
        <EditModal 
            claim={viewingClaim} 
            onClose={() => setViewingClaim(null)}
            viewOnly={true}
        />
    )}
        </>
    )
}