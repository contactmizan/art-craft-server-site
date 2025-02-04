const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI & Client setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9czch.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect to MongoDB and handle routes
async function run() {
    try {
        // Connect to MongoDB server
        await client.connect();
        const artcraftCollection = client.db('artCraftDB').collection('artCraft');

        // POST Route: Add new artCraft item
        app.post('/artCraft', async (req, res) => {
            const newItem = req.body;
            try {
                const result = await artcraftCollection.insertOne(newItem);
                res.status(200).send(result);
            } catch (err) {
                res.status(500).send('Failed to add item');
            }
        });

        // GET Route: Fetch all artCraft items
        app.get('/artCraft', async (req, res) => {
            try {
                const cursor = artcraftCollection.find();
                const result = await cursor.toArray();
                res.status(200).send(result);
            } catch (err) {
                res.status(500).send('Failed to fetch items');
            }
        });

        // GET Route: Fetch a specific artCraft item by ID
        app.get('/artCraft/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const item = await artcraftCollection.findOne({ _id: new ObjectId(id) });
                if (item) {
                    res.status(200).send(item);
                } else {
                    res.status(404).send({ message: 'Item not found' });
                }
            } catch (err) {
                res.status(500).send('Error fetching item');
            }
        });

        // PUT Route: Update an artCraft item by ID
        app.get('/artCraft/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const artCraftCollection = client.db('artCraftDB').collection('artCraft');
                const item = await artCraftCollection.findOne({ _id: new ObjectId(id) });

                if (item) {
                    res.status(200).json(item);
                } else {
                    res.status(404).json({ message: "Item not found" });
                }
            } catch (error) {
                res.status(500).json({ message: "Error fetching item", error });
            }
        });

        // DELETE Route: Delete an artCraft item by ID
        app.delete('/artCraft/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await artcraftCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm the connection to MongoDB
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}

// Start server
app.listen(port, () => {
    console.log(`Art & Craft server is running on port: ${port}`);
});

run().catch(console.dir);
