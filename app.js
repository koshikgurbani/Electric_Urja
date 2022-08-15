const express = require("express");
const bodyParser = require("body-parser");
var mysql = require("mysql");
var JSAlert = require("js-alert");
const bcrypt = require("bcrypt");
const saltRounds =10;

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password : "mayank@12345",
  database : "elecproject"
});


const app = express();
app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

var customers = [];
var admins = [];
var invoices = [];


con.connect(function(err){
  if(err){
    console.log(err);
  };
    console.log("connected my_sql");
});

app.get("/",function(req, res){
  res.render("home");
});


app.get("/logincustomer",function(req, res){
  res.render("logincustomer");
});

app.get("/loginadmin",function(req, res){
  res.render("loginadmin");
})

app.get("/register",function(req, res){
  res.render("register");
});


app.post("/",function(req, res){
   res.send("Its nothing");
});



app.post("/register", function(req,res){
  let username = req.body.mobile;
  bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    var sql7 = "insert into customer (cust_name, account_type, address, state, city, pincode, email_id, mobile_no, password, status) values("+"\""+req.body.name+"\", \"regular\", \""+req.body.address+"\", \""+req.body.state+"\", \""+req.body.city+"\", \""+req.body.pincode+"\", \""+req.body.email+"\", \""+req.body.mobile+"\", \""+hash+"\", \"Activated\")";
    con.query(sql7,function(err,result){
      if(err){
        res.send("There already exits an account with this mobile number.");
        console.log(err);
      }
      else{
        var customer_id = 0;
        var sql23 ="select * from customer where mobile_no = \""+username+"\"";
        con.query(sql23,function(err,result3){
          if(err){
            console.log(err);
          }
          else{
            customer_id= result3[0].cust_id;
            let today = new Date().toISOString().slice(0, 10);
            let time  = new Date().toTimeString().slice(0,8);
            let nettime = today+ " "+time;
            var sql20 = "insert into invoice (cust_id, reading_time, present_reading, previous_reading, consumption_unit, rate, current_bill, fine, prev_bill, fine_prev_balance, total_balance) values("+customer_id+", \""+nettime+"\", 0, 0, 0, 0.06, 0, 0.1, 0, 0, 0)";
            con.query(sql20, function(err,result2){
              if(err){
                console.log(err);
              }
            });
            let str = "customer"+ username;
            res.redirect(str);
          }
        });
      }
    });
  });
});

app.post("/logincustomer", function(req,res){
  let username = req.body.mobile;
  let pass = req.body.password;
  let sql11 = "select count(*) as count from customer where mobile_no = "+"\"" + username+"\"";
  con.query(sql11,function(err, result){
    if(err){
       console.log(err);
     }
     else{
       let un =result[0].count;
       if(un==0){
         res.send("Invalid Username");
       }
       else{
         let sql12 = "select password  from customer where mobile_no="+"\""+username+"\"";
         con.query(sql12,function(err, result){
           if(err){
              console.log(err);
            }
            else{
              bcrypt.compare(pass, result[0].password, function(err, result) {
                if(result === true){
                  let str = "customer"+username;
                  res.redirect(str);
                 }
                else{
                  res.send("Wrong password");
                }
              });
            }
          });
       }
     }
   });

});

app.post("/loginadmin", function(req,res){
  let username = req.body.username;
  let pass = req.body.password;
  var sql1 = "select count(*) as count from admin where login_id = "+"\"" + username+"\"";
  con.query(sql1,function(err, resulta){
    if(err){
       console.log(err);
     }
     else{
       let un =resulta[0].count;
       if(un==0){
         res.send("Invalild Username");
       }
       else{
         var sql2 = "select count(*) as count2 from admin where password ="+"\""+pass+ "\""+ "and login_id="+"\""+username+"\"";
         con.query(sql2,function(err, result){
           if(err){
              console.log(err);
            }
            else{
              let pw = result[0].count2;
              if(pw==0){
                res.send("Wrong password");
               }
              else{
                let str = "admin"+username;
                res.redirect(str);
              }
            }
          });
       }
     }
   });
});

