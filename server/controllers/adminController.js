const User = require("../models/User");
const Movie = require("../models/Movie");
const TVShow = require("../models/TVShow");
const Category = require("../models/Category");
const Subscription = require("../models/Subscription");
const Review = require("../models/Review");
const Report = require("../models/Report");
const Banner = require("../models/Banner");
const Notification = require("../models/Notification");
const AdminLog = require("../models/AdminLog");

const getDashboardOverview = async (req, res) => {
  try {
    const [movies, shows, categories, users, subscriptions, reviews, reports, banners, notifications, logs] = await Promise.all([
      Movie.countDocuments(),
      TVShow.countDocuments(),
      Category.countDocuments(),
      User.countDocuments(),
      Subscription.countDocuments(),
      Review.countDocuments(),
      Report.countDocuments(),
      Banner.countDocuments(),
      Notification.countDocuments(),
      AdminLog.countDocuments(),
    ]);

    const activeSubscriptions = await Subscription.countDocuments({ status: "active" });
    const premiumSubscriptions = await Subscription.countDocuments({ plan: "premium" });
    const monthlySubscriptions = await Subscription.countDocuments({ billingCycle: "monthly" });
    const yearlySubscriptions = await Subscription.countDocuments({ billingCycle: "yearly" });
    const revenue = (premiumSubscriptions * 15) + (activeSubscriptions * 5) + (monthlySubscriptions * 2) + (yearlySubscriptions * 12);

    res.json({
      metrics: {
        movies,
        shows,
        categories,
        users,
        subscriptions,
        reviews,
        reports,
        banners,
        notifications,
        logs,
        activeSubscriptions,
        premiumSubscriptions,
        monthlySubscriptions,
        yearlySubscriptions,
        revenue,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAdminLog = async (action, details, actor = "admin") => {
  await AdminLog.create({ actor, action, details });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password -refreshToken");
    await createAdminLog("update_user", `Updated user ${user?.email || req.params.id}`, req.user?.email || "admin");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await createAdminLog("delete_user", `Deleted user ${req.params.id}`, req.user?.email || "admin");
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate("userId", "name email");
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.create(req.body);
    await createAdminLog("create_subscription", `Created subscription ${subscription._id}`, req.user?.email || "admin");
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAdminLog("update_subscription", `Updated subscription ${subscription._id}`, req.user?.email || "admin");
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSubscription = async (req, res) => {
  try {
    await Subscription.findByIdAndDelete(req.params.id);
    await createAdminLog("delete_subscription", `Deleted subscription ${req.params.id}`, req.user?.email || "admin");
    res.json({ message: "Subscription deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("userId", "name email").populate("movieId", "title");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    await createAdminLog("create_review", `Created review ${review._id}`, req.user?.email || "admin");
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAdminLog("update_review", `Updated review ${review._id}`, req.user?.email || "admin");
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    await createAdminLog("delete_review", `Deleted review ${req.params.id}`, req.user?.email || "admin");
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReport = async (req, res) => {
  try {
    const report = await Report.create(req.body);
    await createAdminLog("create_report", `Created report ${report._id}`, req.user?.email || "admin");
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAdminLog("update_report", `Updated report ${report._id}`, req.user?.email || "admin");
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    await createAdminLog("delete_report", `Deleted report ${req.params.id}`, req.user?.email || "admin");
    res.json({ message: "Report deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    await createAdminLog("create_banner", `Created banner ${banner._id}`, req.user?.email || "admin");
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAdminLog("update_banner", `Updated banner ${banner._id}`, req.user?.email || "admin");
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    await createAdminLog("delete_banner", `Deleted banner ${req.params.id}`, req.user?.email || "admin");
    res.json({ message: "Banner deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    await createAdminLog("create_notification", `Created notification ${notification._id}`, req.user?.email || "admin");
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAdminLog("update_notification", `Updated notification ${notification._id}`, req.user?.email || "admin");
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    await createAdminLog("delete_notification", `Deleted notification ${req.params.id}`, req.user?.email || "admin");
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTVShows = async (req, res) => {
  try {
    const shows = await TVShow.find();
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTVShow = async (req, res) => {
  try {
    const show = await TVShow.create(req.body);
    await createAdminLog("create_tv_show", `Created show ${show._id}`, req.user?.email || "admin");
    res.status(201).json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTVShow = async (req, res) => {
  try {
    const show = await TVShow.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAdminLog("update_tv_show", `Updated show ${show._id}`, req.user?.email || "admin");
    res.json(show);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTVShow = async (req, res) => {
  try {
    await TVShow.findByIdAndDelete(req.params.id);
    await createAdminLog("delete_tv_show", `Deleted show ${req.params.id}`, req.user?.email || "admin");
    res.json({ message: "TV show deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    await createAdminLog("create_category", `Created category ${category._id}`, req.user?.email || "admin");
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await createAdminLog("update_category", `Updated category ${category._id}`, req.user?.email || "admin");
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    await createAdminLog("delete_category", `Deleted category ${req.params.id}`, req.user?.email || "admin");
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
