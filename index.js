const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
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

// Connect to MongoDB and define routes
async function run() {
    try {
        // Connect to MongoDB server
        await client.connect(); // Ensure connection before defining routes
        
        const artcraftCollection = client.db('artCraftDB').collection('artCraft');

        // POST Route: Add new artCraft item
        app.post('/artCraft', async (req, res) => {
            try {
                const newItem = req.body;
                const result = await artcraftCollection.insertOne(newItem);
                res.status(201).json(result);
            } catch (err) {
                res.status(500).json({ error: 'Failed to add item', details: err.message });
            }
        });

        // GET Route: Fetch all artCraft items
        app.get('/artCraft', async (req, res) => {
            try {
                const result = await artcraftCollection.find().toArray();
                res.status(200).json(result);
            } catch (err) {
                res.status(500).json({ error: 'Failed to fetch items', details: err.message });
            }
        });

        // GET Route: Fetch a specific artCraft item by ID
        app.get('/artCraft/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const item = await artcraftCollection.findOne({ _id: new ObjectId(id) });
                if (!item) {
                    return res.status(404).json({ message: 'Item not found' });
                }
                res.status(200).json(item);
            } catch (err) {
                res.status(500).json({ error: 'Error fetching item', details: err.message });
            }
        });

        // PUT Route: Update an artCraft item by ID
        app.put('/artCraft/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const updatedItem = req.body;

                const updateDoc = {
                    $set: {
                        photo: updatedItem.photo,
                        item: updatedItem.item,
                        subcategory: updatedItem.subcategory,
                        description: updatedItem.description,
                        price: updatedItem.price,
                        rating: updatedItem.rating,
                        customization: updatedItem.customization,
                        processTime: updatedItem.processTime,
                        stock: updatedItem.stock,
                        email: updatedItem.email,
                        name: updatedItem.name
                    }
                };

                const options = { upsert: true };
                const result = await artcraftCollection.updateOne(filter, updateDoc, options);
                res.status(200).json(result);
            } catch (err) {
                res.status(500).json({ error: 'Failed to update item', details: err.message });
            }
        });

        // DELETE Route: Delete an artCraft item by ID
        app.delete('/artCraft/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await artcraftCollection.deleteOne(query);
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Item not found' });
                }
                res.status(200).json(result);
            } catch (err) {
                res.status(500).json({ error: 'Failed to delete item', details: err.message });
            }
        });

        console.log("Connected to MongoDB successfully!");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}

// Root route
app.get('/', (req, res) => {
    res.send('ArtCraft making server is running');
});

// Start server
app.listen(port, () => {
    console.log(`Art & Craft server is running on port: ${port}`);
});

// Ensure MongoDB connection is established
run().catch(console.dir);
