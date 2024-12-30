const port = 3000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { log, error } = require("console");
const { type } = require("os");
const bodyParser = require("body-parser");

const Product = require("./models/Product");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//API Creation

app.get("/", (req, res) => {
    res.send("Express App is Running")
})

// Image Storage Engine


const storage = multer.diskStorage({
    destination: 'upload/images'
})
const upload = multer({ storage })

// Creating Upload Endpoint for images

app.use('/images', express.static('upload/images'))

app.post("/upload", upload.single('product'), (req, res, next) => {
    const file = req.file;
    console.log(req.headers);
    if (!file?.pathname) {
        return res.status(400).json({
            success: 0,
            message: "Please upload a file"
        })
    }
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})

// Add Product
app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else {
        id = 1;
    }

    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success: true,
        name: req.body.name,
    })
})

// Creating APi For deleting Products

app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name,
    })
})

// Creating API for Getting all Products
app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All Product Fetched");
    res.send(products);
})


//Schema Creating for User Model

const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})


//Creating Endpoint for registering the user

app.post('/signup', async (req, res) => {

    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "existing user found with same email address" })
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }


    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token })
})

// creating endpoint for user login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, errors: "Wrong Password" });
        }
    }
    else {
        res.json({ success: false, errors: "Wrong Email Id" })
    }
});

(async () => {
    // Detabase connection with MongoDB 
    const dns = require("node:dns/promises");
    console.log(await dns.getServers());
    await mongoose.connect("mongodb://leodionis182:RGF9l6MzoVnpia1N@cluster0-shard-00-00.jbd9m.mongodb.net:27017,cluster0-shard-00-01.jbd9m.mongodb.net:27017,cluster0-shard-00-02.jbd9m.mongodb.net:27017/e_commerce?ssl=true&replicaSet=atlas-xs34pd-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0");

    app.listen(port, (error) => {
        if (!error) {
            console.log("Server Running on Port " + port)
        }
        else {
            console.log("Error : " + error)
        }
    })
})();