require('dotenv').config()
const pool = require('./db')

const express =require('express')
const app =express()
const bcrypt = require('bcrypt')

app.use(express.json())

app.get('/health', (req,res)=>{
    res.json({status:'ok'})
})


app.post('/register',async (req,res)=>{
    // res.json(req.body.email)
    // res.json(req.body.password)
    const {email, password} = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword])
    res.json({email: req.body.email, password: req.body.hashedPassword, message:'User registered successfully'})
    
})

app.post('/login', async(req,res)=>{
    const {email, password}=req.body
    const result=await pool.query('SELECT * FROM users Where email =$1', [email])
    const user=result.rows[0]

    if(user==null){
        return res.status(400).json({message:'Invalid credentials'})
    }else{
        const isPasswordCorrect=await bcrypt.compare(password, user.password)
        if(isPasswordCorrect){
            res.json({message:'Login successful'})
        }else{
            res.status(400).json({message:'Invalid credentials'})
        }
    }
})

app.listen (3000, ()=>{
    console.log("server is running on port 3000")
})