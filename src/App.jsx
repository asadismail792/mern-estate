const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/assignmentDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const Assignment = mongoose.model('Assignment', {
  title: String,
  description: String,
  dueDate: Date,
  createdBy: String
});

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_password'
  }
});

// Routes
app.post('/assignments', async (req, res) => {
  try {
    const { title, description, dueDate, createdBy } = req.body;

    // Create assignment in MongoDB
    const assignment = new Assignment({
      title,
      description,
      dueDate,
      createdBy
    });
    await assignment.save();

    // Send confirmation email
    const mailOptions = {
      from: 'your_email@gmail.com',
      to: 'recipient_email@example.com',
      subject: 'Assignment Added Confirmation',
      text: `Assignment ${title} has been added successfully.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(201).send('Assignment added successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding assignment.');
  }
});

app.get('/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving assignment.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
