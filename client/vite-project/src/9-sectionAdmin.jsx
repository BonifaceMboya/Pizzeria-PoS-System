import React from "react";
import Axios from "axios";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./NavBar";
import { useNavigate } from "react-router-dom";

export default function SectionAdmin(){
    const [sections, setSections] = useState([]);
    const [modal, setModal] = useState(false);
    const [updateSection, setUpdateSection] = useState([]);
    const [submit, setSubmit] = useState(false);

    const showModal = ()=>{
        setModal(!modal)
    }

    useEffect(()=>{
        Axios.get("http://localhost:4001/section", {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }})
        .then((response)=>setSections(response.data))
        .catch(error=> console.log('Error', error))}, [])

        const deleteSection = (id, e)=>{
            e.preventDefault();
            Axios.delete(`http://localhost:4001/section/delete/${id}`, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }})
            .then(()=>{
                setSections(sections.filter(section=> section.section_id !== id))
                alert('Section Deleted Successfully')}).catch(error=> console.log('Error', error))
        }
        const handleId = (e)=>{setUpdateSection({...updateSection, section_id: e.target.value})};
        const handleName = (e)=>{setUpdateSection({...updateSection, section_name: e.target.value})};


        const uploadSection = ()=>{
            axios.post('http://localhost:4001/section/post', updateSection, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }}).then(()=>{window.alert('New Menu Section Added Successfuly'); setUpdateSection({section_id:'', section_name:''})}
                ).catch(error=>console.log('Error',error))
        }
            const editSection = ()=>{
                Axios.put(`http://localhost:4001/section/update/${updateSection.section_id}`, updateSection, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }}).then(
                    ()=>{
                        console.log(updateSection);
                        window.alert('Section Updated');
                        setUpdateSection([]);
                    }
                ).catch(error=>{console.log('error', error)})
            }
    //redirect to login
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
        }, [])

            const redirectToLogin = ()=>{
                navigate('/')
            }

    return(
        <>
        { isAuth === true ? <div className="admin">
            <Navbar/>
            {modal && <div className="modal">
        <div className="modal-content">
            <h4>Add Section</h4>
            <form>
                <input placeholder="Section Id" value={updateSection.section_id} onChange={handleId}/>
                <input placeholder="Section Name" value={updateSection.section_name} onChange={handleName}/>
            </form>
            <button onClick={showModal}>Cancel</button>
            {submit === false ? <button onClick={()=>{uploadSection(); showModal();}}>Save</button> :
            <button onClick={()=>{editSection(); showModal();}}>Save Changes</button>}
        </div>
        </div>
        }
            <div className="menu-list">
            <h3>Section</h3>
            <button onClick={()=>{showModal(); setUpdateSection([]); setSubmit(false);}} className="add-btn">Add Section</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th><th>Name</th>
                    </tr>
                </thead>
                <tbody>
    { sections.map((section)=>( 
                    <tr key={section.section_id}>
                        <td>{section.section_id}</td><td>{section.section_name}</td>
                        <td><button onClick={()=>{showModal(); setUpdateSection(section); setSubmit(true);}}>Edit</button></td>
                        <td><button onClick={e=>deleteSection(section.section_id, e)}>Delete</button></td>
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