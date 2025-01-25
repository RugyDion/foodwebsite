const User = require("../../models/User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const handleLogin = async (req, res) => {

    const { state, password } = req.body

    if (!state && !password)
        return res.status(400).json({ message: "All fields are required" })

    try {

        const user = await User.findOne({
            $or: [
                { name: state },
                { email: state }
            ]
        })

        if (!user)
            return res.status(400).json({ message: "Incorrect details or password" })

        const match = await bcrypt.compare(password, user.password);

        const cookies = req.cookies
        const alreadyRefreshToken = cookies?.food_website_token

        if (!match)
            return res.status(400).json({ message: "Incorrect details or password" });

        if (alreadyRefreshToken) {
            res.clearCookie('food_website_token', {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            });
        }

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    name: user.name,
                    email: user.email
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )

        const refreshToken = jwt.sign(
            { name: user.name },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '70d' }
        )


        const userResponse = {
            accessToken,
            name: user.name,
            email: user.email,
            _id: user._id
        }

        res.cookie('food_website_token', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 70 * 24 * 60 * 60 * 1000
        });


        await User.updateOne(
            { _id: user._id },
            {
                $push: { refreshTokens: refreshToken },
                $set: { lastLogin: Date.now() }
            }
        );


        res.status(200).json(userResponse)

    } catch (error) {
        res.status(500).json({
            message: "Failed to login",
            error: error.message
        })
    }
}

const handleRefreshToken = async (req, res) => {

    const cookies = req.cookies;
    if (!cookies?.food_website_token)
        return res.sendStatus(401);

    try {

        const refreshToken = cookies.food_website_token;

        const user = await User.findOne({ refreshTokens: { $in: [refreshToken] } }).lean().exec();

        if (!user)
            return res.sendStatus(400)

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

        if (user.name !== decoded.name)
            return res.sendStatus(403);

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    name: user.name,
                    email: user.email
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )

        const userResponse = {
            accessToken,
            name: user.name,
            email: user.email,
            _id: user._id
        }

        res.status(200).json(userResponse)

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }
}

const handleLogout = async (req, res) => {

    const cookies = req.cookies;

    if (!cookies?.food_website_token)
        return res.sendStatus(204);

    try {

        const refreshToken = cookies?.food_website_token;

        const user = await User.findOne({ refreshTokens: { $in: [refreshToken] } });

        if (!user) {
            res.clearCookie('food_website_token', {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            });
            return res.sendStatus(204);
        }

        await User.updateOne(
            { _id: user._id },
            { $pull: { refreshTokens: refreshToken } }
        );

        res.clearCookie('food_website_token', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        res.sendStatus(204);

    } catch (error) {
        res.status(500).json({
            message: "Failed to logout",
            error: error.message
        })
    }
}

module.exports = { handleLogin, handleRefreshToken, handleLogout }