var express = require('express');
const bodyParser = require("body-parser");
const session = require('express-session');
var MongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var flash = require("connect-flash");
var async = require("async");
var crypto = require("crypto");
var url = "mongodb://localhost:27017/";
var dbo;
MongoClient.connect(url, function (err, mongo) {
  if (err) throw err;
  dbo = mongo.db("pg");
});
var cors = require('cors');
var app = express();
app.use(flash());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(session({ secret: 'nottosay', saveUninitialized: true, resave: true }));
app.use(bodyParser.json());
app.get('/', (function (req, res) {
  res.send('welcome');
}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
var sess;
const myModule = require('./passwordvalidation.js');
var sess;
app.post('/login/:url', (function (req, res) {
  var Pas=req.params.url;
console.log("password "+Pas);
  console.log("iN LOF+GIN API");
  console.log("******************CALLING FUNCT *********************");
  sess = req.session;
  sess.username = req.body.username;
  sess.password = req.body.password;
  console.log("SESS IN INFO");
  console.log(sess);
  dbo.collection("user").find({ Username: req.body.username },{ projection: { _id: 0,Salt:1,PasswordHash:1} }).toArray(function (err, result) {
    console.log(result);
    var salt;
    var passHash;
    result.forEach(function (User) {
      console.log(User);
      salt=User.Salt;
      passHash=User.PasswordHash;
})
console.log("HEKKK"+salt);
console.log("HEKKK"+passHash);  
console.log("********** RETRIVEING************");
if (result.length == 0) {
  res.send('no username found');
}
else{
console.log("HIIIIIII");
  let ret=myModule.retrieve(Pas,salt)  
  console.log("ur userbame ois "+ret.salt); 
  console.log("ur userbame ois "+ret.passwordHash);    
  if (ret.passwordHash!=passHash )
  {
      console.log("not success");
      res.send('incorrect username or password');
  }
  else{
      console.log("VALID user")
      res.end('done');
  }
} 
  });
}));
app.post('/register', (function (req, res) {
  dbo.collection("user").find({ Username: req.body.Username }).toArray(function (err, result) {
    if (err) throw err;
    if (result.length == 0) {
      let val1 = myModule.saltHashPassword(req.body.Password); 
      var password=val1.passwordHash;
      var salt=val1.salt;
      console.log(" my value s "+val1.passwordHash);
      console.log("salt "+val1.salt);
      console.log("SERVICE NAME "+req.body.ServiceName);
      dbo.collection("user").insertOne({ Name: req.body.Name,Phone:req.body.Phone,Address:req.body.Address, Emailid: req.body.Emailid, Username: req.body.Username,ServiceName:req.body.ServiceName,PasswordHash:password,Salt:salt }, function (err, res) {
        if (err) throw err;
        console.log("register"+result);
      });
     // console.log("inserted");
     res.end('done');
    }
    else {
      res.send('username already exist');
     // console.log("not inserted");
    }
  });
}));
app.post('/Sessionuser', (function (req, res) {
  console.log("iN HOME API");
  console.log(sess.username);
 // res.end('done');
   res.send(sess.username);
}));
app.get('/logout', (req, res) => {
  sess=undefined;
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('http://localhost:5000/login');
  });
});
// in who
app.post("/who/:url", function (req, res)
{ console.log("IN WHO");
var name=req.params.url;
console.log(name);
   dbo.collection("user").find({"Username":name},{ projection: { _id: 0,ServiceName:1} }).toArray(function(err, result) {
    if (err) throw err;
    console.log("IN WHO");
    console.log(result);
    res.send(result);
   });
});
var Service;
//For Utensil
app.post("/utensil", function (req, res)
{ console.log("IN UTENSIL");
   dbo.collection("user").find({"ServiceName":"Utensil"},{ projection: { _id: 0,Name: 1 ,ServiceName:1} }).toArray(function(err, result) {
    if (err) throw err;
    console.log("IN UTENSIL");    
  Service="Utensil";
          console.log(result);
    res.send(result);
   });
});
app.post("/utensilprovider/:url", function (req, res)
{ console.log("utensilprovider");
  var name=req.params.url;
   dbo.collection("user").find({"Name":name},{ projection: { _id: 0,Name: 1,ServiceName:1} }).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
   });
});
//service registration
app.post("/regisFor/:url", (req, res) => {
  console.log("INN REGIS API")
  console.log(req.body.Name);
  console.log(req.body.Address);
   console.log(req.body.Email);
   console.log(req.body.Mobile);
   console.log(req.body.ServiceName);
   console.log(req.body.Description);
   var url=req.params.url;
   console.log("uellrm "+url);
  dbo.collection("serviceprovider").insertOne({Name: req.body.Name,Address: req.body.Address,Email: req.body.Email,Mobile: req.body.Mobile,ServiceName: req.body.ServiceName,Description: req.body.Description},function(err,res){
  if(err)throw err;
  });
  console.log("inserted");
  res.send("http://localhost:5000/"+url);
});
// display oreders
app.post("/order/:url", function (req, res)
{
  var url=req.params.url;
  console.log(url);
  console.log("IN F+ORDER GEYSEr");
  console.log("uellrm "+url);
   dbo.collection("order").find({"NameofWorker":url},{ projection: { _id: 1,Name: 1,ProductName:1,Qty:1} }).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
   });
});
// for image purpose
var fs = require('fs'); 
var path = require('path'); 
var multer = require('multer'); 
var path = require('path'); 
const { strict } = require('assert');
const { Int32 } = require('mongodb');
require('dotenv/config');
  var name;
