var express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
var http = require('http');
var path = require("path");
var mysql = require('mysql');
var bodyParser = require('body-parser');
const{resolve}= require('dns');
var app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized:true,
 //cookie: { maxAge: oneDay },
  resave: false
}));
var server = http.createServer(app);
  var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "jobdekho"
  });
  
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));

app.get('/', function(req,res){
   // res.render("index");
   res.render("index",{userid: "",usertype:""});
  });
  app.get("/jobpost", function(req, res){
    res.render("jobpost");
  });

  app.get("/jobpostlist", function(req, res){
   // res.render("jobpostlist");
   db.query("SELECT * FROM jobposting WHERE userid = '" + req.session.empuserid +"'", function (err, result) {
    //    if any error while executing above query, throw error
       if (err) throw err;
       // if there is no error, you have the result
       numRows = result.length;
       if(numRows>0)
       {
        res.render("jobpostlist",{sqldata:result});
       } 
       else
       {  
       res.render("jobpostlist",{sqldata:result});
       }
      });
  });
  app.get("/login", function(req, res){
    res.render("login");
  });
  app.get("/aboutus", function(req, res){
    res.render("about");
  });
  app.get("/ContactUs", function(req, res){
    res.render("contact");
  });
  
  app.get("/myprofile", function(req, res){

    db.query("SELECT * FROM candidatemaster WHERE userid = '" + req.session.userid +"'", function (err, result, fields) {
      //    if any error while executing above query, throw error
         if (err) throw err;
         // if there is no error, you have the result
         numRows = result.length;
         if(result[0].profilestatus=="updated")
         {
           res.send("User profile updated !")
         } 
         else
         {  
         res.render("myprofile");
         }
        });
  });

  app.get("/empprofile", function(req, res){
    db.query("SELECT * FROM employermaster WHERE userid = '" + req.session.empuserid +"'", function (err, result, fields) {
      //    if any error while executing above query, throw error
         if (err) throw err;
         // if there is no error, you have the result
         numRows = result.length;
         if(result[0].profilestatus=="updated")
         {
           res.send("Employer profile updated !")
         } 
         else
         {  
         res.render("empprofile");
         }
        });
  });
  app.get("/logout", function(req, res){
    req.session.userid="";
    res.render("index",{userid: ""});
  });
  app.post("/loginauth", function(req, res){
    db.connect(function(err) {
     //  res.send("SELECT * FROM candidatemaster WHERE userid = '" +  [req.body.userid]+"' and password='" +  [req.body.password] +"'");
              db.query("SELECT * FROM candidatemaster WHERE userid = '" +  [req.body.userid]+"' and password='" +  [req.body.password] +"'", function (err, result, fields) {
             //    if any error while executing above query, throw error
                if (err) throw err;
                // if there is no error, you have the result
                numRows = result.length;
                //res.send(numRows);
                if(numRows>0)
                {
                  if(req.body.password==result[0].password)
                  {
                    req.session.userid=[req.body.userid];
                    req.session.usertype="jobseeker";
                    res.render("index",{userid: req.session.userid,usertype: req.session.usertype});
                  }
                  else
                  {
                    //res.send("User Id or password is incorrect !");
                    res.render("login");
                  } 
                }
                else
                {
                  res.send("User Id or password is incorrect !");
                }              
            });
          });        
  });

  app.get("/register", function(req, res){
    res.render("register");
  });
 // write program to insert job posting into job post table
  app.post("/jobpostresult",function(req,res) {
    db.connect(function(err) {
                var sql="insert into jobposting (UserID,postingdate,Lastdate,Jobtitle,Skillset,Experience,Salary,Location,Joiningperiod,wfhstatus,Jobprofile) values('" +  req.session.empuserid + "',CURRENT_TIMESTAMP(),'" +  [req.body.Lastdate] + "','" +  [req.body.Jobtitle] + "','" +  [req.body.Skillset] + "','" +  [req.body.Experience] + "','" +  [req.body.Salary] + "','" +  [req.body.Location] + "','" +  [req.body.Joiningperiod] + "','" +  [req.body.wfhstatus] + "','" +  [req.body.Jobprofile] + "')";
                db.query(sql, function (err, result) {
                     if (err) throw err;               
                     //console.log("1 record inserted");
                     //res.send("Job posted Successfully. <br> Thank you !")
                     res.render("jobpostresult");
                   });
                
               // console.log(result);
               // res.send(result);
              });
            });
      
    
   // end here write program to insert job posting into job post table
  app.post("/registerresult", function(req, res){
    db.connect(function(err) {
 // res.send("SELECT * FROM candidatemaster WHERE userid = '" +  [req.body.userid]+"'");
         db.query("SELECT * FROM candidatemaster WHERE userid = '" +  [req.body.userid]+"'", function (err, result, fields) {
        //    if any error while executing above query, throw error
           if (err) throw err;
           // if there is no error, you have the result
           numRows = result.length;
           if(numRows>0)
           {
             res.send("User Already exists ! Please try another one.")
           }
           else
           {
            var sql = "INSERT INTO candidatemaster (userid,password) VALUES ('" +  [req.body.userid] + "','" + [req.body.password]+"')";
              db.query(sql, function (err, result) {
                if (err) throw err;               
                //console.log("1 record inserted");
                res.send("Registered Successfully. <br> Welcome to Job Dekho !")
              });
           }
          // console.log(result);
          // res.send(result);
         });
       });
  });

  app.post("/profileupdateresult", function(req, res){
    db.connect(function(err) {
            //var sql = "INSERT INTO candidateprofile (userid,password) VALUES ('" +  [req.body.userid] + "','" + [req.body.password]+"')";
            var sql="update candidatemaster set first_name='" +  [req.body.firstname] + "',last_name='" +  [req.body.lastname] + "',emailid='" +  [req.body.emailid] + "',mobileno='" +  [req.body.mobileno] + "',address='" +  [req.body.address] + "',state='" +  [req.body.state] + "',city='" +  [req.body.city] + "',profilestatus='updated' where userid='" +  req.session.userid + "'";
          //  res.send(sql);
            db.query(sql, function (err, result) {
                 if (err) throw err;               
            //     //console.log("1 record inserted");
                 res.send("Profile updated Successfully !")
               });         
    }); 
});

