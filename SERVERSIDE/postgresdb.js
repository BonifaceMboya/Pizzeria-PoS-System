require('dotenv').config();
const pool = require('pg').Pool;
const express = require('express');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cors = require('cors');
const app = express();
const port = process.env.SERVER_ACCESS_PORT || 5000;

app.use(cors());
app.use(express.json());

const  dbpool = new pool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DATABASE_ACCESS_KEY,
    database: process.env.DB_NAME
})

dbpool.connect();

//creating a new profile
app.post('/profile/registration', async (req, res)=>{
    try {
        const {national_id, first_name, last_name, email_address, user_password, department_id} = req.body;
        const theSalt =  await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user_password, theSalt);
        const newProfile = await dbpool.query("INSERT INTO profile (national_id, first_name, last_name, email_address, user_password, department_id) VALUES ($1,$2, $3, $4, $5, $6)", [national_id, first_name, last_name, email_address, hashedPassword, department_id]);
        res.json(newProfile);
    } catch (error) {
        console.log(error.message);
        res.status(403).send('ID or Email already exists')
    }
})

//login
app.post('/account/login', async (req, res)=>{
    try {
        const {national_id, user_password} = req.body
            const findUser = await dbpool.query("SELECT * FROM profile WHERE national_id = $1", [national_id]);
        if(findUser.rows.length === 0){
            res.status(404).send({message:'Invalid Credentials'})
        }
        const user = findUser.rows[0];
        const checkPassword = await bcrypt.compare(user_password, user.user_password);
        if(checkPassword === true){
            //res.send('Login Success');
            jwt.sign({userId: user.national_id}, process.env.JWT_SECRET_KEY, (err, token)=>{
                if(!err){
                    res.status(200).send({accessToken: token})
                }
                else{
                    res.status(401).send({message:'Authentication Error, Try again'})
                }
            })
        }
        else{
            res.status(401).send('Invalid Credentials, Check Details Before Submission')
        }
    } catch (error) {
        console.log(error.message)
        res.status(401).send('Error Logging in')
    }
})

//authorization function
const verifyToken = async(req, res, next)=>{
    try {
        let token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, receivedTokenData)=>{
            if(!err){
                next();
                req.user = receivedTokenData
            }
            else{
                res.status(403).send({message:"Invalid Token, try again"})
            }
        })
        } 
    catch (error) {
        res.status(403).send({message:"Error Completing Authorization"})
    }
}

//importing pizza data
app.get('/pizza', verifyToken, (req, res)=>{ dbpool.query(`select * from pizza`, 
(err, dbres)=>{
    if(!err){
        res.json(dbres.rows);
    }
    else{
        console.log('error executing Pizza request', err);
        res.status(500).json({error: 'internal server error'})
    };
})});

//importing basic toppings
app.get('/basic_topping', verifyToken, (req, res)=>{ 
    const pizza_id = req.query.pizza_id;
    dbpool.query(`select * from toppings where toppingtype_id = 1 and pizza_id = $1`, [pizza_id],
(err, dbres)=>{
    if(!err){
        res.json(dbres.rows);
    }
    else{
        console.log('error executing Basic Toppings Request', err);
        res.status(500).json({error: 'internal server error'})
    }
})});

//importing deluxe topping
app.get('/deluxe_topping/', verifyToken, (req, res)=>{ 
    const pizza_id = req.query.pizza_id;
    dbpool.query(`select * from toppings where toppingtype_id =2 and pizza_id = $1`, [pizza_id], 
(err, dbres)=>{
    if (!err){
        res.json(dbres.rows)
    }
    else{
        console.log('error executing deluxe toppings', err)
        res.status(500).json({error: 'internal server error'})
    }
})});

//importing tax data

app.get('/tax_rate', verifyToken, (req, res)=>{ dbpool.query(`select * from taxes order by tax_entrydate desc limit 1`,
(err, dbres)=>{
    if(!err){
        res.json(dbres.rows)
    }
    else{
        console.log('error executing taxes')
        res.status(500).json({error: 'internal server error'})
    }
})});

//importing the whole toppings menu
app.get('/toppings', verifyToken, async(req, res)=>{
    try {
        const allMenu = await dbpool.query("SELECT * FROM toppings")
        res.json(allMenu.rows)
    } catch (error) {
        console.log("Error Fetching the Menu")
    }
})

//importing department
app.get('/department', verifyToken, async(req, res)=>{
    try {
        const allDept = await dbpool.query("SELECT * FROM department")
        res.json(allDept.rows)
    } catch (error) {
        console.log(error.message)
    }
})

//importing section
app.get('/section', verifyToken, async(req, res)=>{
    try {
        const allSection = await dbpool.query("SELECT * FROM section")
        res.json(allSection.rows)
    } catch (error) {
        console.log(error.message)
    }
})

//importing profile
app.get('/profile', verifyToken, async(req, res)=>{
    try {
        const allProfile = await dbpool.query("SELECT * FROM profile")
        res.json(allProfile.rows)
    } catch (error) {
        console.log(error.message)
    }
})

//importing latest taxes
app.get('/tax_records', verifyToken, async(req, res)=>{
    try {
        const allTaxes = await dbpool.query("SELECT * FROM taxes ORDER BY tax_entrydate DESC LIMIT 10")
        res.json(allTaxes.rows)
    } catch (error) {
        console.log(error.message)
    }
})

//posting to the database

