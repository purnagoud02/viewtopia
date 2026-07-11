const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getDashboardOverview,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReports,
  createReport,
  updateReport,
  deleteReport,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getAllLogs,
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  getAllTVShows,
  createTVShow,
  updateTVShow,
  deleteTVShow,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/adminController");

router.use(protect, adminMiddleware);

router.get("/overview", getDashboardOverview);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/subscriptions", getAllSubscriptions);
router.post("/subscriptions", createSubscription);
router.put("/subscriptions/:id", updateSubscription);
router.delete("/subscriptions/:id", deleteSubscription);

router.get("/reviews", getAllReviews);
router.post("/reviews", createReview);
router.put("/reviews/:id", updateReview);
router.delete("/reviews/:id", deleteReview);

router.get("/reports", getAllReports);
router.post("/reports", createReport);
router.put("/reports/:id", updateReport);
router.delete("/reports/:id", deleteReport);

router.get("/banners", getAllBanners);
router.post("/banners", createBanner);
router.put("/banners/:id", updateBanner);
router.delete("/banners/:id", deleteBanner);

router.get("/logs", getAllLogs);
router.get("/notifications", getAllNotifications);
router.post("/notifications", createNotification);
router.put("/notifications/:id", updateNotification);
router.delete("/notifications/:id", deleteNotification);
router.get("/tvshows", getAllTVShows);
router.post("/tvshows", createTVShow);
router.put("/tvshows/:id", updateTVShow);
router.delete("/tvshows/:id", deleteTVShow);

router.get("/categories", getAllCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

module.exports = router;
