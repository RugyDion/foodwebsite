require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')

const connectDB = require('./config/dbConnection')
const credentials = require('./middleware/credentials')
const corsOptions = require('./config/corsOptions')

const app = express()

const PORT = process.env.PORT || 3500

connectDB()

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use('/', require('./routes/root'));

app.use(express.json());

app.use('/auth', require('./routes/auth/auth'))
app.use('/register', require('./routes/auth/register'))

mongoose.connection.once('open', () => {
    console.log('Connected to Database successfully');
    app.listen(PORT, () => {
        console.log(`Server running on PORT: ${PORT}`)
    })
})

mongoose.connection.on('error', err => {
    console.log(err)
})