app.post("/empupdateresult", function(req, res){
  db.connect(function(err) {
          //var sql = "INSERT INTO candidateprofile (userid,password) VALUES ('" +  [req.body.userid] + "','" + [req.body.password]+"')";
          var sql="update employermaster set employer_first_name='" +  [req.body.firstname] + "',employer_last_name='" +  [req.body.lastname] + "',emailid='" +  [req.body.emailid] + "',mobileno='" +  [req.body.mobileno] + "',address='" +  [req.body.address] + "',state='" +  [req.body.state] + "',city='" +  [req.body.lastname] + "',profilestatus='updated' where userid='" +  req.session.empuserid + "'";
        //  res.send(sql);
          db.query(sql, function (err, result) {
               if (err) throw err;               
          //     //console.log("1 record inserted");
               res.send("Profile updated Successfully !")
             });         
  }); 
});
server.listen(3000, function(){
    console.log("server is listening on port: 3000");
  });

  // app.post('/login', function(req,res){
  //  // res.send(req.body);
  // db.connect(function(err) {
  //   //res.send("SELECT * FROM candidatemaster WHERE userid = '" +  [req.body.userid]+"'");
  //       db.query("SELECT * FROM candidatemaster WHERE userid = '" +  [req.body.userid]+"'", function (err, result, fields) {
  //         // if any error while executing above query, throw error
  //         if (err) throw err;
  //         // if there is no error, you have the result
  //        // console.log(result);
  //         res.send(result);
  //       });
  //     });
  // });

  // Employer Section

  app.get("/emplogin", function(req, res){
    res.render("emplogin");
  });


  app.get("/empregister", function(req, res){
    res.render("empregister");
  });
  app.post("/emploginauth", function(req, res){
    db.connect(function(err) {
     //  res.send("SELECT * FROM candidatemaster WHERE userid = '" +  [req.body.userid]+"' and password='" +  [req.body.password] +"'");
              db.query("SELECT * FROM employermaster WHERE userid = '" +  [req.body.userid]+"' and password='" +  [req.body.password] +"'", function (err, result, fields) {
             //    if any error while executing above query, throw error
                if (err) throw err;
                // if there is no error, you have the result
                numRows = result.length;
                //res.send(numRows);
                if(numRows>0)
                {
                  if(req.body.password==result[0].password)
                  {
                    req.session.empuserid=[req.body.userid];
                    req.session.usertype="employer";
                    res.render("index",{userid: req.session.empuserid,usertype: req.session.usertype});
                  }
                  else
                  {
                    //res.send("User Id or password is incorrect !");
                    res.render("login");
                  } 
                }
                else
                {
                  res.send("User Id or password is incorrect !");
                }              
            });
          });        
  });
  app.post("/empregisterresult", function(req, res){
    db.connect(function(err) {
 // res.send("SELECT * FROM candidatemaster WHERE userid = '" +  [req.body.userid]+"'");
         db.query("SELECT * FROM employermaster WHERE userid = '" +  [req.body.userid]+"'", function (err, result, fields) {
        //    if any error while executing above query, throw error
           if (err) throw err;
           // if there is no error, you have the result
           numRows = result.length;
           if(numRows>0)
           {
             res.send("User Already exists ! Please try another one.")
           }
           else
           {
            var sql = "INSERT INTO employermaster (userid,password) VALUES ('" +  [req.body.userid] + "','" + [req.body.password]+"')";
              db.query(sql, function (err, result) {
                if (err) throw err;               
                //console.log("1 record inserted");
                res.send("Registered Successfully. <br> Welcome to Job Dekho !")
              });
           }
          // console.log(result);
          // res.send(result);
         });
       });
  });
  app.post("/jobsearch", function(req, res){
    db.connect(function(err) {
     //  res.send("SELECT * FROM candidatemaster WHERE userid = '" +  [req.body.userid]+"' and password='" +  [req.body.password] +"'");
              db.query("SELECT * FROM jobposting WHERE (location like '%" +  [req.body.location]+"%' and skillset like '%" +  [req.body.skillset] +"%' and jobtitle like '%" +  [req.body.keyword] + "%')  order by postingdate desc", function (err, result, fields) {
             //    if any error while executing above query, throw error
                if (err) throw err;
                // if there is no error, you have the result
                numRows = result.length;
                //res.send(numRows);
                if(numRows>0)
                {
                  res.render("jobsearch",{sqldata:result});
                }
                else
                {
                  res.send("No Record found ! Try Again !");
                }              
            });
          });        
  });

  app.get("/jobdetail", function(req, res){
    res.render("jobdetail");
  });