var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, '../pages/product/uploads') 
    }, 
    filename: function(req, file, cb){
        name=file.originalname;
        cb(null,file.originalname);
      } 
});  
var upload = multer({ storage: storage ,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
}); 
// Check File Type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
  } 
  app.post('/UP', upload.single('image'), (req, res, next) => { 
    console.log("IN UPLOADOING"); 
      var obj = {      
        UName:sess.username,
          nameIMG: name, 
          descIMG: req.body.descImg, 
          img: { 
              data: fs.readFileSync(path.join('../pages/product/uploads/' + req.file.filename)),              
          } ,
          NameofProd:req.body.nameofprod,        
          Price: req.body.price,
          Qty:req.body.qty,
          ServiceName: req.body.ServiceName   
      } 
      console.log(req.body.uname);
     console.log(req.body.ServiceName);
       console.log(req.body.descImg);
       var url=req.params.url; 
      dbo.collection("serviceprovider").insertOne(obj,function(err,res){
      if(err)throw err;
      });
      console.log("inserted");
      if(req.body.ServiceName=="utensil")
      res.redirect("http://localhost:5000/product/utensilServices");
      else if(req.body.ServiceName=="furniture")
      res.redirect("http://localhost:5000/product/furnitureServices");
      else if(req.body.ServiceName=="bedsheet")
      res.redirect("http://localhost:5000/product/bedsheetServices");
  }); 
 //update Utensil Service
