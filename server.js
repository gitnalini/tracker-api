const express =require('express')
const app =express()

app.use(express.json())

app.get('/health', (req,res)=>{
    res.json({status:'ok'})
})

app.post('/register',(req,res)=>{
    // res.json(req.body.email)
    // res.json(req.body.password)
    res.json({email: req.body.email, password: req.body.password, message:'User registered successfully'})

})

app.listen(3000, ()=>{
    console.log("server is running on port 3000")
})