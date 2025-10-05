import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

import Homepage from './components/Homepage.tsx'
import Loginpage from './components/Loginpage.tsx'
import LogoutPage from './components/LogoutPage.tsx'
const router = createBrowserRouter([
  {
    path:'/',
    element:<App/>,
    children:[
      {
        index:true,
        element:<Homepage/>
      },
      {
        path:'login',
        element:<Loginpage/>
      },
      {
        path:'home',
        element:<Homepage/>
      },
      {
        path:'logout',
        element:<LogoutPage/>
      }
    ]
  }
])
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
