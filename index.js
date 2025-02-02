const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); // Import ObjectId

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9czch.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log("MongoDB URI:", uri);

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");

        // Database and Collection
        const artcraftCollection = client.db('artCraftDB').collection('artCraft');

        //  API to Add a New Item
        app.post('/artCraft', async (req, res) => {
            const newItem = req.body;
            console.log("Adding new item:", newItem);
            try {
                const result = await artcraftCollection.insertOne(newItem);
                res.send(result);
            } catch (error) {
                console.error("Error inserting item:", error);
                res.status(500).send({ error: "Internal Server Error" });
            }
        });

        //  API to Get All Items
        app.get('/artCraft', async (req, res) => {
            try {
                const cursor = artcraftCollection.find();
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error("Error fetching items:", error);
                res.status(500).send({ error: "Internal Server Error" });
            }
        });

        //  API to Get a Single Item by ID
        app.get('/artCraft/:id', async (req, res) => {
            const id = req.params.id;
            console.log("Fetching item with ID:", id);

            try {
                const query = { _id: new ObjectId(id) }; // Convert ID to ObjectId
                const item = await artcraftCollection.findOne(query);

                if (!item) {
                    return res.status(404).send({ error: "Item not found" });
                }

                res.send(item);
            } catch (error) {
                console.error("Error fetching item:", error);
                res.status(500).send({ error: "Internal Server Error" });
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

run().catch(console.dir);

// ✅ Test Route to Check if Server is Running
app.get('/', (req, res) => {
    res.send('Art & Craft server is running');
});

// ✅ Start the Server
app.listen(port, () => {
    console.log(`Art & Craft server is running on port: ${port}`);
});
