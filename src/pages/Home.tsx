import  {useState, useRef, useEffect}  from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock icons - replace with your actual imports
const BookmarkIcon = () => <span>🔖</span>;
const EyeIcon = () => <span>👁️</span>;
const UserIcon = () => <span>👤</span>;
const WriteIcon = () => <span>✏️</span>;

export default function Home(){
  const [activeActionIndex, setActiveIndex] = useState<number | null>(null);
  const dropdownRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !dropdownRefs.current.some(
          (ref) => ref && ref.contains(event.target as Node)
        )
      ) {
        setActiveIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const jobs = [
    'Cab',
    'Stay',
    'Food'
  ]

  // Chart data for different claim types
  const chartData = {
    Cab: [
      { month: 'Jan', amount: 400, claims: 5 },
      { month: 'Feb', amount: 300, claims: 4 },
      { month: 'Mar', amount: 600, claims: 8 },
      { month: 'Apr', amount: 800, claims: 10 },
      { month: 'May', amount: 500, claims: 6 },
      { month: 'Jun', amount: 700, claims: 9 },
    ],
    Stay: [
      { month: 'Jan', amount: 2400, claims: 2 },
      { month: 'Feb', amount: 1800, claims: 1 },
      { month: 'Mar', amount: 3200, claims: 3 },
      { month: 'Apr', amount: 2800, claims: 2 },
      { month: 'May', amount: 3500, claims: 3 },
      { month: 'Jun', amount: 4000, claims: 4 },
    ],
    Food: [
      { month: 'Jan', amount: 150, claims: 8 },
      { month: 'Feb', amount: 200, claims: 10 },
      { month: 'Mar', amount: 180, claims: 9 },
      { month: 'Apr', amount: 220, claims: 11 },
      { month: 'May', amount: 250, claims: 12 },
      { month: 'Jun', amount: 300, claims: 15 },
    ],
  };

  const postedjob = [
    {title: 'Cab', location:'Chennai'},
    {title: 'Food', location:'Coimbatore'},
    {title: 'Cab', location:'Chennai'},
    {title: 'Stay', location:'Chennai'},
    {title: 'Food', location:'Chennai'},
    {title: 'Food', location:'Banglore'}
  ]

  const [isOpen, setIsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(jobs[0]);

  const handleSelect = (job: string) => {
    setSelectedJob(job);
    setIsOpen(false);
  };

  return(
    <>
    <div className="p-6">
      <h2 className="text-4xl font-medium text-[#244034] pb-4 dark:text-white">
        Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 
      xl:grid-cols-4 md:gap-5 gap-9 py-4">
          {[
            {
            value: '1.1k', label: 'Claim Amount', icon: '👤'
          },
          {
            value: '05', label: 'Claims Filed', icon: '🔖'
          },
          {
            value: '2.1k', label: 'Total Payout', icon: '👁️'
          },
          {
            value: '10', label: 'Claims Settled', icon: '✏️'
          }].map((item, idx) => (
            <div key={idx} className="dashboard-item dark:bg-gray-700
            bg-white rounded-3xl p-6 flex items-start justify-between relative shadow-md">
              <div className="flex flex-col items-start z-[9]">
                <div className="text-5xl mb-1 font-semibold text-[#244034] dark:text-white">
                  {item.value}
                </div>
                <span className="text-lg font-light text-gray-500">
                  {item.label}
                </span>
              </div>
              <div className="bg-[#d2f34c] rounded-full w-16 h-16 
              flex items-center justify-center z-[9]">
                <span className="text-3xl">{item.icon}</span>
              </div>
          </div>
          ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 
      md:gap-6 gap-10 pt-14">
        <div className="bg-white rounded-xl shadow-md p-6 dark:bg-gray-700">
          <h2 className="font-semibold text-xl text-[#244034] dark:text-white pb-4"
          style={{borderBottom: '1px solid #e3f0eb'}}>
            Claims Views
          </h2>
          <div className="pt-6 w-full">
            <div className="w-full flex items-center dark:text-white
            flex-col gap-3">
              <div className="w-full relative flex items-center gap-3 mb-6 dark:text-white">
                <label className="flex items-center dark:text-white
                font-semibold text-[#13b568] mb-1 whitespace-nowrap">
                  Claims:
                </label>
                <div className="border-2 border-[#3f634d] dark:text-white
                px-4 py-3 rounded-md cursor-pointer flex w-full justify-between
                items-center" onClick={() => setIsOpen(!isOpen)}>
                  <span className="text-md text-[#183b56] font-light">
                    {selectedJob}
                  </span>
                  <svg className={`w-4 h-4 ml-2 transform dark:text-white
                   duration-300 ${isOpen ? 'rotate-180': ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"/>
                  </svg>
                </div>
                {isOpen && (
                  <ul className="absolute left-0 w-full mt-2 z-10 w-full mt-2 dark:text-white
                  top-[50px] font-light bg-white border
                  border-[#d1d5db] rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {jobs.map((job,index) => (
                      <li key={index}
                      className={`px-4 py-5 text-md font-light cursor-pointer
                      hover:bg-[#f4f4f4] ${selectedJob === job ? 
                        'text-green-500 bg-[rgba(36,64,52,.03)]' : 'text-[#183b56]'}`}
                        onClick={() => handleSelect(job)}>
                          {job}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
                <div className="w-full h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData[selectedJob as keyof typeof chartData]}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3c8969" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3c8969" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#244034"
                        style={{ fontSize: '14px' }}
                      />
                      <YAxis 
                        stroke="#244034"
                        style={{ fontSize: '14px' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #3c8969',
                          borderRadius: '8px',
                          padding: '10px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          paddingTop: '20px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#3c8969" 
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                        name="Amount (₹)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="claims" 
                        stroke="#d2f34c" 
                        strokeWidth={2}
                        dot={{ fill: '#d2f34c', r: 4 }}
                        name="# of Claims"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md h-full p-6 dark:bg-gray-700 dark:text-white">
            <h2 className="font-semibold text-xl text-[#244034] dark:text-white pb-4"
          style={{borderBottom: '1px solid #e3f0eb'}}>
            Claims Submitted 
          </h2>
          <ul className="w-full pt-6 space-y-7">
            {postedjob.map((job,index) => (
              <li key={index}
                className='flex justify-between items-start w-full'>
                    <div className="job-title flex items-center">
                      <div className="w-12 h-12 bg-[#d2f34c] rounded-full flex items-center justify-center">
                        <span className="text-2xl">
                          {job.title === 'Cab' ? '🚖' : job.title === 'Food' ? '🍽️' : '🏨'}
                        </span>
                      </div>
                      <div className="ps-4">
                        <h6 className="font-normal text-xl">
                          <a href="#" className="hover:text-[#31795a] hover:underline transition-colors duration-300">
                            {job.title}
                          </a>
                        </h6>
                        <span className="text-[rgba(36,64,52,.5)] font-light text-md dark:text-white">
                          Partial. {job.location}
                        </span>
                      </div>
                    </div>
                    <div className="relative" ref={el => dropdownRefs.current[index] = el}>
                      <div className="job-action cursor-pointer" onClick={() => setActiveIndex(prev => prev === index ? null : index)}>
                        <span className="text-xl text-[rgba(36,64,52,.5)] dark:text-[rgba(255,255,255,.8)]">
                          ⋯
                        </span>
                      </div>
                      <ul className={`absolute left-[-150px] top-[40px] text-start mt-2 w-[200px] bg-white rounded-xl 
                        shadow-md p-2 space-y-2 z-10 transition-all duration-300 ease-in-out dark:bg-gray-700
                        ${activeActionIndex === index ? 'opacity-100 visible translate-y-0': 'opacity-0 invisible -translate-y-2'}`}>
                          <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-[#244034] dark:text-white rounded-md">
                            View Claim
                          </li>
                          <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-[#244034] dark:text-white rounded-md">
                            Archive
                          </li>
                          <li className="py-2 px-4 hover:bg-gray-100 cursor-pointer text-[#244034] dark:text-white rounded-md">
                            Delete
                          </li>
                        </ul>
                    </div>
                </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </>
  )
}