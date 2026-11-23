import express from "express";
import {User} from "../models/user.model.js"
import jwt from 'jsonwebtoken'
import { createHmac, randomBytes } from "node:crypto";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.patch('/', ensureAuthenticated, async(req, res) => {
    const {name} = req.body;
    await User.findByIdAndUpdate(req.user._id, {
        name,
    })

    return res.json({status: "success"})
})

router.post('/signup', async(req, res) =>{
    const {name, email, password} = req.body;
    const exixtingUser = await User.findOne({
        email
    })
    if(exixtingUser) {
        return res.status(400).json({error: `User with email ${email} already exixts`})
    }

    const salt = randomBytes(256).toString('hex');
    const hashedPassword = createHmac('sha256', salt).update(password).digest('hex');

    const user = await User.insertOne({
        name,
        email,
        password: hashedPassword,
        salt
    })

    return res.status(201).json({status: "success", data: {id: user._id}})
})

router.post('/login', async(req, res) => {
    const {email, password} = req.body;
    const exixtingUser = await User.findOne({
        email
    })

    if(!exixtingUser) {
        return res.status(400).json({error: `User with email ${email} does not exixts`})
    }

    const salt = exixtingUser.salt;
    const hashedPassword = exixtingUser.password;
    const newHashedPassword = createHmac('sha256', salt).update(password).digest('hex');
    if(hashedPassword !== newHashedPassword) {
        return res.status(400).json({error: `Invalid Password`})
    }
    const payload = {
        name: exixtingUser.name,
        _id: exixtingUser._id,
        email: exixtingUser.email,
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return res.json({status: "success", token})
})

export default router;