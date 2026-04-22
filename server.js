require('dotenv').config()
const pool = require('./db')
const authMiddleware = require('./middleware')

const express =require('express')
const app =express()
const bcrypt = require('bcrypt')
const jwt =require('jsonwebtoken')
app.use(express.json())

app.get('/health', (req,res)=>{
    res.json({status:'ok'})
})

app.get('/protected',authMiddleware, (req,res)=>{
    res.json({message: 'You are authenticated', user: req.user})
})


app.post('/register',async (req,res)=>{
    // res.json(req.body.email)
    // res.json(req.body.passwor
    //  d)
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
            const token =jwt.sign({userId: user.id}, process.env.JWT_SECRET,)
            res.json({message:'Login successful',token})
        }else{
            res.status(400).json({message:'Invalid credentials'})
        }
    }
})

app.post('/jobs',authMiddleware, async(req,res)=>{
   const {company,role,status}=req.body
   const userId =req.user.userId
   await pool.query('INSERT INTO jobs(company, role, status, user_id) VALUES ($1, $2, $3, $4)', [company, role, status, userId])
   res.json({message: 'Job added successfully'})
})

app.get('/jobs', authMiddleware, async(req,res)=>{
    const userId =req.user.userId
    const result =await pool.query('select * from jobs where user_id= $1', [userId])
    res.json(result.rows)
})

app.put('/jobs/:id', authMiddleware, async(req,res)=>{
    const jobId=req.params.id
    const status=req.body.status
    const userId=req.user.userId
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1 AND user_id = $2', [jobId, userId])
   if(result.rows.length===0){
        return res.status(404).json({message: 'Job not found'})
      }else{
        await pool.query('update jobs set status=$1 where id=$2 and user_id=$3', [status, jobId, userId])
        res.json({message: 'Job updated successfully'})
      }
   }
)

app.delete('/jobs/:id', authMiddleware, async(req,res)=>{

const jobId=req.params.id
const userId=req.user.userId
const result = await pool.query('SELECT * FROM jobs WHERE id = $1 AND user_id = $2', [jobId, userId])
if(result.rows.length===0){
    return res.status(404).json({message: 'Job not found'})
  }else{
    await pool.query('delete from jobs where id=$1 and user_id=$2', [jobId, userId])
    res.json({message: 'Job deleted successfully'})
   }

})

app.listen (3000, ()=>{
    console.log("server is running on port 3000")
})