app.post('/update', upload.single('image'), (req, res) => {
  console.log("IN Updateion");
  console.log(req.body.id);
  var myquery = { _id: objectId(req.body.id)};
  var newvalue = { "$set": {
    Price:req.body.price,
    Qty:req.body.qty,
    descIMG:req.body.descImg,
    NameofProd:req.body.nameofprod,
    nameIMG:name,  
} 
}
  dbo.collection("serviceprovider").updateOne(myquery,newvalue, function(err, obj) {
    if (err) throw err;
    console.log("1 document updated");
  });
  if(req.body.ServiceName=="utensil")
      res.redirect("http://localhost:5000/product/utensilServices");
      else if(req.body.ServiceName=="furniture")
      res.redirect("http://localhost:5000/product/furnitureServices");
      else if(req.body.ServiceName=="bedsheet")
      res.redirect("http://localhost:5000/product/bedsheetServices");
}); 
// IMAGES FOR UTENSIL
app.post("/displayImage/:url", function (req, res)
{
  var service=req.params.url;
  console.log("NAME IS "+service);
   dbo.collection("serviceprovider").find({"ServiceName":service,"UName":sess.username},{ projection: { _id: 1,nameIMG: 1,descIMG:1,NameofProd:1,Price:1,Qty:1 } }).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
   });
});
app.post("/displayCustomer/:url", function (req, res)
{
  var service=req.params.url;
  console.log("NAME IS "+service);
   dbo.collection("serviceprovider").find({"ServiceName":service},{ projection: { _id: 1,nameIMG: 1,NameofProd:1,descIMG:1  } }).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
   });
});
app.post("/displayService.html/:url", function (req, res)
{ 
  console.log("DETAILED INFO")
  var id=req.params.url;
   dbo.collection("serviceprovider").find({"_id":objectId(id)},{ projection: { _id: 1,NameofProd:1,Price:1,Qty:1,descIMG:1,nameIMG:1} }).toArray(function(err, result) {
    if (err) throw err;
    console.log("GKKKKKKKKKKKKKKKKKKKKKKKKKKKKK");
    console.log(result);
    res.send(result);
   });
});
//Add to Cart
app.post("/addtocart/:url", function (req, res)
{ 
   console.log("Add to Cart");
  var id=req.params.url;
 dbo.collection("addtocart").find({ unique: objectId(id),UName:sess.username}).toArray(function (err, result) {
    if (err) throw err;
    console.log("QUANTITY is "+req.body.Quantity);
    if (result.length == 0) { 
      dbo.collection("addtocart").insertOne({unique:objectId(id),UName:sess.username,Type:"P",Qty:req.body.Quantity},function(err,res){
        if(err)throw err;
        });
     // console.log("inserted");
     res.end('done');
    }
    else {
      res.send('already');
     // console.log("not inserted");
    }
  });
});
app.post("/addAllCartDetails", function (req, res)
{ 
  dbo.collection("addtocart").find({}).forEach(function(doc){
    console.log(doc);
    console.log()
    if(doc.UName==sess.username)
   { dbo.collection("historycust").insertOne({UName:sess.username,ProductId:doc.unique,Qty:doc.Qty},function(err,res){
      if(err)throw err;
      });
  }
   // console.log("inserted");
 
 });
 res.end('done');
});
app.post("/updateglobal/:url", function (req, res)
{ 
   console.log("Update Global");
  var id=req.params.url;
 
  console.log("Unique  IS "+id);
  var myquery = { unique: objectId(id) };
  var newvalue = { "$set": {
    Qty:req.body.Quantity,
   
} 
}
  dbo.collection("addtocart").updateOne(myquery,newvalue, function(err, obj) {
    if (err) throw err;
    console.log("1 document updated"); 
  });
  res.send('done');
});
app.post("/checkcart/:url", function (req, res)
{ 
   console.log("Add to Cart");
  var id=req.params.url;
  dbo.collection("addtocart").find({ unique: objectId(id),UName:sess.username }).toArray(function (err, result) {
    if (err) throw err;
    if (result.length == 0) {
     res.end('done');
    }
    else {
      res.send('already');
     // console.log("not inserted");
    }
  });
});
app.post("/proceedtopay", function (req, res)
{ 
  console.log("user is "+sess.username);
  console.log("IN PROCEED TO PAY API");
  dbo.collection('addtocart').find({UName:sess.username},{ projection: {_id:0, unique: 1,Qty:1} }).toArray(function(err, result) {
    if (err) throw err;
    console.log("PAYMRNr");
    console.log(result);
    res.send(result);
   });
});
// delete from cart
app.get('/deleteorder/:url', (req, res) => {
  console.log("IN DELETION OF Image");
  var url=req.params.url;
  console.log("id    FF   IS "+url);
  var myquery = { 
    "unique": objectId(url) 
  };
  dbo.collection("addtocart").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.redirect("http://localhost:5000/product/proceedtopay");  
  });
});
//delete
app.get('/delete/:url', (req, res) => {
  var url=req.params.url;
  console.log("NAME IS "+url);
  var myquery = { Name: url };
  dbo.collection("geyserorder").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.redirect("http://localhost:5000/utensil");
    db.close(); 
  });
});
//delete utensel 
app.get('/deleteVendorCustomer/:url', (req, res) => {
  console.log("IN DELETION OF utensil");
  var url=req.params.url;
  console.log("NAME IS "+url);
  var myquery = { NameofWorker: sess.username ,
    _id:objectId(url)
  };
  dbo.collection("order").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.redirect("http://localhost:5000/product/utensilServices");    
  });
});
//furniture
app.get('/deleteVendorCustomerFurniture/:url', (req, res) => {
  console.log("IN DELETION OF Vendor");
  var url=req.params.url;
  console.log("NAME IS "+url);
  var myquery = { NameofWorker: sess.username ,
    _id:objectId(url)
  };
  dbo.collection("order").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.redirect("http://localhost:5000/product/furnitureServices");  
  });
});
app.get('/deleteVendorCustomerBedsheet/:url', (req, res) => {
  console.log("IN DELETION OF Vendor");
  var url=req.params.url;
  console.log("NAME IS "+url);
  var myquery = { NameofWorker: sess.username ,
    _id:objectId(url)
  };
  dbo.collection("order").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.redirect("http://localhost:5000/product/bedsheetServices");  
  });
});
//delete imagevof utensil
app.get('/deleteImage/:url', (req, res) => {
  console.log("IN DELETION  utenidol OF Image");
  var url=req.params.url;
  console.log("id    FF   IS "+url);
  var myquery = { 
    "_id": objectId(url)  
  };
  dbo.collection("serviceprovider").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.redirect("http://localhost:5000/product/utensilServices");   
  });
});
//delete imagevof furniture
app.get('/deleteImageFurniture/:url', (req, res) => {
  console.log("IN DELETION OF furniture Image");
  var url=req.params.url;
  console.log("id    FF   IS "+url);
  var myquery = { 
    "_id": objectId(url)
  };
  dbo.collection("serviceprovider").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.redirect("http://localhost:5000/product/furnitureServices");  
  });
});
//delete imagevof bedsheet
app.get('/deleteImageBedsheet/:url', (req, res) => {
  console.log("IN DELETION OF furniture Image");
  var url=req.params.url;
  console.log("id    FF   IS "+url);
  var myquery = { 
    "_id": objectId(url)
  };
  dbo.collection("serviceprovider").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.redirect("http://localhost:5000/product/bedsheetServices");  
  });
});
/// maid, electric, kitchen
app.post('/Services/:url', (req, res) => {
  var service=req.params.url;
  console.log("INN SERVICES API")
  console.log("new value ****************");
  console.log(req.body.Name);
   console.log(req.body.PhoneNum);
   console.log(req.body.Card);
   console.log(req.body.Account);
   console.log(req.body.Place);
      dbo.collection("services").insertOne({UName:sess.username,Name: req.body.Name,PhoneNum: req.body.PhoneNum,Card: req.body.Card,Account: req.body.Account,Place:req.body.Place,Work:req.body.Work,ServiceName:service,WorkDone:0 },function(err,res){
        if(err)throw err;     
        });
       res.send('done');     
});
app.post('/updateServices/:url', (req, res) => {
  console.log("IN Updateion OF VENDOR");
  var id=req.params.url;
  var service=req.body.ServiceName;
  console.log("Unique  IS "+id);
  var myquery = { _id: objectId(id) };
  var newvalue = { "$set": {
    Name:req.body.Name,
    PhoneNum: req.body.PhoneNum,
    Card: req.body.Card,
    Account: req.body.Account,
    Place: req.body.Place,
   
    Work:req.body.Work
} 
}
  dbo.collection("services").updateOne(myquery,newvalue, function(err, obj) {
    if (err) throw err;
    console.log("1 document updated"); 
  });
  res.send('done');
});
app.post("/displayServices", function (req, res)
{
  console.log("IN DISPLAY OF VENDOR");
   dbo.collection("services").find({"UName":sess.username},{ projection: { _id: 1,Name: 1,PhoneNum:1,Card:1,Account:1,Place:1,Time:1,Work:1} }).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
   });
});
app.post("/showServices/:url", function (req, res)
{
  var id=req.params.url;
  console.log("IN ");
   dbo.collection("services").find({ServiceName:id,UName:sess.username},{ projection: { _id: 1,Name:1,PhoneNum: 1,Card:1,Account:1,Place:1,Time:1,Work:1} }).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
   });
});
//deletee maid
app.get('/deleteMaid/:url', (req, res) => {
  console.log("IN DELETION OF MAID");
  var url=req.params.url;
  console.log("NAME IS "+url);
  var myquery = { _id: objectId(url) };
  dbo.collection("services").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.redirect("http://localhost:5000/services/maidServices");   
  });
});
app.get('/deleteElectric/:url', (req, res) => {
  console.log("IN DELETION OF Electric");
  var url=req.params.url;
  console.log("NAME IS "+url);
  var myquery = { _id: objectId(url) };
  dbo.collection("services").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.redirect("http://localhost:5000/services/electricianServices");  
  });
});
app.get('/deleteKitchen/:url', (req, res) => {
  console.log("IN DELETION OF Electric");
  var url=req.params.url;
  console.log("NAME IS "+url);
  var myquery = { _id: objectId(url) };
  dbo.collection("services").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    res.redirect("http://localhost:5000/services/kitchenServices");
  });
});
var Razorpay=require("razorpay");
let instance = new Razorpay({
  key_id: 'rzp_test_16QVKCjpkpLblg', // your `KEY_ID`
  key_secret: 'w82Yg0o2vp6vANwsiyUPj6oG' // your `KEY_SECRET`
})
app.post("/api/payment/order",(req,res)=>{
  console.log("in payment API");
params=req.body;
instance.orders.create(params).then((data) => {
  res.send({"sub":data,"status":"success"});
}).catch((error) => {
  res.send({"sub":error,"status":"failed"});
})
});
app.post("/api/payment/verify",(req,res)=>{
body=req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
var crypto = require("crypto");
var expectedSignature = crypto.createHmac('sha256', 'w82Yg0o2vp6vANwsiyUPj6oG')
                           .update(body.toString())
                           .digest('hex');
                           console.log("sig"+req.body.razorpay_signature);
                           console.log("sig"+expectedSignature);
var response = {"status":"failure"}
if(expectedSignature === req.body.razorpay_signature)
response={"status":"Your payment has been done successfully"};
res.send(response);
});
//getting email
app.post("/email", function (req, res)
{ console.log("IN EMAIL" +sess.username);
   dbo.collection("user").find({"Username":sess.username},{ projection: { _id: 0,Emailid:1} }).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
   });
});
// mail functionalities
var nodemailer = require("nodemailer");
const { compile } = require('ejs');
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'servicestodoor@gmail.com',
    pass: 'servicesshah'
  }
});
app.post('/send/:url',function(req,res){
  console.log("in sne d emial");
  var mail=req.params.url;
  // var order_id=req.body.razorpay_order_id;
  // var p_id=req.body.razorpay_payment_id;
  // var rs=req.body.rs;
  console.log("o_id"+req.body.oid);
  console.log("p_id"+req.body.pid);
  console.log("rs"+req.body.rs);
  var mailOptions={
      from:'servicestodoor@gmail.com',
      to :mail ,
      subject : "Thanks for Ordering at Services To Door!!!",  
      html:`<h2>Hello `+sess.username+`,</h2>
      <p>Thank you for shopping at ServicesToDoor. You have done shopping of <b>Rs.`+req.body.rs+`</b>. We're prepping your order with Bag of Joy.
      Enjoy shopping at ServicesToDoor!!!!</p>
      <p><b>Your Order Id is:</b> `+ req.body.oid+`<br>
      <b>Your Payment Id is:</b> `+req.body.pid+`</p>`
  }
  console.log(mailOptions);
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        res.send('error');
      } else {
        console.log('Email sent: ' + info.response);
        res.send('done');
      }
    });
});
app.post('/sendServices/:url',function(req,res){
  console.log("in sne d emial");
  var mail=req.params.url;
  // var order_id=req.body.razorpay_order_id;
  // var p_id=req.body.razorpay_payment_id;
  // var rs=req.body.rs;
  console.log("o_id"+req.body.oid);
  console.log("p_id"+req.body.pid);
  console.log("rs"+req.body.rs);
  var mailOptions={
      from:'servicestodoor@gmail.com',
      to :mail ,
      subject : "Thanks for Ordering at Services To Door!!!",  
      html:`<h2>Hello `+sess.username+`,</h2>
      <p>Thank you for Registering at ServicesToDoor.You have successfully Registered your service and  Your visiting charge is of <b>Rs.`+req.body.rs+`</b>.
      Enjoy our services at ServicesToDoor!!!!<br>
      Your <b>`+req.body.ServiceName+` `+req.body.WorkerName+`</b></p>
      <p>
      <b>Your Payment Id is:</b> `+req.body.pid+`</p>`
  }
  console.log(mailOptions);
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        res.send('error');
      } else {
        console.log('Email sent: ' + info.response);
        res.send('done');
      }
    });
});
//delete from cart after payment
app.post('/deleteAllCart', (req, res) => {
  console.log("IN DELETION OF CART"); 
  console.log("id    FF   IS "+sess.username);
  var myquery = { 
    "UName":sess.username  
  };
  dbo.collection("addtocart").deleteMany(myquery, function(err, obj) {
    if (err) throw err;
    console.log("many document deleted");
    res.send("done");  
  });
});

