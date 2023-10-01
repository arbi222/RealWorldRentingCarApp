require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
var multer = require('multer');
var fs = require('fs');
const cron = require("cron");
const https = require("https");


const app = express();

app.set("view engine" , 'ejs');
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "My secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const databasePass = process.env.PASSWORD;
mongoose.connect('mongodb+srv://admin-arbi:' + databasePass + '@cluster0.bba81.mongodb.net/CarsDb', {useNewUrlParser: true});


const userSchema = new mongoose.Schema ({
  username: String,
  password: {type: String , minlength: 6},
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User" , userSchema);

passport.use(User.createStrategy());

// serializing user loging in and out
passport.serializeUser(function(user , done){
  done(null , user.id);
});
passport.deserializeUser(function(id, done){
    User.findById(id , function(err ,user){
        done(err , user);
    });
});


const VisitorSchema = new mongoose.Schema ({
  _id: String,
  mobile: String,
  instagram: String,
  facebook: String,
  tiktok: String,
  email: String,
  bio: String,
});

const Visitor = new mongoose.model("Visitor" , VisitorSchema);


const CarSchema = new mongoose.Schema ({
  name: String,
  price: Number,
  pricetype: String,
  picture: String,
  images: [],
  year: Number,
  fuel: String,
  gear: String,
  passengers: Number,
  doors: Number,
  engine: Number,
});

const Car = new mongoose.model("Cars" , CarSchema);


const storage = multer.diskStorage({

  destination: function(req, file , callback){
    callback(null , "./public/uploads");
  },

  filename: function(req , file , callback){
    callback(null, Date.now() + file.originalname)
  }

});

const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024*1024*3,
  },
})

app.get("/", function(req,res){

  const title = "Athlautorent | Home";

  Car.find(function(err, foundedCars){
    res.render("home" , {title: title, user: req.user, cars: foundedCars});
  })

})

app.get("/contact", function(req,res){

  const title = "Athlautorent | Contact";

  Visitor.find(function(err, foundedInfo){
      res.render("contact" , {title: title, user: req.user, visitor: foundedInfo});
  })

})

app.get("/profile", function(req,res){

  if (req.isAuthenticated()){
    const title = "Athlautorent | Profile";

    Visitor.find(function(err, foundedInfo){
      res.render("profile" , {title: title, user: req.user, visitor: foundedInfo});
    })
  }
  else{
    res.redirect("/")
  }

})

app.post("/profile", function(req,res){

  if (req.isAuthenticated()){

    // const visitor = new Visitor({
    //    _id: req.user.id,
    //    mobile: req.body.number,
    //    email: req.body.email,
    //    facebook: req.body.facebook,
    //    instagram: req.body.instagram,
    //    tiktok: req.body.tiktok,
    //    bio: req.body.bio
    // })

    // visitor.save();
    
    Visitor.findByIdAndUpdate({_id: req.user.id}, {
      mobile: req.body.number,
      email: req.body.email,
      facebook: req.body.facebook,
      instagram: req.body.instagram,
      tiktok: req.body.tiktok,
      bio: req.body.bio} , function(err){
        if (err){
          console.log(err);
        }
      })
 
    User.findByIdAndUpdate({_id: req.user._id}, {
        username: req.body.username,
        } , function(err){
          if (err){
            console.log(err);
          }
          else{
            res.redirect("/");
          }
        })
  }
  else{
    res.redirect("/")
  }
})

app.get("/addcars", function(req,res){

  if (req.isAuthenticated()){
        const title = "Athlautorent | Add Cars";

        res.render("addcars" , {title: title, user: req.user});
      }  
  else{
    res.redirect("/")
  }
})

app.post("/addcars", upload.single("picture"), function(req,res){

  if (req.isAuthenticated()){
    
        const car = new Car({
          name: req.body.carname,
          price: req.body.price,
          pricetype: req.body.pricetype,
          picture: req.file.filename,
          year: req.body.year,
          fuel: req.body.fuel,
          gear: req.body.gear,
          passengers: req.body.passengers,
          doors: req.body.doors,
          engine: req.body.engine
        });

        car.save();
        res.redirect("/")
  }
  else{
    res.redirect("/")
  }
})

app.get("/carinfo:carId", function(req, res){
    
    Car.findById({_id: req.params.carId}, function(err, foundedCar){
      if (err){
        console.log(err);
      }
      else{
        const title = "Athlautorent | " + foundedCar.name.charAt(0).toUpperCase() + foundedCar.name.slice(1);
        res.render("carinfo" , {title: title, user: req.user, car: foundedCar})
      }
    })
  
})

