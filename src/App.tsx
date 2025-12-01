import {  useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vitejs.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App



import './App.css'

function App() {
useEffect(() => {
  fetch("http://localhost:5731/set-tenant", {
    credentials: "include", // ← sends session cookie
  }).catch(console.error);
}, []);

  return (
    <>
      <h1 className='bg-blue'>Hello UIAP</h1>
      
        <button
  type="button"
  onClick={async () => {
    const res = await fetch("https://remitbackend-e5fahqdyejczf9ff.canadacentral-01.azurewebsites.net/");
    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  }}
  className="mt-4 px-6 py-3 bg-green-600 text-white rounded"
>
  TEST BACKEND (click me)
</button>
    </>
  )
}

export default App

