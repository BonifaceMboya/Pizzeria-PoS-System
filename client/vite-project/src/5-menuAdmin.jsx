import React from "react";
import { useEffect, useState } from "react";
import { useFetcher, useNavigate } from "react-router-dom";
import Axios  from "axios";
import Navbar from "./NavBar";
export default function MenuAdmin(){
    const [menu, setMenu] = useState([]);
    const [modal, setModal] = useState(false);
    const [updateMenu, setUpdateMenu] = useState([]);
    const [submit, setSubmit] = useState(false);

    const showModal = ()=>{
        setModal(!modal)
    }

    useEffect(()=>{
        Axios.get("http://localhost:4001/toppings", {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }})
          .then((response)=>{setMenu(response.data)})
          .catch(error =>{console.log('error fetching data', error)})
      }, []);

      const deleteItem = (id, e)=>{
        e.preventDefault();
        Axios.delete(`http://localhost:4001/topping/delete/${id}`, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }}).then(()=>{
        setMenu(menu.filter(item=>item.topping_id !== id))    
        alert('Item Deleted Successfully')}).catch(error=> console.log('Error', error))}

        const handleName = (e)=>{setUpdateMenu({...updateMenu, topping_name: e.target.value})}
        const handleSize = (e)=>{setUpdateMenu({...updateMenu, pizza_id: parseInt(e.target.value)})}
        const handlePrice = (e)=>{setUpdateMenu({...updateMenu, topping_price: parseFloat(e.target.value)})}
        const handleAvail = (e)=>{setUpdateMenu({...updateMenu, topping_availability: e.target.value})}
        const handleSectionId = (e)=>{setUpdateMenu({...updateMenu, toppingtype_id: parseInt(e.target.value)})}
            const submitForm = ()=>{
                Axios.post('http://localhost:4001/topping/post', updateMenu, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }}).then(
                    ()=>{window.alert('New Item Added Successfully'); setUpdateMenu({
                        topping_name:'', pizza_id:0 , topping_price:0 , topping_availability:'true', toppingtype_id:0
                    })}
                )
            }
            const updateItem = ()=>{
                Axios.put(`http://localhost:4001/topping/update/${updateMenu.topping_id}`, updateMenu, {headers: {Authorization: `Bearer ${localStorage.getItem('token')}` }}).then(()=>{
                    console.log(updateMenu);
                    window.alert('Item Updated!');
                    setUpdateMenu({topping_name:'', pizza_id:0 , topping_price:0, topping_availability:'true', toppingtype_id:0 });
                }).catch(error=>{console.log('error', error)})
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

    const redirectToLogin = ()=>{
        navigate('/')
    }

    return(
        <>
        {isAuth === true ? <div className="admin">
            <Navbar/>
            {modal &&  <div className="modal">
        <div className="modal-content">
            <h4>Edit Item</h4>
            <form>
                <input placeholder="Enter Name" type="text" value={updateMenu.topping_name} onChange={handleName}/>
                <input placeholder="Enter Size" type="number" value={updateMenu.pizza_id} onChange={handleSize}/>
                <input placeholder="Enter Price" value={updateMenu.topping_price} onChange={handlePrice} type="number"/>
                <input placeholder="True/False" type="boolean" value={updateMenu.topping_availability} onChange={handleAvail}/>
                <input placeholder="Section Id" type="number" value={updateMenu.toppingtype_id} onChange={handleSectionId}/>
            </form>
            <button onClick={showModal}>Cancel</button>
            {submit === false ? <button onClick={()=>{submitForm(); showModal();}}>Save</button> :
            <button onClick={()=>{updateItem(); showModal();}}>Save Changes</button>}
        </div>
        </div>}
            <div className="menu-list">
            <h3>Menu</h3>
            <button onClick={()=>{showModal(); setUpdateMenu([{
                topping_name:'', pizza_id:0 , topping_price:0, topping_availability:'true', toppingtype_id:0
            }]); setSubmit(false);}} className="add-btn">Add Item</button>
            <table>
                <thead><tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Size</th>
                        <th>Price</th>
                        <th>Availability</th>
                        <th>Category</th>
                        </tr></thead>
                        <tbody>
        { menu.map((item)=>( 
                            <tr key={item.topping_id}>
                            <td>{item.topping_id}</td>
                            <td>{item.topping_name}</td>
                            <td>{item.pizza_id}</td>
                            <td>{item.topping_price}</td>
                            <td>{item.topping_availability}</td>
                            <td>{item.toppingtype_id}</td>
                            <td><button onClick={()=>{showModal(); setUpdateMenu(item); setSubmit(true);}}>Edit</button></td>
                            <td><button onClick={e=>deleteItem(item.topping_id, e)}>Delete</button></td>
                            </tr>))}
                            </tbody></table>
        </div>
        </div> : <div className="not-auth">
        <h3>Oooops!</h3>
          <button onClick={redirectToLogin}>Go to Login Page</button>
            </div>}
        </>
    )
}