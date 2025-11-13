import { useState, useRef } from "react";

interface Member {
  name: string;
  designation: string;
  email: string;
  isOpen: boolean;
}

export default function MyProfile(){
    const [members, setMembers] = useState<Member[]>([
        {name: "", designation: "", email: "", isOpen: true}
    ])

    const handleAddMember = () => {
        setMembers([
            ...members,
            {name: "", designation: "", email: "", isOpen: true},
        ])
    }
    
    const handleRemove = (index: number) => {
        const updated = [...members];
        updated.splice(index, 1);
        setMembers(updated);
    };

    const handleChange = (
        index: number,
        field: keyof Member,
        value: string | boolean
    ) => {
        const updated = [...members];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        setMembers(updated);
    };

    const toggleOpen = (index: number) => {
        const updated = [...members];
        updated[index].isOpen = !updated[index].isOpen;
        setMembers(updated)
    }
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('Selected file:', file.name);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    }

    const handleDelete = () => {
        alert("Photo Deleted")
    }

    return(
        <>
        <div className="w-full profile-container p-6 bg-gray-50 min-h-screen">
            <h2 className="text-5xl font-[500] text-black py-2">
                Profile
            </h2>
            
            {/* Profile Photo Section - Standalone */}
            <div className="w-full bg-white p-8 rounded-3xl shadow-md mt-10">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center sm:items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3c8969] to-[#244034] flex items-center justify-center text-white text-2xl font-bold">
                        JS
                    </div>
                    <div className="flex items-center gap-4">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={handleUploadClick}
                            className="bg-[#d9f04f] hover:bg-[#3c8969] rounded-md hover:text-white transition-colors duration-300
                            text-[#244034] font-[600] text-base px-5 py-2">
                            Upload a new Photo
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-[#244034] hover:text-red-500 font-semibold transition-colors duration-300">
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Profile Information Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
                {/* Employer Name - Spans 2 columns */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                        Employer Name
                    </label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" placeholder="John Smith" />
                </div>

                {/* Website */}
                <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                        Website
                    </label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" placeholder="https://www.JohnSmith.com" />
                </div>

                {/* Email */}
                <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                        Email
                    </label>
                    <input type="email" className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" placeholder="JohnSmith@gmail.com" />
                </div>

                {/* Company Size */}
                <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                        Company Size
                    </label>
                    <input type="number" min="0" max="10000" className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" placeholder="300" />
                </div>

                {/* Join Date */}
                <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                        Join Date
                    </label>
                    <input type="date" className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" />
                </div>

                {/* Category - Spans 2 columns */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                        Category
                    </label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" placeholder="HR, Finance, IT, Power BI, Fabric, Power Apps" />
                </div>

                {/* Phone Number */}
                <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                        Phone Number
                    </label>
                    <input type="tel" className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" placeholder="+91 " />
                </div>

                {/* About Yourself - Spans full width */}
                <div className="md:col-span-2 lg:col-span-4 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                        About Yourself
                    </label>
                    <textarea rows={6} className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" placeholder="About Yourself Here" />
                    <p className="text-sm text-gray-500 mt-2">
                        Brief description. URLs will be clickable.
                    </p>
                </div>
            </div>

            {/* Social Media Bento Grid */}
            <div className="mt-10">
                <h4 className="text-3xl pb-4 text-[#3c8968] font-[500]">
                    Social Media
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Network 1 */}
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                            Network 1
                        </label>
                        <input type="text" className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" placeholder="https://facebook.com" />
                    </div>

                    {/* Network 2 */}
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                            Network 2
                        </label>
                        <input type="text" className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" placeholder="https://twitter.com" />
                    </div>

                    {/* Add More Links Button */}
                    <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-center">
                        <button className="w-full p-3 bg-[#f0f5f3] text-[#3c8968] rounded-md hover:bg-[#3c8968] hover:text-white transition-colors duration-300 font-[500]">
                            + Add More Links
                        </button>
                    </div>
                </div>
            </div>

            {/* Address & Location Bento Grid */}
            <div className="mt-10">
                <h4 className="text-3xl pb-4 text-[#3c8968] font-[500]">
                    Address & Location
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Address - Spans full width */}
                    <div className="md:col-span-2 lg:col-span-4 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                            Address
                        </label>
                        <input type="text" className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" placeholder="Prestige, Valasaravakkam, Chennai, Tamil Nadu" />
                    </div>

                    {/* City */}
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                            City
                        </label>
                        <select className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969] appearance-none bg-white" defaultValue="Chennai">
                            <option value="Chennai">Chennai</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Bangalore">Bangalore</option>
                            <option value="Coimbatore">Coimbatore</option>
                        </select>
                    </div>

                    {/* Country */}
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                            Country
                        </label>
                        <select className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969] appearance-none bg-white" defaultValue="India">
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                            <option value="China">China</option>
                            <option value="Japan">Japan</option>
                        </select>
                    </div>

                    {/* Zip Code */}
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                            Zip Code
                        </label>
                        <input type="text" className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" placeholder="600087" />
                    </div>

                    {/* State */}
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                            State
                        </label>
                        <select className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969] appearance-none bg-white" defaultValue="Tamil Nadu">
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Maharashtra">Maharashtra</option>
                        </select>
                    </div>

                    {/* Map Location - Spans full width */}
                    <div className="md:col-span-2 lg:col-span-4 bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <label className="block text-lg mb-2 leading-[28px] font-[500] text-[#244034]">
                            Map Location
                        </label>
                        <input type="text" className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" placeholder="XC23+6XC, Moiran, N105" />
                    </div>
                </div>
            </div>

            {/* Members Bento Grid */}
            <div className="mt-10">
                <h2 className="text-3xl font-semibold text-[#3c8968] mb-5">Members</h2>
                <label className="block text-lg mb-4 leading-[28px] font-[400]">Add & Remove Members</label>
                
                <div className="grid grid-cols-1 gap-4">
                    {members.map((member, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => {toggleOpen(index)}}>
                                <p className="font-[500] text-lg text-[#244034]">
                                    Member {index + 1}
                                </p>
                                <span className="text-gray-500 text-xl">
                                    {member.isOpen ? '▼' : '▲'}
                                </span>
                            </div>

                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${member.isOpen ? 'max-h-[1000px] mt-4' : 'max-h-0 opacity-0'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Name */}
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="block text-base mb-2 font-[500] text-[#244034]">
                                            Name
                                        </label>
                                        <input 
                                            type="text"
                                            placeholder="Enter name"
                                            className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" 
                                            value={member.name}
                                            onChange={(e) => handleChange(index, 'name', e.target.value)}
                                        />
                                    </div>

                                    {/* Designation */}
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="block text-base mb-2 font-[500] text-[#244034]">
                                            Designation
                                        </label>
                                        <input 
                                            type="text"
                                            placeholder="Enter designation"
                                            className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" 
                                            value={member.designation}
                                            onChange={(e) => handleChange(index, 'designation', e.target.value)}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <label className="block text-base mb-2 font-[500] text-[#244034]">
                                            Email
                                        </label>
                                        <input 
                                            type="email"
                                            placeholder="newmail@email.com"
                                            className="w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#3c8969]" 
                                            value={member.email}
                                            onChange={(e) => handleChange(index, 'email', e.target.value)}
                                        />
                                    </div>

                                    {/* Remove Button - Spans full width */}
                                    <div className="md:col-span-3">
                                        <button 
                                            onClick={() => handleRemove(index)}
                                            className="w-full px-4 py-2 bg-gray-100 text-[#3c8968] rounded-lg hover:bg-red-100 hover:text-red-600 transition-all font-[500]">
                                            Remove Member
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Member Button */}
                <div className="mt-4">
                    <button 
                        onClick={handleAddMember}
                        className="w-full md:w-auto text-lg flex items-center justify-center gap-2 px-6 py-3 bg-[rgba(63,99,77,.2)] text-[#31795a] rounded-xl hover:bg-[#3f634d] hover:text-white transition-all duration-300 font-[500]">
                        <span className="text-xl">+</span>
                        Add Another Member
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex justify-start items-center gap-4 mt-6">
                    <button className="rounded-full px-8 py-3 text-lg bg-[#244034] font-[500] text-white hover:bg-[#3c8969] transition-colors duration-300">
                        Save
                    </button>
                    <button className="rounded-full px-8 py-3 text-lg font-[500] text-[#31795a] hover:bg-gray-100 transition-colors duration-300">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
        </>
    )
}