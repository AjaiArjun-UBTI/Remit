import { useState, useRef } from "react";

type Category = "Cab" | "Food" | "Stay" | "Others";

export default function Submission() {
  const [category, setCategory] = useState<Category>("Cab");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState<string>("");
  const [description, setDescription] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const reset = () => {
    setCategory("Cab");
    setReason("");
    setAmount("");
    setDate("");
    setDescription("");
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

    console.log("Submitting expense:", payload);
    setMessage("Submitted successfully (check console).");
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f3ed] to-[#f5faf7] p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-[#244034] mb-8">New Expense Submission</h1>

        <div className="space-y-6">
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Category Box */}
            <div className="bg-white rounded-3xl shadow-lg p-6 transform rotate-[-0.5deg] hover:rotate-0 transition-transform">
              <label className="block text-sm font-semibold text-[#244034] mb-3">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full p-3 bg-[#f0f9f4] border-2 border-[#3c8969] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] text-gray-800"
              >
                <option value="Cab">🚖 Cab</option>
                <option value="Food">🍽️ Food</option>
                <option value="Stay">🏨 Stay</option>
                <option value="Others">📝 Others</option>
              </select>
            </div>

            {/* Amount Box */}
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
                  className="w-full pl-8 p-3 bg-[#f0f9f4] border-2 border-[#3c8969] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] text-gray-800"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Date Box */}
            <div className="bg-white rounded-3xl shadow-lg p-6 transform rotate-[-0.3deg] hover:rotate-0 transition-transform">
              <label className="block text-sm font-semibold text-[#244034] mb-3">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-[#f0f9f4] border-2 border-[#3c8969] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] text-gray-800"
              />
            </div>

            {/* Conditional Reason Box */}
            {category === "Others" && (
              <div className="bg-white rounded-3xl shadow-lg p-6 transform rotate-[0.4deg] hover:rotate-0 transition-transform md:col-span-2">
                <label className="block text-sm font-semibold text-[#244034] mb-3">Reason for "Others"</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide a short reason"
                  className="w-full p-3 bg-[#f0f9f4] border-2 border-[#3c8969] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] text-gray-800"
                />
              </div>
            )}

            {/* Receipt Box */}
            <div className={`bg-white rounded-3xl shadow-lg p-6 transform rotate-[0.2deg] hover:rotate-0 transition-transform ${category === "Others" ? "" : "md:col-span-2 lg:col-span-3"}`}>
              <label className="block text-sm font-semibold text-[#244034] mb-3">Receipt</label>
              <div className="relative">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFile}
                  className="w-full p-3 bg-[#f0f9f4] border-2 border-[#3c8969] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#244034] file:text-white file:cursor-pointer hover:file:bg-[#3c8969]"
                />
              </div>
              {receipt && (
                <p className="mt-2 text-sm text-gray-600">📎 {receipt.name}</p>
              )}
            </div>

            {/* Description Box - Full Width */}
            <div className="bg-white rounded-3xl shadow-lg p-6 transform rotate-[-0.2deg] hover:rotate-0 transition-transform md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-semibold text-[#244034] mb-3">Description (optional)</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-[#f0f9f4] border-2 border-[#3c8969] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3c8969] text-gray-800 resize-none"
                placeholder="Add any additional details..."
              />
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-2xl ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={handleSubmit}
              className="px-8 py-3 rounded-full bg-[#244034] text-white font-semibold hover:bg-[#3c8969] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Submit Expense
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 rounded-full bg-white border-2 border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}