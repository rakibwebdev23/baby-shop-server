const express = require("express");
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.712mjau.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
      
    const productsCollection = client.db("babyShopDB").collection("products");
    const usersCollection = client.db("babyShopDB").collection("users");
    const cartsCollection = client.db("babyShopDB").collection("carts");
    const paymentsCollection = client.db("babyShopDB").collection("payments");
    const contactCollection = client.db("babyShopDB").collection("contact");

    // User related endpoints
      app.post('/users', async (req, res) => {
        const user = req.body;
        const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);
        if (existingUser) {
          return res.send ({message: "User Already exist", insertedId: null});
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
      });
    
      //   products endPoints
      app.get("/products", async (req, res) => {
          const result = await productsCollection.find().toArray();
          res.send(result);
      });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });
    
    // Carts endpoints
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    })

    app.post("/carts", async (req, res) => {
      const item = req.body;
      const result = await cartsCollection.insertOne(item);
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    });

    // contact endpoint
    app.post("/contact", async (req, res) => { 
      const message = req.body;
      const result = await contactCollection.insertOne(message);
      res.send(result);
    });

    // payment related endpoint 
    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentsCollection.insertOne(payment);
      const query = {
        _id: {
            $in: payment.cartId.map(id => new ObjectId(id))
        }
    }
      const deleteResult = await cartsCollection.deleteMany(query);
      res.send({ paymentResult, deleteResult });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Baby shop server");
});

app.listen(port, () => {
    console.log(`Baby shop server running at: ${port}`);
})