app.post("/feedback",function(req,res){
  let username = req.body.mobile;
  let today = new Date().toISOString().slice(0, 10);
  var sql14 = "insert into feedback (cust_id,feedback,feedback_date) values("+req.body.cust_id+", \""+req.body.feedback+"\", \""+today+"\")";
  con.query(sql14,function(err,result){
     if(err){
       console.log(err);
     }
     else{
       let str = "customer"+ username;
       res.redirect(str);
     }
   });
});


app.post("/resetpass",function(req,res){
  let username = req.body.mobile;
  let password = req.body.newpass;
  let confirm_password = req.body.confirmpass;
  if(password == confirm_password){
    var sql15 = "update customer set password = \""+password+"\" where mobile_no = \""+username+"\"";
    con.query(sql15,function(err,result){
       if(err){
         console.log(err);
       }
       else{
         let str = "customer"+ username;
         res.redirect(str);
       }
     });
   }
   else{
     res.send("Confirm password doesn't matches with password");
   }
});

function dateDiffInDays(t1,t2){
    var one_day=1000*60*60*24;

    var x=t1.split("-");
    var y=t2.split("-");

    var date1=new Date(x[0],(x[1]-1),x[2]);
    var date2=new Date(y[0],(y[1]-1),y[2]);

    _Diff=Math.ceil((date2.getTime()-date1.getTime())/(one_day));
    return _Diff;

}


app.post("/admcustchange",function(req,res){
  let cust_id = req.body.cust_id;
  let consumption_unit = req.body.consumption_unit;
  let invoice_id = req.body.invoice_id;
  let rate = req.body.rate;
  let present_reading = req.body.present_reading;
  let current_bill = req.body.current_bill;
  let prev_bill = Number(req.body.prev_bill);
  let ptime = req.body.time;
  let fine = req.body.fine;
  let previous_reading = Number(present_reading);
  prev_bill = Number(current_bill) + prev_bill;
  present_reading = previous_reading+ Number(consumption_unit);
  current_bill = Number(consumption_unit)*Number(rate);
  let today = new Date().toISOString().slice(0, 10);
  let time  = new Date().toTimeString().slice(0,8);
  let nettime = today+ " "+time;
  let ans = dateDiffInDays(ptime.slice(0,10), today);
  let fine_prev_balance = prev_bill * (1+Number(fine));
  let total_balance = fine_prev_balance+current_bill;
  var sql22 = "update invoice set reading_time = \""+nettime+"\", consumption_unit = "+consumption_unit+", previous_reading = "+previous_reading+", present_reading = "+present_reading+",prev_bill = "+prev_bill+", current_bill = "+current_bill+",fine_prev_balance= "+fine_prev_balance+", total_balance = "+total_balance+" where invoice.cust_id = "+cust_id;
  con.query(sql22,function(err,result){
    if(err){
      console.log(err);
    }
    else{
      let str ="change"+req.body.mobile;
      res.redirect(str);
    }
  });
});

app.post("/checkout",function(req,res){
  let invoice_id = req.body.invoice_id;
  let cust_id = req.body.cust_id;
  let price_paid = req.body.price_paid;
  let total_bill = req.body.total_bill;
  let remaining_amount = total_bill - price_paid;
  let today = new Date().toISOString().slice(0, 10);
  let time  = new Date().toTimeString().slice(0,8);
  let nettime = today+ " "+time;
  let sql = "update invoice set consumption_unit = 0, current_bill = 0, prev_bill="+ remaining_amount+", fine_prev_balance ="+ remaining_amount+", total_balance ="+ remaining_amount+ " where cust_id = "+cust_id;
  con.query(sql,function(err,result){
    if(err){
      console.log(err);
    }
    else{
      let str ="customer"+req.body.mobile;
      res.redirect(str);
    }
  });
});


function customerdetails(){
  let sql = "select * from customer";
  con.query(sql,function(err,result){
    if(err){
      console.log(err);
    }
    else{
    customers = result;
    }
  });
}

function admindetails(){
  let sql = "select * from admin";
  con.query(sql,function(err,result){
    if(err){
      console.log(err);
    }
    else{
    admins = result;
    }
  });
}