//Edit info of customer
app.post("/editInfoCustomer", function (req, res)
{
  console.log("Edit Info");
   dbo.collection("user").find({"Username":sess.username},{ projection: { _id: 0,Name: 1,Phone:1,Address:1,Emailid:1} }).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
   });
});
app.post('/CustomerMaid/:url', (req, res) => {

  dbo.collection("customerServices").find({ Username: req.body.Username }).toArray(function (err, result) {
    if (err) throw err;
    if (result.length == 0) {
      var service=req.params.url;
      console.log("INN CUSTOMER SERVICES API")
      console.log("new value ****************");

          dbo.collection("customerServices").insertOne({UName:sess.username,Name: req.body.Name,PhoneNum: req.body.PhoneNum,Address: req.body.Address,Emailid: req.body.Emailid,Pincode:req.body.Pincode, Place:req.body.Place,Time:req.body.Time,Date:req.body.Date,NoOfPerson:req.body.NoOfPerson,BHK:req.body.BHK,Service:req.body.Service,ServiceName:req.body.ServiceName,MaidName:'',ElectricName:'',KitchenName:''},function(err,res){
            if(err)throw err;     
            });
            //logic of Filtering
          res.send('done');     
    }
    else{
    //update logic
    var myquery = { UName: sess.username };
    var newvalue = { "$set": {
      Name: req.body.Name,
      PhoneNum: req.body.PhoneNum,
      Address: req.body.Address,
      Emailid: req.body.Emailid,
      Pincode:req.body.Pincode,
       Place:req.body.Place,
       Time:req.body.Time,
       Date:req.body.Date,
       NoOfPerson:req.body.NoOfPerson,
       BHK:req.body.BHK,
       Service:req.body.Service,
       ServiceName:req.body.ServiceName,
       MaidName:'',
       ElectricName:'',
       KitchenName:''
      
  } 
  }
    dbo.collection("customerServices").updateOne(myquery,newvalue, function(err, obj) {
      if (err) throw err;
      console.log("1 document updated"); 
    });
    res.send('done');
    }
});
});
app.post('/CustomerSer/:url', (req, res) => {
  var service=req.params.url;
  dbo.collection("customerServices").find({ Username: req.body.Username,ServiceName:service }).toArray(function (err, result) {
    if (err) throw err;
    if (result.length == 0) {
      
      console.log("INN CUSTOMER SERVICES API")
      console.log("new value ****************");

          dbo.collection("customerServices").insertOne({UName:sess.username,Name: req.body.Name,PhoneNum: req.body.PhoneNum,Address: req.body.Address,Emailid: req.body.Emailid,Pincode:req.body.Pincode, Place:req.body.Place,Time:req.body.Time,Date:req.body.Date,NoOfPerson:req.body.NoOfPerson,BHK:req.body.BHK,Service:req.body.Service,ServiceName:req.body.ServiceName,MaidName:'',ElectricName:'',KitchenName:''},function(err,res){
            if(err)throw err;     
            });
            //logic of Filtering
          res.send('done');     
    }
    else{
    //update logic
    var myquery = { UName: sess.username };
    var newvalue = { "$set": {
      Name: req.body.Name,
      PhoneNum: req.body.PhoneNum,
      Address: req.body.Address,
      Emailid: req.body.Emailid,
      Pincode:req.body.Pincode,
       Place:req.body.Place,
       Time:req.body.Time,
       Date:req.body.Date,
       NoOfPerson:req.body.NoOfPerson,
       BHK:req.body.BHK,
       Service:req.body.Service,
       ServiceName:req.body.ServiceName,
       MaidName:'',
       ElectricName:'',
       KitchenName:''
      
  } 
  }
    dbo.collection("customerServices").updateOne(myquery,newvalue, function(err, obj) {
      if (err) throw err;
      console.log("1 document updated"); 
    });
    res.send('done');
    }
});
});

