import { useState, useRef, useEffect } from "react";
import { claimsApi } from "../services/claimsApi";
import { useNavigate } from "react-router-dom";

interface ClaimType {
  R_NO: number;
  T_Desc: string;
}

interface LocalData {
  TenantID: number;
  UserID: number;
  FirstName: string;
  LastName: string;
}

export default function Submission() {
  const navigate = useNavigate();
  const [claimTypes, setClaimTypes] = useState<ClaimType[]>([]);
  const [userData, setUserData] = useState<LocalData | null>(null);

  const [title, setTitle] = useState("");
  const [typeRNO, setTypeRNO] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | "">("");
  const [claimDate, setClaimDate] = useState("");
  const [description, setDescription] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const types = await claimsApi.getClaimTypes();
        setClaimTypes(types || []);
        if (types?.length > 0) setTypeRNO(types[0].R_NO);

        const raw = sessionStorage.getItem("userData");
        if (raw) setUserData(JSON.parse(raw));
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load data." });
      }
    };
    init();
  }, []);

  const selectedType = claimTypes.find(t => t.R_NO === typeRNO);

  // ✅ UPDATED: Added receipt validation
  const validate = () => {
    if (!title.trim()) return "Claim title is required";
    if (!typeRNO) return "Please select a claim type";
    if (!amount || Number(amount) <= 0) return "Enter a valid amount";
    if (!claimDate) return "Claim date is required";
    if (!description.trim()) return "Description is required";
    if (!receipt) return "Receipt is required"; // NEW: Mandatory receipt check
    return null;
  };

  const goToReview = () => {
    const error = validate();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }
    setMessage(null);
    setStep(2);
  };

  const goBack = () => setStep(1);