//creating a new topping item
app.post('/topping/post', verifyToken, (req, res)=>{
    try {
        const {topping_name, pizza_id, topping_price, topping_availability, toppingtype_id} = req.body;
        const newItem = dbpool.query(
            "INSERT INTO toppings (topping_name, pizza_id, topping_price, topping_availability, toppingtype_id) VALUES ($1, $2, $3, $4, $5)", [topping_name, pizza_id, topping_price, topping_availability, toppingtype_id]);
        res.json(newItem);

    } catch (error) {
        console.log(error.message);
    }
})



// creating a new department
app.post('/department/post', verifyToken, (req, res)=>{
    try {
        const {department_id, department_name}= req.body;
        const newDepartment = dbpool.query("INSERT INTO department (department_id, department_name) VALUES ($1, $2)", [department_id, department_name]);
        res.json(newDepartment);
    } catch (error) {
        console.log(error.message);
    }
})

// creating a new tax percentage
app.post('/tax/post', verifyToken, (req, res)=>{
    try {
        const {tax_type, tax_percentage} = req.body;
        const newTax = dbpool.query("INSERT INTO taxes (tax_type, tax_percentage) VALUES ($1, $2)", [tax_type, tax_percentage]);
        res.json(newTax)
    } catch (error) {
        console.log(error.message);
    }
})

// creating a new menu section
app.post('/section/post', verifyToken, (req, res)=>{
    try {
        const {section_id, section_name} = req.body;
        const newSection = dbpool.query("INSERT INTO section (section_id, section_name) VALUES ($1, $2)", [section_id, section_name]);
        res.json(newSection);
    } catch (error) {
        console.log(error.message);
    }
})

app.post('/ordereditems', verifyToken, async (req, res)=>{
    try {
        console.log('request body: ', req.body)
        const allData = req.body[0];
        const {fullOrderId, currentTaxId, currentUserId} = allData.essentials;
        const {toppingCost, allToppingIds, toppingCount} = allData.allToppingsOrdered;
        const {orderId, orderC, orderQ} = allData.ordering
        const newOrders = await dbpool.query("INSERT INTO orders (order_id, national_id, pizza_id, topping_id, pizza_cost, tax_id, toppings_cost, topping_units, pizza_units) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [fullOrderId, currentUserId, orderId, allToppingIds, orderC, currentTaxId, toppingCost, toppingCount, orderQ]);
        res.json(newOrders)
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'})
        console.error(error.message)
    }
})

// update menu item
app.put('/topping/update/:topping_id', verifyToken, async (req, res)=>{
    try {
        const id = req.params.topping_id;
        const {topping_name, pizza_id, topping_price, topping_availability, toppingtype_id} = req.body;
        await dbpool.query("UPDATE toppings SET topping_name = $1, pizza_id = $2, topping_price = $3, topping_availability = $4, toppingtype_id = $5 WHERE topping_id = $6", [topping_name, pizza_id, topping_price, topping_availability, toppingtype_id, id]);
        res.json("Menu has Been Updated")
    } catch (error) {
        console.error(error.message)
    }
})

//update departments
app.put('/department/update/:department_id', verifyToken, async (req, res)=>{
    try {
        const id = req.params.department_id;
        const {department_name} = req.body;
        await dbpool.query("UPDATE department SET department_name = $1 WHERE department_id = $2", [department_name, id]);
        res.json("Department has been Updated!")
    } catch (error) {
        console.error(error.message)
    }
})

//update section
app.put('/section/update/:section_id', verifyToken, async (req, res)=>{
    try {
        const id = req.params.section_id;
        const {section_name} = req.body;
        await dbpool.query("UPDATE section SET section_name = $1 WHERE section_id = $2", [section_name, id]);
        res.json("Section has been Updated")
    } catch (error) {
        console.error(error.message)
    }
})

//update profile
app.put('/profile/update/:national_id', verifyToken, async(req, res)=>{
    try {
        const id = req.params.national_id;
        const {first_name, last_name, email_address, department_id, user_password} = req.body;
        await dbpool.query("UPDATE profile SET first_name = $1, last_name = $2, email_address = $3, department_id = $4, user_password = $5 WHERE national_id = $6", [first_name, last_name, email_address, department_id, user_password, id]);
        res.json("Profile has Been Successfully Updated");
    } catch (error) {
        console.error(error.message)
    }
})

// create delete routes
//delete topping items
app.delete('/topping/delete/:topping_id', verifyToken, async(req, res)=>{
    try {
        const id = req.params.topping_id;
        await dbpool.query("DELETE FROM toppings WHERE topping_id = $1", [id]);
        res.json("Item Deleted Successfully")
    } catch (error) {
        console.log(error.message)
    }
})

//delete a department
app.delete('/department/delete/:department_id', verifyToken, async(req, res)=>{
    try {
        const id = req.params.department_id;
        await dbpool.query("DELETE FROM department WHERE department_id = $1", [id])
        res.json("Department deleted successfully")
    } catch (error) {
        console.log(error.message);
    }
})

//delete a menu section
app.delete('/section/delete/:section_id', verifyToken, async(req, res)=>{
    try {
        const id = req.params.section_id;
        await dbpool.query("DELETE FROM section WHERE section_id = $1", [id])
        res.json("Menu Section Deleted Successfully!")
    } catch (error) {
        console.log(error.message);
    }
})

//delete a profile
app.delete('/profile/delete/:national_id', verifyToken, async(req, res)=>{
    try {
        const id = req.params.national_id;
        await dbpool.query("DELETE FROM profile WHERE national_id = $1", [id])
        res.json("Profile Deleted Successfully")
    } catch (error) {
        console.log(error.message)
    }
})
app.listen(port, ()=>{console.log('server is running on port' +" "+ port)})

