import React, {useState, useEffect} from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
export default function Navbar(){
    const [isAuth, setIsAuth] = useState(false);
    const navigate = useNavigate();
    
        useEffect(()=>{
           const chkToken = localStorage.getItem('token');
        if(chkToken){
            setIsAuth(true);
        }
        else{
            setIsAuth(false);
        }
    }, []);
    const redirectToLogin = ()=>{
        navigate('/')
    }
    return(
        <>
        {isAuth === true ? <div className="navbar-container">
            <div className="navbar">
                <header>
                <NavLink to="/Sections"> <button>Sections</button></NavLink>
                <NavLink to="/full-menu"> <button>Menu</button></NavLink>
                <NavLink to="/Departments"> <button>DepartMents</button></NavLink>
                <NavLink to="/profiles"> <button>Profiles</button></NavLink>
                <NavLink to="/all-taxes"> <button>Taxes</button></NavLink>
                </header>
                
                <main>
                    <Outlet/>
                </main>

            </div>
        </div> : <div className="not-auth">
        <h3>Oooops!</h3>
          <button onClick={redirectToLogin}>Go to Login Page</button>
            </div>}
        </>
    )
}