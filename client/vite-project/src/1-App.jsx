import { useState, useEffect} from "react";
import Axios  from "axios";
import { NavLink, useNavigate } from "react-router-dom";

export default function App() {
  //imported menu data states
  const [pizza, setPizza] = useState([]);
  const [deluxe, setDeluxe] = useState([]);
  const [basic, setBasic] = useState([]);
  const [tax, setTax] = useState([]);

  //ordering state
  const [customerOrder, setCustomerOrder] = useState([]);
  const [pizzaOrder, setPizzaOrder] = useState([]);
  const [toppingOrder, setToppingOrder] = useState([]);
  const [toppingList, setToppingList] = useState({});
  


  //recording the input value
  const [pCount, setPCount] = useState(1);
  const [tCount, setTCount] = useState(0);
  
   //collecting order quantity input
   const porderQuantity = (event, ord)=>{
    setPCount(parseInt(event.target.value)) //it helps trigger the onChange instanteneously
    const itemPrice = ord ? ord.ordering.orderP : null;
    const itemId = ord ? ord.ordering.orderId : null;
    const itemQuantity = parseInt(event.target.value);
      const orderCost = itemPrice * itemQuantity
      const itemToUpdate = ord ? customerOrder.find(item => item.ordering.orderId === itemId) : null;

      if(itemToUpdate){
        ord.ordering.orderQ = itemQuantity;
        ord.ordering.orderC = orderCost;
      }
  }
  
  //show content
  const [isAuth, setIsAuth] = useState(false);

  //fetching the respective toppings
  const [topping, setTopping] = useState();

  //importing data from the database
  useEffect(()=>{
    Axios.get("http://localhost:4001/pizza", {headers:{Authorization: `Bearer ${localStorage.getItem('token')}`}})
      .then((response)=>{setIsAuth(true); setPizza(response.data)})
      .catch(error =>{console.log('error fetching data', error)})
  }, []);

  useEffect( ()=>{Axios.get("http://localhost:4001/deluxe_topping/", 
  {params: {pizza_id: topping},
      headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}})
          .then((response)=>{setDeluxe(response.data); setIsAuth(true);})
              .catch(error=>{console.log('error fetching deluxe', error)})}
    , [topping])
    useEffect( ()=>{Axios.get("http://localhost:4001/basic_topping", 
    {params: {pizza_id: topping}, 
        headers:{Authorization: `Bearer ${localStorage.getItem    ('token')}`}})
          .then((response)=>{ setBasic(response.data); setIsAuth(true);})
            .catch(error=>{console.log("error fetching basic toppings", error)})}
   , [topping])


  useEffect(()=>{
    Axios.get("http://localhost:4001/tax_rate", {headers:{Authorization: `Bearer ${localStorage.getItem('token')}`}})
    .then((response)=>{ setTax(response.data); setIsAuth(true);})
    .catch(error=>{console.log("error fetching basic toppings", error)})
  }, [])

  //onclick adds pizza to receipt
  function handleOrders (basics, deluxes, pizzas) {
    let existingBasicTopping = basics ? toppingOrder.find(item=> item.toppingId === basics.topping_id) : null
    let existingDeluxeTopping = deluxes ? toppingOrder.find(item=> item.toppingId === deluxes.topping_id) : null
    
    if (pizzas){
        let ordering = {
          orderQ: 1,
          orderC: pizzas.pizza_price * 1,
          orderN: pizzas.pizza_size + ' ' + 'pizza',
          orderP: pizzas.pizza_price,
          orderId: pizzas.pizza_id
        }
        setPizzaOrder({...pizzaOrder, ordering})
        setTCount(ordering.orderQ)
    }
    else if(basics && existingBasicTopping){
      setToppingOrder(toppingOrder.filter(item =>item.toppingId !== basics.topping_id))
    }
    else if(basics && !existingBasicTopping){
      let toppingOrdering = {
        toppingQ: 1,
        toppingC: basics.topping_price * 1,
        toppingN: basics.topping_name,
        toppingP: basics.topping_price,
        toppingId: basics.topping_id
      }
        setToppingOrder([...toppingOrder,toppingOrdering]);
    }
    else if(deluxes && existingDeluxeTopping){
      setToppingOrder(toppingOrder.filter(item=> item.toppingId !== deluxes.topping_id))
    }
    else if(deluxes && !existingDeluxeTopping){
      let toppingOrdering = {
        toppingQ: 1,
        toppingC: deluxes.topping_price * 1,
        toppingN: deluxes.topping_name,
        toppingP: deluxes.topping_price,
        toppingId: deluxes.topping_id
      }
      setToppingOrder([...toppingOrder,toppingOrdering])
      };
      setPCount(0);
  }
  
  const toppingCount = toppingOrder.reduce((sum, count)=>{return sum + (count.toppingQ || 0)}, 0);
  const toppingNames = toppingOrder.reduce((sum, names)=>{return sum +' '+ (names.toppingN || '')}, '');
  const toppingCost = tCount * toppingOrder.reduce((sum, cost)=>{return sum + (cost.toppingC || 0)}, 0)

  useEffect(()=>{
        const allToppingsOrdered = {toppingCount, toppingNames, toppingCost}
        setToppingList({allToppingsOrdered})
      }, [toppingOrder])

     const fullOrder = Object.assign({}, pizzaOrder, toppingList)

     const orderItems = ()=>{
      const previewOrder = toppingOrder.find(item=> item.toppingId !== undefined);
    if(previewOrder){
    setCustomerOrder([...customerOrder, fullOrder])
    console.log(customerOrder)
    setPizzaOrder({})
    setToppingOrder([])
    setBasic([])
    setDeluxe([])
    }
    else if(!previewOrder){
      window.alert('Select an Item')
    }
  }


  const filteredOrders = (orderId)=>{ 
    const editedOrder = customerOrder.filter(order=> order.ordering.orderId !== orderId)
    setCustomerOrder(editedOrder)
    
  }
  
  const totalPizzaCost = customerOrder.reduce((sum, total)=>{return sum + total.ordering.orderC}, 0);
  const totalToppingsCost = customerOrder.reduce((sum, total)=>{return sum + total.allToppingsOrdered.toppingCost}, 0)
  const totalCost = totalPizzaCost + totalToppingsCost;
  console.log('Total cost:' + totalCost)
  console.log('Total Pizza cost:' + totalPizzaCost)
  console.log('Total Toppings cost:' + totalToppingsCost)
      
      const taxRate = tax.map(latestTax => latestTax.tax_percentage); //mapping to get the percentage from the array
      const  gst = Math.round((totalCost * (taxRate/100))*10)/10;
      const netTotal = (totalCost + gst);

  let year = new Date().getFullYear();

      
  const navigate = useNavigate();
    const logOut = ()=>{
      localStorage.removeItem('token');
      navigate('/')
    }

    const notAuth = ()=>{
      navigate('/')
    }

  return (
    <>
     {isAuth === true ? <div className="container">
      <div className="header">
        <div className="menu-header">
          <h1>Pizza Palace</h1>
          <p>We Put the Pie in Pizza!</p>
        </div>
        <div className="header-buttons">
          <NavLink to="/Administration"><button>Administration</button></NavLink>
          <button onClick={logOut}>Logout</button>
        </div>
      </div>

      <div className="body">

      <div className="menu">
            {pizza.map((pizzas)=>(
            <button key={pizzas.pizza_id} onClick={()=>{
              handleOrders(null, null,  pizzas); setTopping(pizzas.pizza_id);}} className="menu-btn">
              {pizzas.pizza_size}: <br/> ${pizzas.pizza_price}  
            </button>))}
<br/>
      <div className="toppings-div">
        <select multiple className="topping-list">
              {basic.map((basics)=>(<option key={basics.topping_id} onClick={()=> 
                handleOrders(basics, null, null)} className="toppings-btn">
                {basics.topping_name}:${basics.topping_price}
              </option>))}
        </select>
        
        <select multiple className="topping-list">
              {deluxe.map((deluxes)=>(<option key={deluxes.topping_id} onClick={()=> 
                handleOrders(null, deluxes, null)} className="toppings-btn">
                {deluxes.topping_name}:${deluxes.topping_price}
              </option>))}
        </select>
        </div>
<br/>
      <div className="order-btn">
        <button onClick={()=>{ orderItems();}} >Order</button>
        </div>
      </div>

      <div className="order-receipt">
        <h2>Current Order</h2>
        {
          customerOrder.map((ord)=>(
            <ul key={ord.ordering.orderId}>
              <li>
                <input min= "1"  onChange={(event)=>porderQuantity(event,ord)} type="number" /> &nbsp;
                {ord.ordering.orderQ}
                {ord.ordering.orderN} &nbsp;
                {ord.allToppingsOrdered.toppingCount}Topping(s):
                {ord.allToppingsOrdered.toppingNames} &nbsp;
                $:{ord.ordering.orderC + ord.allToppingsOrdered.toppingCost}
              <button onClick={()=>filteredOrders(ord.ordering.orderId)}>Delete</button>
              </li>
            </ul>
          ))
        }
<br/>
          {totalCost > 0 ? <h4>Sub Total: &nbsp; ${totalCost}</h4> : null}
          {totalCost > 0 ? <h4>{taxRate}%&nbsp;GST: &nbsp; ${gst}</h4> : null}
          {totalCost > 0 ? <h4>Net Total: &nbsp; ${netTotal}</h4> : null}
          <h5>Pizza Palace &copy;{year}</h5>
          <div className="complete-order">
            <button className="complete-order-btn">Place Order</button>
          </div>
      </div>
      </div>
      <div className="orders-container">
        <div className="recent-orders">
        <h3>Recent Orders</h3>
        </div>
      </div>
     </div> : <div className="not-auth">
        <h3>Oooops!</h3>
          <button onClick={notAuth}>Go to Login Page</button>
            </div>}
    </>
  )
}
