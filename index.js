require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user');
const Exercise = require('./models/exercise');

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ✅ Welcome Route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// ✅ Create User
app.post('/api/users', async (req, res) => {
  const user = new User({ username: req.body.username });
  await user.save();
  res.json({ username: user.username, _id: user._id });
});

// ✅ Get All Users
app.get('/api/users', async (req, res) => {
  const users = await User.find({}, 'username _id');
  res.json(users);
});

// ✅ Add Exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const user = await User.findById(req.params._id);
  if (!user) return res.status(404).send('User not found');

  const newExercise = new Exercise({
    userId: user._id,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date()
  });
  await newExercise.save();

  res.json({
    _id: user._id,
    username: user.username,
    date: newExercise.date.toDateString(),
    duration: newExercise.duration,
    description: newExercise.description
  });
});

// ✅ Get Exercise Logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;
  const user = await User.findById(req.params._id);
  if (!user) return res.status(404).send('User not found');

  let filter = { userId: user._id };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  let exercises = Exercise.find(filter).select('description duration date');
  if (limit) exercises = exercises.limit(Number(limit));

  const log = (await exercises).map(ex => ({
    description: ex.description,
    duration: ex.duration,
    date: ex.date.toDateString()
  }));

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
