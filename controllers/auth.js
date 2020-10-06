const mysql = require("mysql");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE,
    password: process.env.DATABASE_PASSWORD
})


exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;
        if (!login || !password) {
            return res.status(400).render('login', {
                message: 'Please provide login and password'
            })

        }
        db.query('SELECT * FROM user WHERE login = ?', [login], async (error, results) => {
           
            if (!results || !(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', {
                    message: 'Login or password is incorrect'
                })
            } else {
                const id = results[0].id;

                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                })


                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    )
                }
                res.cookie('jwt', token, cookieOptions);
                
                res.status(200).redirect('/index')
               
              
            }
           
        })

    } catch (error) {
        console.log("error", error)
    }
}
exports.register = (req, res) => {



    // чудеса деструктуризации
    // const name = req.body.name;
    // const login = req.body.login;
    // const password = req.body.password;
    // const passwordConfirm = req.body.passwordConfirm;
    const { name, login, password, passwordConfirm } = req.body

    db.query('SELECT login FROM user where login = ?', [login], async (error, results) => {
        if (error) {
            console.log(error)
        }

        if (results.length > 0) {
            return res.render('register', {
                message: 'That login is already used'
            })
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Hey, those passwords is not equals'
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8);
       

        db.query('INSERT into user SET ?', { name: name, login: login, password: hashedPassword }, (error, results) => {
            if (error) {
                console.log(error)
            } else {
                return res.render('register', {
                    message: `User ${name} registered`

                })
            }
        })

        res.status(200).redirect('/index')



    });





}

