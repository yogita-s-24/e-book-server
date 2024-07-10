import express from 'express'


const app = express();

//Routes
//Http methods : GET, POST, PATCH, PUT, DELETE
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get('/', (req, res, next)=>{
    res.json({message  : "Welcome to elib apis."})

})

export default app