const express = require('express')
const path = require('path')
const config = require('config')
const mysql = require("mysql");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');

dotenv.config({ path: './.env'})


const app = express();
const PORT = config.get('port') || 5000

const db = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user:  process.env.DATABASE_USER,
        database:  process.env.DATABASE,
        password: process.env.DATABASE_PASSWORD 
})

const publicDirectory = path.join(__dirname, './public' )
app.use(express.static(publicDirectory))

app.use(express.urlencoded({ extended:false }))
app.use(express.json());

app.use(cookieParser());


app.set('view engine', 'hbs');


db.connect( (err) =>{
        if(err){console.log(err)}
        else{ console.log("connected to database")}
}
)



app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'))



app.listen(PORT, () => console.log(`App has been started on port ${PORT}`))


