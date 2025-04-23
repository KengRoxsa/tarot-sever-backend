const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGIN.split(','),  // แปลงค่าจาก .env ให้เป็น array ของโดเมน
};

app.use(express.json());
app.use(cors(corsOptions));

const port = process.env.PORT || 8080;
const getCommentsData = () => {
  const filePath = path.join(__dirname, 'server', 'Post.json');
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
};
const getCardsData = () => {
  const filePath = path.join(__dirname, 'server', 'cards.json');
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
};

app.get("/api/v1/comments", (req, res) => {
  try {
    const comments = getCommentsData();
    const sortedComments = comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ comments: sortedComments });
  } catch (error) {
    res.status(500).json({ message: "Error reading the comments data." });
  }
});

app.post("/api/v1/comments", (req, res) => {
  const { name, comment } = req.body;

  if (!name || !comment) {
    return res.status(400).json({ message: "ชื่อและคอมเมนต์ต้องไม่ว่าง" });
  }

  const filePath = path.join(__dirname, "server", "Post.json");

  let comments = [];
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath);
    comments = JSON.parse(rawData);
  }

  const newComment = {
    name,
    comment,
    timestamp: new Date().toISOString(),
  };
  comments.push(newComment);

  try {
    fs.writeFileSync(filePath, JSON.stringify(comments, null, 2), "utf8");
    res.status(200).json({ message: "บันทึกความคิดเห็นสำเร็จ", success: true });
  } catch (err) {
    console.error("❌ เขียนไฟล์ผิดพลาด:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
  }
});

app.get("/api/v1/cards", (req, res) => {
  try {
    const tarotCards = getCardsData();
    res.json({ cards: tarotCards });
  } catch (error) {
    res.status(500).json({ message: "Error reading the cards data." });
  }
});

app.post("/api/v1/cards/random", (req, res) => {
  try {
    const tarotCards = getCardsData();

    if (!tarotCards || tarotCards.length === 0) {
      return res.status(400).json({ message: "No cards available." });
    }

    const randomCard = tarotCards[Math.floor(Math.random() * tarotCards.length)];
    res.json({ card: randomCard });
  } catch (error) {
    res.status(500).json({ message: "Error processing the request." });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