const handleSubmit = async () => {
  if (!userData || !receipt) {
    console.error('❌ Missing userData or receipt');
    return;
  }

  console.log('=== FRONTEND SUBMISSION ===');
  console.log('Receipt file:', {
    name: receipt.name,
    type: receipt.type,
    size: receipt.size,
    sizeInMB: (receipt.size / 1024 / 1024).toFixed(2) + 'MB'
  });

  setIsSubmitting(true);
  
  try {
    // Read file as base64
    const receiptBase64 = await new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        console.log('✅ File read successfully');
        console.log('Base64 first 50 chars:', base64.substring(0, 50));
        console.log('Base64 length:', base64.length);
        res(base64);
      };
      reader.onerror = (err) => {
        console.error('❌ FileReader error:', err);
        rej(err);
      };
      reader.readAsDataURL(receipt);
    });

    const claimData = {
      Title: title.trim(),
      Description: description.trim(),
      Amount: Number(amount),
      Claim_Date: claimDate,
      Type: typeRNO!,
      tenantID: userData.TenantID.toString(),
      userID: userData.UserID.toString(),
      Receipt: receiptBase64,
      ReceiptMimeType: receipt.type,
      ReceiptFileName: receipt.name,
    };

    console.log('📤 Sending claim data:', {
      ...claimData,
      Receipt: `[BASE64 DATA ${receiptBase64.length} chars]`
    });

    const response = await claimsApi.createClaim(claimData);
    console.log('✅ Server response:', response);

    setMessage({ type: "success", text: "Claim submitted successfully!" });
    setTimeout(() => navigate("/myclaims"), 2000);
    
  } catch (err: any) {
    console.error('❌ Submission error:', err);
    console.error('Error response:', err.response?.data);
    setMessage({ 
      type: "error", 
      text: err.response?.data?.message || "Submission failed" 
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  // Helper to show file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit New Claim</h1>
          <p className="text-lg text-gray-600">
            {step === 1 ? "Enter your expense details" : "Review before submitting"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Compact Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-5">
              <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${step >= 1 ? "bg-blue-50 border border-blue-300" : "bg-gray-100"}`}>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-lg ${step >= 1 ? "bg-blue-600" : "bg-gray-400"}`}>
                  <i className="fa-solid fa-pen-to-square"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Enter Details</p>
                  <p className="text-xs text-gray-600">Fill the form</p>
                </div>
              </div>

              <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${step === 2 ? "bg-green-50 border border-green-300" : "bg-gray-100"}`}>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-lg ${step === 2 ? "bg-green-600" : "bg-gray-400"}`}>
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Review & Submit</p>
                  <p className="text-xs text-gray-600">Final confirmation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="relative overflow-x-hidden">
              {/* Step 1: Form */}
              <div className={`transition-all duration-500 ease-in-out ${step === 2 ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-7 md:p-9">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-7">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Claim Title</label>
                        <input
                          type="text"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder="e.g., Client dinner"
                          className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Claim Type</label>
                        <select
                          value={typeRNO ?? ""}
                          onChange={e => setTypeRNO(e.target.value ? Number(e.target.value) : null)}
                          className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base font-medium"
                        >
                          <option value="" disabled>Select type</option>
                          {claimTypes.map(t => (
                            <option key={t.R_NO} value={t.R_NO}>{t.T_Desc}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                        <div className="relative">
                          <span className="absolute left-5 top-3.5 text-2xl font-bold text-gray-800">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-full pl-14 pr-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xl font-bold"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Claim Date</label>
                        <input
                          type="date"
                          value={claimDate}
                          onChange={e => setClaimDate(e.target.value)}
                          max={new Date().toISOString().split("T")[0]}
                          className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-7">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          rows={7}
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          placeholder="Business purpose, attendees..."
                          className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base resize-none"
                        />
                      </div>

                      {/* ✅ UPDATED: Receipt now REQUIRED */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Receipt <span className="text-red-600">*</span>
                        </label>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={e => setReceipt(e.target.files?.[0] || null)}
                          className="w-full px-5 py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer text-center"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Accepted formats: JPG, PNG, PDF (Max 10MB)
                        </p>
                        {receipt && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-lg">
                            <p className="text-green-700 font-medium text-sm flex items-center gap-2">
                              {getFileIcon(receipt)} Attached: {receipt.name}
                              <button
                                onClick={() => setReceipt(null)}
                                className="ml-auto text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {message && step === 1 && (
                    <div className={`mt-8 p-5 rounded-lg text-center font-medium border ${message.type === "success" ? "bg-green-50 text-green-800 border-green-300" : "bg-red-50 text-red-800 border-red-300"}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="flex justify-center mt-10">
                    <button
                      onClick={goToReview}
                      className="px-12 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl flex items-center gap-3 text-lg"
                    >
                      Review Claim
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Review */}
              <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${step === 2 ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-blue-200 p-8 max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Review Your Claim</h2>

                  <div className="bg-white rounded-xl shadow-inner p-8 space-y-7 text-base">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-600 font-medium">Title</p>
                        <p className="font-bold text-gray-900 mt-1">{title}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Type</p>
                        <p className="font-bold text-blue-600 mt-1">{selectedType?.T_Desc}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Amount</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">₹{Number(amount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Date</p>
                        <p className="font-semibold mt-1">{formatDate(claimDate)}</p>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-gray-200">
                      <p className="text-gray-600 font-medium mb-2">Description</p>
                      <p className="text-gray-800 leading-relaxed">{description}</p>
                    </div>

                    {receipt && (
                      <div className="pt-5 border-t border-gray-200">
                        <p className="text-green-600 font-bold flex items-center gap-2">
                          {getFileIcon(receipt)} Receipt: {receipt.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Size: {(receipt.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>

                  {message && step === 2 && (
                    <div className={`mt-8 p-5 rounded-lg text-center font-bold border ${message.type === "success" ? "bg-green-100 text-green-800 border-green-400" : "bg-red-100 text-red-800 border-red-400"}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="flex justify-center gap-5 mt-10">
                    <button
                      onClick={goBack}
                      className="px-10 py-3.5 bg-white border-2 border-gray-400 text-gray-800 font-bold rounded-lg hover:bg-gray-50 transition"
                    >
                      Back to Edit
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-12 py-3.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg hover:shadow-xl disabled:opacity-60 flex items-center gap-2"
                    >
                      {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}