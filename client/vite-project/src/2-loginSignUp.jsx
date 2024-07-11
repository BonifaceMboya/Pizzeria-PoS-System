import React from "react";
import Axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginSignUp(){
    const [page, setPage] =  useState(true);
    const [account, setAccount] = useState({national_id:"", first_name:"", last_name:"", email_address:"", user_password:"", department_id:""});
    const [login, setLogin] = useState({national_id:"", user_password:""});

        const navigate = useNavigate();

    const handleNationalId = (e)=>{setAccount({...account, national_id: parseInt(e.target.value)})};
    const handleFirstName = (e)=>{setAccount({...account, first_name: e.target.value})};
    const handleLastName = (e)=>{setAccount({...account, last_name: e.target.value})};
    const handleEmail = (e)=>{setAccount({...account, email_address: e.target.value})};
    const handlePassword = (e)=>{setAccount({...account, user_password: e.target.value})};
    const handleDeptId = (e)=>{setAccount({...account, department_id: e.target.value})};
    const loginId = (e) =>{setLogin({...login, national_id: e.target.value})};
    const loginPassword = (e) =>{setLogin({...login, user_password: e.target.value})};

        const createAccount = ()=>{
            Axios.post('http://localhost:4001/profile/registration', account).then(()=>{window.alert('New Profile Added!'); setPage(true); setAccount({});}).catch(()=> window.alert('Error while creating profile'))
        }
            const handleLogin = ()=>{
                Axios.post('http://localhost:4001/account/login', login).then((response)=>{
                console.log(response.data);
                if(response.data.accessToken){
                    localStorage.setItem('token', response.data.accessToken);
                    alert('login successful');
                    navigate('/menu');
                }
                else{
                    alert("Wrong Credentials")
                }
            }).catch(error => console.error('failed', error))
            }

    return(
        <div className="profile-container">
        {page === true ?
            <div className="create-account">
             <h3>Login</h3>
             <label>National ID</label>
             <input placeholder="Eg: 12345678" type="number" onChange={loginId} value={login.national_id} required/>
             <label>Password</label>
             <input placeholder="Eg:John4@#Doe17" type="password" onChange={loginPassword} value={login.user_password}/>
             <div className="auth-buttons">
                <button onClick={handleLogin}>Login</button>
                <button onClick={()=> setPage(false)}>Create an Account</button>
             </div>
            </div> : 
            <div className="create-account">
            <h3>Sign Up</h3>
            <label>First Name</label>
            <input placeholder="Eg: John" onChange={handleFirstName} value={account.first_name} required/>
            <label>Last Name</label>
            <input placeholder="Eg: Doe" onChange={handleLastName} value={account.last_name} required/>
            <label>National ID</label>
            <input placeholder="Eg: 12345678" onChange={handleNationalId} value={account.national_id} type="number" required/>
            <label>Email</label>
            <input placeholder="Eg: johndoe@gmail.com" onChange={handleEmail} value={account.email_address} type="email" required/>
            <label>Department ID</label>
            <input placeholder="Eg: z001" onChange={handleDeptId} value={account.department_id} required/>
            <label>Password</label>
            <input placeholder="Eg:John4@#Doe17" onChange={handlePassword} value={account.user_password} required/>
            <div className="auth-buttons">
                <button onClick={()=>{createAccount();}}>Sign Up</button>
                <button onClick={()=> setPage(true)}>Login to Your Account</button>
            </div>
            
            </div>
            }
            
        </div>
    )
}