app.post('/Area/:url', (req, res) => {
  var service=req.params.url;
  var place=req.body.Area;
  console.log("INN CUSTOMER SERVICES API"+place)
  var removedSpacesText = place.split(" ").join("");
  console.log(removedSpacesText.toLowerCase())
  place=removedSpacesText.toLowerCase();
  console.log("new value ****************");
  dbo.collection("services").find({"Place":place,"ServiceName":service},{ projection: {_id: 1,Name: 1,Work:1,WorkDone:1} }).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
   });
      
});
var db;
app.post('/MinValue', (req, res) => {
 console.log("IN SORTING FUNCTIon");
  dbo.collection("InsertDetails").find({}).sort({WorkDone:1}).limit(1)
  .toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
   });
});
/// maid, electric, kitchen
app.post('/InsertDetails', (req, res) => {
 
  console.log("INN Insert API")
  console.log("new value ****************");
  console.log(req.body.Name);
   console.log(req.body.id);
   console.log(req.body.WorkDone);
  
      dbo.collection("InsertDetails").insertOne({UName:sess.username,unique:objectId(req.body.id),Name: req.body.Name,WorkDone: req.body.WorkDone },function(err,res){
        if(err)throw err; 
        console.log("register"+res);
        });
        res.send('done');
     
});

