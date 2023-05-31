const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mjja2r0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        /*----------------------
            All Collection here
        -----------------------*/
        const usersCollection = client.db("bistroDB").collection("users");
        const menuCollection = client.db("bistroDB").collection("menu");
        const reviewsCollection = client.db("bistroDB").collection("reviews");
        const cartCollection = client.db("bistroDB").collection("carts");

        /*----------------------
            Users Collection apis
        -----------------------*/

        // get all users from db
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })


        // Create users and save to the db
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);
            // console.log('existing user', existingUser);
            if (existingUser) {
                return res.send({ message: 'User already exits' });
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })


        /*----------------------
            Menu Collection apis
        -----------------------*/
        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result);
        })

        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        })


        /*----------------------
              Cart collection apis
            ---------------------*/
        // get cart data from db
        app.get('/carts', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                res.send([]);
            }
            const query = { email: email };
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        })

        // post cart from client side to mongodb
        app.post('/carts', async (req, res) => {
            const item = req.body;
            // console.log(item);
            const result = await cartCollection.insertOne(item);
            res.send(result);
        })

        // delete an item from carts
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Boss is running!!');
})

app.listen(port, () => {
    console.log(`Bistro Boss is running on port: ${port}`);
})