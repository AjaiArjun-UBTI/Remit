import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
 import router from './router/Router';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Main from './layout/Main';
import Claims from './pages/Claims';

// const router = createBrowserRouter([
//  { path: "/",
//   element: <Main />,
//   children: [
//     {
//       path: "/",
//       element: <Claims/>
//     }
//   ]
//  },

// ])
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);