app.post('/deleteAllInsertDetail', (req, res) => {
  console.log("IN DELETION OF InsertDetails"); 

  var myquery = { 
    "UName":sess.username  
  };
  dbo.collection("InsertDetails").deleteMany(myquery, function(err, obj) {
    if (err) throw err;
    console.log("many document deleted");
    res.send("done");  
  });
});
app.post('/updateWorkDone/:url', (req, res) => {
  console.log("IN Updateion OF VENDOR");
  var id=req.params.url;
 
  console.log("Unique  IS "+id);
  console.log(req.body.WorkDone);
  console.log(req.body.WorkDone+1)
  console.log(Int32(req.body.WorkDone)+1)
  var myquery = { _id: objectId(id) };
  var newvalue = { "$set": {
    
    WorkDone: req.body.WorkDone
} 
}
  dbo.collection("services").updateOne(myquery,newvalue, function(err, obj) {
    if (err) throw err;
    console.log("1 document updated"); 
  });
  res.send('done');
});

app.post('/updateMaidName/:url', (req, res) => {
  console.log("IN Updateion OF VENDOR");
  var name=req.params.url;
 
 
  var myquery = { UName: sess.username };
  var newvalue = { "$set": {
    
    MaidName: name
} 
}
  dbo.collection("customerServices").updateOne(myquery,newvalue, function(err, obj) {
    if (err) throw err;
    console.log("1 document updated"); 
  });
  res.send('done');
});


