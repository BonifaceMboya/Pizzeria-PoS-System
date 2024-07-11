import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios  from "axios";
import Navbar from "./NavBar";

export default function DeptAdmin(){

    const [departments, setDepartments] = useState([]);
    const [modal, setModal] = useState(false);
    const [updateDept, setUpdateDept] = useState([]);
    const  [submit, setSubmit] = useState(false);

    const showModal = ()=>{
        setModal(!modal)
    }

    useEffect(()=>{
        Axios.get("http://localhost:4001/department", {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }})
        .then((response)=>setDepartments(response.data))
        .catch(error=> console.log('Error', error))}, [])

        const deleteDepartment = (id, e)=>{
            e.preventDefault();
            Axios.delete(`http://localhost:4001/department/delete/${id}`, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }})
            .then(()=>{
                setDepartments(departments.filter(dept=>dept.department_id !== id))
                alert('Department Deleted Successfully')}).catch(error=> console.log('Error', error))
        }

        const handleId = (e)=> setUpdateDept({...updateDept, department_id: e.target.value})
        const handleName = (e)=> setUpdateDept({...updateDept, department_name: e.target.value})
            const uploadDept = ()=>{Axios.post('http://localhost:4001/department/post', updateDept, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }}). then(()=>{
                setUpdateDept({department_id:'', department_name:''});
                    window.alert('New Department Added Successfully')
                        })}
            const editDept = ()=>{
                Axios.put(`http://localhost:4001/department/update/${updateDept.department_id}`, updateDept, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }}).then(
                    ()=>{
                        console.log(updateDept);
                        window.alert('Department Edited Successfully');
                        setUpdateDept([]);
                    }
                ).catch(error=>{console.log('error', error)})
            }

    //redirect to login
    const [isAuth, setIsAuth] = useState(false);
    const navigate = useNavigate();
        useEffect(()=>{
            const chkToken = localStorage.getItem('token');
            if(chkToken){
                setIsAuth(true)
            }
            else{
                setIsAuth(false)
            }
        }, [])

    const redirectToLogin =()=>{
        navigate('/')
    }
    return(
        <>
        {isAuth === true ? <div className="admin">
            <Navbar/>
            {modal && <div className="modal">
        <div className="modal-content">
            <h4>Add Department</h4>
            <form>
                <input placeholder="Department Id" value={updateDept.department_id} onChange={handleId}/>
                <input placeholder="Department Name" value={updateDept.department_name} onChange={handleName}/>
            </form>
            <button onClick={showModal}>Cancel</button>
            {submit ===false ? <button onClick={()=>{uploadDept(); showModal();}}>Save</button> :
            <button onClick={()=>{editDept(); showModal();}}>Save Changes</button>}
        </div>
        </div>}
            <div className="menu-list">
            <h3>Departments</h3>
            <button onClick={()=>{showModal(); setUpdateDept([]); setSubmit(false);}} className="add-btn">Add Department</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th><th>Name</th>
                    </tr>
                </thead>
                <tbody>
    {departments.map((department)=>(
                    <tr key={department.department_id}>
                        <td>{department.department_id}</td><td>{department.department_name}</td>
                        <td><button onClick={()=>{showModal(); setUpdateDept(department); setSubmit(true);}}>Edit</button></td><td><button onClick={e=>deleteDepartment(department.department_id, e)}>Delete</button></td>
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