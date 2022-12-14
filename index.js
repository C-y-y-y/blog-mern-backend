import express from 'express';
import mongoose from "mongoose";
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';

import { registrationValid, loginValid, postCreateValid } from "./validations.js";
import { UserController, PostController } from './controllers/index.js';
import { checkAuth, validationErrors } from './utils/index.js';

mongoose
    .connect(process.env.MONGODB_URI || 'mongodb+srv://Cyy:Merntest123@cluster0.sqqixkc.mongodb.net/blog?retryWrites=true&w=majority')
    .then(() => console.log('DB connected'))
    .catch((err) => console.log('DB error', err))

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync('data-images')) {
            fs.mkdirSync('data-images')
        }
        cb(null, 'data-images')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
        cb(null, `${(new Date()).toISOString()}-${file.originalname}`)
    },
})

const upload = multer({ storage })

app.use(express.json())
app.use(cors())
app.use('/data-images', express.static('data-images'))

app.post('/auth/login', loginValid, validationErrors, UserController.login)
app.post('/auth/registration', registrationValid, validationErrors, UserController.registration)
app.get('/auth/profile', checkAuth, UserController.getProfile)

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/data-images/${req.file.originalname}`
    })
})

app.get('/posts', PostController.getAll)
app.get('/posts/tags', PostController.getLastTags)
app.get('/posts/:id', PostController.getOne)
app.post('/posts', checkAuth, postCreateValid, validationErrors, PostController.create)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth, postCreateValid, validationErrors, PostController.update)


app.listen(process.env.PORT || 4000, (err) => {
    if (err) {
        return console.log(err)
    }

    console.log('Server on')
})