app.post("/getpidqty", function (req, res)
{ 
  console.log("user is "+sess.username);
  console.log("IN PROCEED TO PAY API");
  dbo.collection('addtocart').find({UName:sess.username},{ projection: {_id:0, unique: 1,Qty:1} }).toArray(function(err, result) {
    if (err) throw err;
    
    console.log(result);
    res.send(result);
   });
});
app.post("/sprovider/:url", function (req, res)
{ var id =req.params.url;
  console.log("user is "+sess.username);
  console.log("sprovider");
  dbo.collection('serviceprovider').find({_id:objectId(id)},{ projection: {UName:1,NameofProd:1} }).toArray(function(err, result) {
    if (err) throw err;
  
    console.log(result);
    res.send(result);
   });
});
app.post("/insertOrder", function (req, res)
{ 
  dbo.collection("order").insertOne({Name:sess.username,ProductName: req.body.ProductName,Qty:req.body.Qty,NameofWorker:req.body.NameofWorker },function(err,res){
    if(err)throw err;     
    });
    console.log("INESERHHS")
   res.send('done');
});
app.post("/acceptFeedback/:url", (req, res) => {
   
  
  console.log(req.body.email);
  console.log(req.body.msg);
  var url=req.params.url;
  console.log("uellrm "+url);
 dbo.collection("feedbacks").insertOne({email: req.body.email,msg: req.body.msg},function(err,res){
 if(err)throw err;
 });
 console.log("inserted");
 res.send("http://localhost:5000/"+url);
});
var server = app.listen(3000, function () { });