app.post("/carinfo:carId", upload.array("images", 3) , function(req, res){
 
    if (req.isAuthenticated()){

      Car.findById({_id: req.params.carId}, function(err, foundedCar){
        
        req.files.map(function(file){
          foundedCar.images.push(file.filename);
        });
        foundedCar.save();
        
        res.redirect("/carinfo" + req.params.carId)
      })
    }
    else{
      res.redirect("/")
    }
})

app.post("/deletePhoto", function(req, res){

  if (req.isAuthenticated()){

    Car.findByIdAndUpdate({_id: req.body.deletePic}, 
        {$pull: {images: req.body.photoName}}, function(err){
          if (err){
            console.log(err);
          }
          else{
            fs.rmSync("public/uploads/" + req.body.photoName, {force: true});
            res.redirect("/carinfo" + req.body.deletePic);
          }
    })
      }
      else{
        res.redirect("/")
      }
});

app.post("/deletecar", function(req,res){
    
  if (req.isAuthenticated()){
      
    Car.findById({_id: req.body.delete}, function(err, foundedCar){
      if (err){
        console.log(err);
      }
      else{
        for (var i = 0; i < foundedCar.images.length; i++){
          fs.rmSync("public/uploads/" + foundedCar.images[i], {force: true});
        }
      }
    })

    Car.deleteOne({_id: req.body.delete}, function(err){
        if(err){
          console.log(err);
        }
        else{
          fs.rmSync("public/uploads" + req.body.pictureName, {force: true});
          res.redirect("/")
        }
    })
  }
  else{
    res.redirect("/")
  }
})

app.get("/editcar:carId", function(req,res){
    if (req.isAuthenticated()){
      const title = "Athlautorent | Edit Car";

      Car.findById({_id: req.params.carId}, function(err, foundedCar){
          if (err){
            console.log(err);
          }
          else{
            res.render("editcars" , {title: title, user: req.user, car: foundedCar})
          }
      })
    }
    else{
      res.redirect("/")
    }
})

app.post("/editcar:carId", function(req,res){
    
  if (req.isAuthenticated()){
      Car.findByIdAndUpdate({_id: req.params.carId}, {
        name: req.body.carname,
        price: req.body.price,
        pricetype: req.body.pricetype,
        year: req.body.year,
        fuel: req.body.fuel,
        gear: req.body.gear,
        passengers: req.body.passengers,
        doors: req.body.doors,
        engine: req.body.engine }, function(err){
          if (err){
            console.log(err);
          }
          else{
            res.redirect("/")
          }
        })
  }
  else{
    res.redirect("/")
  }
})

app.get("/passchanger", function(req,res){

  if (req.isAuthenticated()){
    const title = "Athlautorent | Change Password";

    res.render("passChanger" , {title: title, user: req.user});
  }
  else{
    res.redirect("/")
  }
})

app.post("/passchanger", function(req,res){

  if (req.isAuthenticated()){
    
    if (req.body.new === req.body.confirm){
      User.findById({_id: req.user._id}, function(err, user){
        if (err){
          console.log(err);
        }
        else{
          user.changePassword(req.body.old, req.body.new, function(err){
            if (err){
              console.log(err);
            }
            else{
              res.redirect("/");
            }
          })
        }
      })
    }
  }
  else{
    res.redirect("/")
  }
})

app.get("/login", function(req, res){

  if (req.isAuthenticated()){
      res.redirect('/');
  }
  else{
    const title = "Athlautorent | Login";
    res.render("login" , {title: title});
  }
});

app.post("/login", function(req, res){

  const user = new User ({
     username: req.body.username,
     password: req.body.password
  });

  req.login(user, function(err){
      if (err){
        console.log(err);
      }
      else{
        passport.authenticate("local" , {failureRedirect: "/login"})(req ,res , function(){
            res.redirect("/");
        })
      }
    })
    //   User.register({
    //     username: req.body.username,
    //     }, req.body.password, function(err, user){
    //       if (err){
    //         console.log(err);
    //         res.redirect("/login");
    //       }
    //       else{
    //         passport.authenticate("local")(req, res , function(){
    //           res.redirect("/");
    //       });
    //     }
    // });
})

app.get("/logout" , function(req ,res){
  req.logout(function(err){
      if (err){
        return next(err);
      }
      else{
        res.redirect('/');
      }
  });
});

app.get("*", function(req,res){
  res.redirect("/");
})

const backendUrl = "https://athlautorent.onrender.com";
const job = new cron.CronJob('*/8 * * * *', function(){
  https.get(backendUrl, (res) => {
    if (res.statusCode === 200){
      console.log("server restarted")
    }
  }).on("error", (err) => {
      console.log("error");
  })
})
job.start();

const port = 3000;
app.listen(process.env.PORT || port, function(){
    console.log("Server is running successfully !");
});
