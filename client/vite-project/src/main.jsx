import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter} from 'react-router-dom'
import App from './1-App.jsx'
import './index.css'
import LoginSignUp from './2-loginSignUp.jsx'
import Management from './3-profileAdmin.jsx'
import MenuAdmin from './5-menuAdmin.jsx'
import DeptAdmin from './7-deptAdmin.jsx'
import SectionAdmin from './9-sectionAdmin.jsx'
import TaxAdmin from './11-taxAdmin.jsx'
import Navbar from './NavBar.jsx'

const myRoutes = createBrowserRouter([
  {
    path: "/",
    element: <LoginSignUp/>
  },
  {
    path: "/menu",
    element: <App/>
  },
  {
    path:"/Administration",
    element: <Navbar/>
  },
  {
    path:"/profiles",
    element: <Management/>
  },
  {
    path: "/full-menu",
    element: <MenuAdmin/>
  },
  {
    path: "/Departments",
    element: <DeptAdmin/>
  },
  {
    path: "/Sections",
    element: <SectionAdmin/>
  },
  {
    path: "/all-taxes",
    element: <TaxAdmin/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    < RouterProvider router={myRoutes} />
  </React.StrictMode>,
)
