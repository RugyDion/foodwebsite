const User = require("../../models/User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const handleRegister = async (req, res) => {

    const { name, email, password } = req.body

    if (!name || !email || !password)
        return res.status(400).json({ message: "All fields are required" })

    try {
        const duplicateName = await User.findOne({ name }).exec()
        const duplicateEmail = await User.findOne({ email }).exec()

        if (duplicateName)
            return res.status(400).json({ message: "Name is already in use" })

        if (duplicateEmail)
            return res.status(400).json({ message: "Email is already registered" })

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        })

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    name: newUser.name,
                    email: newUser.email
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )

        const refreshToken = jwt.sign(
            {
                name: newUser.name
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '70d' }
        )


        newUser.refreshTokens.push(refreshToken)
        await newUser.save();

        res.cookie('food_website_token', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 70 * 24 * 60 * 60 * 1000
        });

        const userResponse = {
            accessToken,
            name: newUser.name,
            email: newUser.email,
            _id: newUser._id
        }

        res.status(200).json(userResponse)

    } catch (error) {
        res.status(500).json({
            message: "Failed to create account!",
            error: error.message
        })
    }

}

module.exports = { handleRegister }