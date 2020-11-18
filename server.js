import express, { response } from 'express'
import mongoose from 'mongoose'
import {user,messages} from './db-collections';
import cors from 'cors'
import Pusher from 'pusher'
import bcrypt from 'bcrypt';

 //app config
 const app=express();
 const port=process.env.PORT || 9000
 const connection_URL='mongodb+srv://admin:5bMq8DlFbTdjzWFv@cluster0.gfev0.mongodb.net/messenger?retryWrites=true&w=majority'
 
 //middleware
 app.use(express.json())
 app.use(cors())
 //DB config
mongoose.connect(connection_URL,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

 //pusher for db to change realtime
 const pusher = new Pusher({
    appId: "1104971",
    key: "18566967eb42d6cbc87c",
    secret: "844ba24b6a578309b4a7",
    cluster: "ap2",
    useTLS: true
  });

const db=mongoose.connection
db.once("open",()=>{
    console.log("Database connected");

    const msgCollection=db.collection("messages");
    const changeStream= msgCollection.watch();
    changeStream.on('change',(change)=>{
        
        if(change.operationType==='insert'){
            const messageDetails=change.fullDocument;
            pusher.trigger('messages','inserted',
            {
                message:messageDetails.message,
                send:messageDetails.send,
                to:messageDetails.to,
                time:messageDetails.time,
                id:messageDetails._id
            }
            )
        }else{
            console.log("error triggering pusher")
        }


    })
});

 //api config 
 app.post('/submit',async(req,res)=>{
     let data=req.body;
        data.password= await bcrypt.hash(data.password,10)
     user.create(data,(err,data)=>{
         if (err){
             console.log("err",err);
             res.status(500).send(err)
         }
         else{
             res.status(200).send(data);

         }
     })
 });
 app.post('/login',(req,res)=>{
     let userData=req.body;
     

    user.find({email:userData.email},(err,data)=>{
        if(err){ 
        console.log(err)
        res.status(500).send(err);
        }else{
            if(data!=""){
            data.map(data=>{
              bcrypt.compare(userData.password,data.password).then((status)=>{

                
                if(status){
                    console.log("login");
                    res.status(200).json({status:true ,userdata:data})

                }else{ 
                    console.log("login err")
                    res.json({status:false})
                }

            })   })
        }else{
            console.log("usernameErr")
            res.json({status:false})
        }            
        }
     })
 })
 app.get('/getusers',(req,res)=>{
     
    
     console.log("called:");
     user.find({},(err,data)=>{
         if(err){
             res.status(500).send(err)
         }else{

             res.status(200).send(data);
         }
     })
 })
 app.post("/messages",(req,res)=>{
     const data= req.body;
     
     messages.create(data,(err,data)=>{
         if(err){
             console.log("error++",err)
             res.status(500).send(err)
         }else{
            
         }
     })
 })
app.get('/messages',(req,res)=>{
    messages.find({},(err,data)=>{
        if(err){
            console.log("err on messages")
            res.status(500).send(err)
        }else{
            res.status(200).send(data);
 
        }
    })
})
 //listen

 app.listen(port,()=>console.log(`Server Running ${port}`))