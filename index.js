const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9czch.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        console.log("⏳ Connecting to MongoDB...");
        await client.connect();
        console.log("✅ MongoDB Connected Successfully!");

        const artcraftCollection = client.db('artCraftDB').collection('artCraft');

        // POST Route: Add new artCraft item
        app.post('/artCraft', async (req, res) => {
            try {
                const newItem = req.body;
                const result = await artcraftCollection.insertOne(newItem);
                res.status(201).json(result);
            } catch (err) {
                console.error("❌ Error in POST /artCraft:", err.message);
                res.status(500).json({ error: 'Failed to add item', details: err.message });
            }
        });

        // GET Route: Fetch all artCraft items
        app.get('/artCraft', async (req, res) => {
            try {
                console.log("🟢 Fetching all artCraft items...");
                const result = await artcraftCollection.find().toArray();
                console.log("✅ Data fetched successfully!");
                res.status(200).json(result);
            } catch (err) {
                console.error("❌ Error in GET /artCraft:", err.message);
                res.status(500).json({ error: 'Failed to fetch items', details: err.message });
            }
        });

        // GET Route: Fetch a specific artCraft item by ID
        app.get('/artCraft/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const item = await artcraftCollection.findOne({ _id: new ObjectId(id) });
                if (!item) {
                    return res.status(404).json({ message: 'Item not found' });
                }
                res.status(200).json(item);
            } catch (err) {
                console.error("❌ Error in GET /artCraft/:id:", err.message);
                res.status(500).json({ error: 'Error fetching item', details: err.message });
            }
        });

        // PUT Route: Update an artCraft item by ID
        app.put('/artCraft/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const updatedItem = req.body;
                const updateDoc = { $set: updatedItem };
                const result = await artcraftCollection.updateOne(filter, updateDoc);
                res.status(200).json(result);
            } catch (err) {
                console.error("❌ Error in PUT /artCraft/:id:", err.message);
                res.status(500).json({ error: 'Failed to update item', details: err.message });
            }
        });

        // DELETE Route: Delete an artCraft item by ID
        app.delete('/artCraft/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await artcraftCollection.deleteOne(query);
                res.status(200).json(result);
            } catch (err) {
                console.error("❌ Error in DELETE /artCraft/:id:", err.message);
                res.status(500).json({ error: 'Failed to delete item', details: err.message });
            }
        });

    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err);
    }
}

// Root Route
app.get('/', (req, res) => {
    res.send('ArtCraft making server is running');
});

run().catch(console.dir);

module.exports = app;  // Ensure export for Vercel to recognize the app