function invoicedetails(){
  let sql = "select * from invoice";
  con.query(sql,function(err,result){
    if(err){
      console.log(err);
    }
    else{
    invoices = result;
    }
  });
}
app.get("/:topic",function(req, res){
  const id = req.params.topic;
  if(id.includes("admin",0)){
    var ans = id.substring(5);
    customerdetails();
    var sql9 = "select * from admin where login_id="+"\""+ans+"\"";
    con.query(sql9,function(err, result){
       if(err){
         console.log(err);
       }
       var admin = result[0];
       res.render("admin",{admin: admin,customers: customers});
     });
  }
  else if(id.includes("customer",0)){
    let ans = id.substring(8);
    var sql23 = "select * from bill";
    invoicedetails();
    let sql10 = "select * from customer where mobile_no="+"\""+ans+"\"";
    con.query(sql10,function(err, result){
       if(err){
         console.log(err);
       }
       else{
         var customer = result[0];
         res.render("customer",{customer:customer,invoices:invoices});
       }
     });
  }
  else if(id.includes("cust",0)){
    var ans = id.substring(4);
    var sql13 = "select * from customer where mobile_no="+"\""+ans+"\"";
    con.query(sql13,function(err, result){
       if(err){
         console.log(err);
       }
       var customer = result[0];
       res.render("customerprofile",{customer:customer});
     });
  }
  else if(id.includes("feed",0)){
    var ans = id.substring(4);
    var sql13 = "select * from customer where mobile_no="+"\""+ans+"\"";
    con.query(sql13,function(err, result){
       if(err){
         console.log(err);
       }
       var customer = result[0];
       res.render("feedback",{customer:customer});
     });
  }
  else if(id.includes("reset",0)){
    var ans = id.substring(5);
    var sql13 = "select * from customer where mobile_no="+"\""+ans+"\"";
    con.query(sql13,function(err, result){
       if(err){
         console.log(err);
       }
       var customer = result[0];
       res.render("resetpass",{customer:customer});
     });
  }
  else if(id.includes("adm",0)){
    var ans = id.substring(3);
    var sql17 = "select * from admin where login_id="+"\""+ans+"\"";
    con.query(sql17,function(err, result){
       if(err){
         console.log(err);
       }
       var admin = result[0];
       res.render("adminprofile",{admin:admin});
     });
  }
  else if(id.includes("change",0)){
    var ans = id.substring(6);
    customerdetails();
    admindetails();
    var sql22 = "select * from invoice";
    con.query(sql22,function(err,result){
      if(err){
        console.log(err);
      }
      else{
        invoices = result;
        res.render("admcustchange",{customers:customers,admins:admins, ans:ans,invoices:invoices});
      }
    });
  }
  else if(id.includes("all",0)){
    var ans = id.substring(3);
    admindetails();
    let sql20 = "select * from feedback";
    con.query(sql20,function(err, result){
       if(err){
         console.log(err);
       }
       var feedbacks = result;
       res.render("allfeed",{feedbacks:feedbacks, admins:admins, ans:ans});
     });
  }
  else if(id.includes("checkout",0)){
    var ans =id.substring(8);
    var sql25 = "select * from customer where mobile_no="+"\""+ans+"\"";
    con.query(sql25,function(err,result){
      if(err){
        console.log(err);
      }
      else{
        invoicedetails();
        var customer = result[0];
        res.render("checkout",{customer:customer, invoices:invoices});
      }
    });
  }
  else if(id.includes("read",0)){
    var ans = id.substring(4);
    var val = Number(ans);
    let sql27 = "select * from feedback where feedback_id = "+ val;
    con.query(sql27, function(err, result){
      if(err){
        console.log(err);
      }
      else{
        var feedback = result[0];
        res.render("readfeed",{feedback:feedback});
      }
    })
  }
  else if(id.includes("deletefd",0)){
    var ans = id.substring(8);
    var val = Number(ans);
    let sql26 = "delete from feedback where feedback_id = "+ val;
    con.query(sql26,function(err,result){
      if(err){
        console.log(err);
      }
      else{
        admindetails();
        let sql20 = "select * from feedback";
        con.query(sql20,function(err, result){
           if(err){
             console.log(err);
           }
           var feedbacks = result;
           res.render("allfeed",{feedbacks:feedbacks, admins:admins, ans:ans});
         });
      }
    });
  }
});

app.listen(3000,function(){
  console.log("Server is running on port 3000");
});
