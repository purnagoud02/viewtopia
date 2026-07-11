const express = require("express");
const { body, validationResult } = require("express-validator");
const protect = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const {
  addMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

const validateMovie = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.post(
  "/",
  protect,
  adminMiddleware,
  [
    body("title").trim().isLength({ min: 2 }).withMessage("Title is required"),
    body("description").optional().trim().isLength({ max: 2000 }),
  ],
  validateMovie,
  addMovie
);
router.get("/", getMovies);
router.get("/:id", getMovieById);
router.put("/:id", protect, adminMiddleware, updateMovie);
router.delete("/:id", protect, adminMiddleware, deleteMovie);

module.exports = router;