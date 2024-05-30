const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://localhost/multimedia-app', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Define storage for multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Models
const Video = mongoose.model('Video', new mongoose.Schema({
  title: String,
  description: String,
  fileUrl: String,
  likes: { type: Number, default: 0 },
  comments: [{ user: String, comment: String }],
  createdAt: { type: Date, default: Date.now }
}));

// Routes
app.post('/upload', upload.single('video'), async (req, res) => {
  const { title, description } = req.body;
  const fileUrl = `uploads/${req.file.filename}`;
  const newVideo = new Video({ title, description, fileUrl });
  await newVideo.save();
  res.json(newVideo);
});

app.get('/videos', async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
});

app.get('/videos/:id', async (req, res) => {
  const video = await Video.findById(req.params.id);
  res.json(video);
});

app.post('/like/:id', async (req, res) => {
  const video = await Video.findById(req.params.id);
  video.likes += 1;
  await video.save();
  res.json(video);
});

app.post('/comment/:id', async (req, res) => {
  const { user, comment } = req.body;
  const video = await Video.findById(req.params.id);
  video.comments.push({ user, comment });
  await video.save();
  res.json(video);
});

app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
