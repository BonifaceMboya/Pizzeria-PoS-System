import React from "react";
import Axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./NavBar";

export default function TaxAdmin(){
    const [taxes, setTaxes] = useState([]);
    const [modal, setModal] = useState(false);
    const [addTax, setAddTax] = useState({tax_type:'', tax_percentage:0});

    const showModal = ()=>{
        setModal(!modal)
    }

    useEffect(()=>{
        Axios.get("http://localhost:4001/tax_records", {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }})
        .then((response)=>setTaxes(response.data))
        .catch(error=> console.log('Error', error))}, [])

        const enterPercentage =(e)=> setAddTax({...addTax, tax_percentage: parseFloat(e.target.value)})
        const enterName =(e)=> setAddTax({...addTax, tax_type: e.target.value})

        const uploadTax = ()=>{
            Axios.post(`http://localhost:4001/tax/post`, addTax, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }}).then(()=>window.alert('tax uploaded successfully'))
            .catch(error=>console.log('Error Uploading', error))
        console.log(addTax)}

    //redirect to login
    const [isAuth, setIsAuth] = useState(false);
    const navigate = useNavigate();
            useEffect(()=>{
                const chkToken = localStorage.getItem('token')
                if(chkToken){
                    setIsAuth(true)
                }
                else{
                    setIsAuth(false)
                }
            }, [])
        
        const redirectToLogin = ()=>{
            navigate('/')
        }
    return(
        <>
        {isAuth === true ? <div className="admin"> 
        <div>
            <Navbar/>
            {modal && <div className="modal">
        <div className="modal-content">
            <h4>Change Tax</h4>
            <form>
                <input placeholder="Tax Name" value={addTax.tax_type} onChange={enterName}/>
                <input placeholder="Amount in Percentage" value={addTax.tax_percentage} onChange={enterPercentage} type="number"/>
            </form>
            <button onClick={showModal}>Cancel</button>
            <button onClick={()=>{uploadTax(); setAddTax({tax_type:'', tax_percentage:0}); showModal();}}>Save</button>
        </div>
        </div>
        }
            <h3>Taxes</h3>
            <button onClick={showModal} className="add-btn">Change Tax Rate</button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Percentage</th>
                        <th>Entry Date</th>
                    </tr>
                </thead>
                <tbody>
        {taxes.map((tax)=>(
            <tr key={tax.tax_id}>
                <td>{tax.tax_id}</td>
                <td>{tax.tax_type}</td>
                <td>{tax.tax_percentage}</td>
                <td>{tax.tax_entrydate}</td>
            </tr>
        ))}
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