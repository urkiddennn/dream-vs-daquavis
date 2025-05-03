const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory

// MongoDB Connection
mongoose.connect('mongodb+srv://richardbanguiz:OgRpNAJefZwULKmv@cluster0.o8fr6pu.mongodb.net/voting?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Vote Schema
const voteSchema = new mongoose.Schema({
    candidate: { type: String, enum: ['Dream', 'Daquavis'], required: true },
});
const Vote = mongoose.model('Vote', voteSchema);

// Comment Schema
const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const Comment = mongoose.model('Comment', commentSchema);

// Routes
app.get('/api/votes', async (req, res) => {
    try {
        const dreamVotes = await Vote.countDocuments({ candidate: 'Dream' });
        const daquavisVotes = await Vote.countDocuments({ candidate: 'Daquavis' });
        const totalVotes = dreamVotes + daquavisVotes;
        const dreamPercentage = totalVotes ? ((dreamVotes / totalVotes) * 100).toFixed(2) : 0;
        const daquavisPercentage = totalVotes ? ((daquavisVotes / totalVotes) * 100).toFixed(2) : 0;
        res.json({ dreamVotes, daquavisVotes, dreamPercentage, daquavisPercentage });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/vote', async (req, res) => {
    const { candidate } = req.body;
    if (!['Dream', 'Daquavis'].includes(candidate)) {
        return res.status(400).json({ error: 'Invalid candidate' });
    }
    try {
        await Vote.create({ candidate });
        res.status(201).json({ message: 'Vote recorded' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/comments', async (req, res) => {
    try {
        const comments = await Comment.find().sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/comments', async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Comment cannot be empty' });
    }
    try {
        const comment = await Comment.create({ text });
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
