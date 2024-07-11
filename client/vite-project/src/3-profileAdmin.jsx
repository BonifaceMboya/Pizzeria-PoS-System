import React from "react";
import Axios  from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./NavBar";

export default function Management (){
    const [profiles, setProfiles] =  useState([]);
    const [modal, setModal] = useState(false);
    const [updateProfile, setUpdateProfile] = useState([]);

    const showModal = () =>{
        setModal(!modal)
    }

      useEffect(()=>{
            Axios.get("http://localhost:4001/profile", {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }})
            .then((response)=>setProfiles(response.data))
            .catch(error=> console.log('Error', error))}, [])

    const deleteProfile = (id, e)=>{
        e.preventDefault();
        Axios.delete(`http://localhost:4001/profile/delete/${id}`, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}}).then(()=>{
            setProfiles(profiles.filter(profile=> profile.national_id !== id))
            alert('Profile Deleted Successfully')})
            .catch(error=> console.log('Error', error))
    }
    const handleId = (e)=>{setUpdateProfile({...updateProfile, national_id: parseInt(e.target.value)})}
    const handleFirstName = (e)=>{setUpdateProfile({...updateProfile, first_name: e.target.value})}
    const handleLastName = (e)=>{setUpdateProfile({...updateProfile, last_name: e.target.value})}
    const handleEmail = (e)=>{setUpdateProfile({...updateProfile, email_address: e.target.value})}
    const handleDeptId = (e)=>{setUpdateProfile({...updateProfile, department_id: e.target.value})}

        const editProfile = ()=>{
            Axios.put(`http://localhost:4001/profile/update/${updateProfile.national_id}`, updateProfile, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }}).then(()=>{
                window.alert('Profile Updated!');
                console.log(updateProfile);
            }).catch(error=>console.log('Error', error))
        }
       //redirect to login
       const navigate = useNavigate();
       const [isAuth, setIsAuth] = useState(false);
       useEffect(()=>{
        const chkToken = localStorage.getItem('token');
        if(chkToken){
            setIsAuth(true);
        }
        else{
            setIsAuth(false);
        }
       }, []) 

       const redirectToLogin = ()=>{
            navigate('/')
       }

    return(
        <>
        {isAuth === true ? <div className="admin"> 
        <Navbar/>
        {modal === true ? <div className="modal">
         <div className="modal-content">
            <h4>Edit Profile</h4>
            <form>
                <input placeholder="National ID" value={updateProfile.national_id} onChange={handleId}></input>
                <input placeholder="First Name"  value={updateProfile.first_name} onChange={handleFirstName}></input>
                <input placeholder="Last Name" value={updateProfile.last_name} onChange={handleLastName}></input>
                <input placeholder="Email Address" value={updateProfile.email_address} onChange={handleEmail}></input>
                <input placeholder="Department ID" value={updateProfile.department_id} onChange={handleDeptId}></input>
            </form>
            <button onClick={()=>{editProfile(updateProfile.national_id); setUpdateProfile({}); showModal();}}>Save Changes</button>
            <button onClick={()=> {setModal(!modal)}}>Cancel</button>
        </div>
        </div> : null}
        
        <div className="menu-list">
            <h3>Profiles</h3>
           {/* <button onClick={()=>{showModal(); setUpdateProfile([]);}}>Add Profile</button> */} 
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Department ID</th>
                        <th>PassWord</th>
                    </tr>
                </thead>
                <tbody>
    { profiles.map((profile) => (    
                    <tr key={profile.national_id}>
                        <td>{profile.national_id}</td>
                        <td>{profile.first_name}</td>
                        <td>{profile.last_name}</td>
                        <td>{profile.email_address}</td>
                        <td>{profile.department_id}</td>
                        <td>{profile.user_password}</td>
                        <td><button onClick={()=>{showModal(); setUpdateProfile(profile);}}>Edit</button></td>
                        <td><button onClick={e=>deleteProfile(profile.national_id, e)}>Delete</button></td>
                    </tr>))}
                </tbody>
            </table>
        </div>
        </div> : <div className="not-auth">
        <h3>Oooops!</h3>
          <button onClick={redirectToLogin}>Go to Login Page</button>
            </div>}
        </>
    )
    }