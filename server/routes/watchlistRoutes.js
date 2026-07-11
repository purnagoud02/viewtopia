const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} = require("../controllers/watchlistController");

router.post("/", protect, addToWatchlist);
router.get("/:userId", protect, getWatchlist);
router.delete("/:id", protect, removeFromWatchlist);

module.exports = router;