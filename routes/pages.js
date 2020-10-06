const express = require('express')
const mysql = require("mysql");
const jwt = require('jsonwebtoken')




const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user:  process.env.DATABASE_USER,
    database:  process.env.DATABASE,
    password: process.env.DATABASE_PASSWORD 
})


db.connect( (err) =>{
    if(err){console.log(err)}
}
)
const router = express.Router();

router.get('/index', authenticateToken, (req, res) =>{

    db.query("SELECT * FROM user", function(err, results) {
        
      if(err) return console.log(err);
      
      res.render("index.hbs", {
        user: results
      });
   
    })
})
function authenticateToken( req, res, next){
    const authHeader = req.headers.cookie
    const token = authHeader && authHeader.split('=')[1]
    if (token == null) return res.redirect('login')
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
       
      console.log(err)
      if (err) return res.sendStatus(403)
      req.user = user
      next()
    })
}

router.get('/register', (req, res) =>{
    res.render('register')
})
router.get('/login', (req, res) =>{
    res.render('login')
})
router.get('/logout', (req, res) =>{
    function eraseCookieFromAllPaths(name) {
      
        
        res.cookie('jwt', "", { expires: new Date() });
    }
    eraseCookieFromAllPaths('jwt')
    res.render('login')
})
module.exports = router;
