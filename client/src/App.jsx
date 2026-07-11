import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import PremiumNavbar from "./components/PremiumNavbar";
import PremiumFooter from "./components/PremiumFooter";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionFailure from "./pages/SubscriptionFailure";

const Home = lazy(() => import("./pages/Home"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const WatchMovie = lazy(() => import("./pages/WatchMovie"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AddMovie = lazy(() => import("./pages/AddMovie"));
const ManageMovies = lazy(() => import("./pages/ManageMovies"));
const EditMovie = lazy(() => import("./pages/EditMovie"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Profile = lazy(() => import("./pages/Profile"));
const SubscriptionHistory = lazy(() => import("./pages/SubscriptionHistory"));
const AdminWebhooks = lazy(() => import("./pages/AdminWebhooks"));

function App() {
  return (
    <BrowserRouter>
      <PremiumNavbar />

      <Suspense fallback={<div className="page detail-loading">Loading experience…</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Landing />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/movie/:id"
          element={
            <ProtectedRoute>
              <MovieDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/watch/:id"
          element={
            <ProtectedRoute>
              <WatchMovie />
            </ProtectedRoute>
          }
        />

        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subscription/success"
          element={
            <ProtectedRoute>
              <SubscriptionSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subscription/failure"
          element={
            <ProtectedRoute>
              <SubscriptionFailure />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subscription/history"
          element={
            <ProtectedRoute>
              <SubscriptionHistory />
            </ProtectedRoute>
          }
        />

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/add" element={<AdminRoute><AddMovie /></AdminRoute>} />
        <Route path="/admin/movies" element={<AdminRoute><ManageMovies /></AdminRoute>} />
        <Route path="/admin/edit/:id" element={<AdminRoute><EditMovie /></AdminRoute>} />
        <Route path="/admin/webhooks" element={<AdminRoute><AdminWebhooks /></AdminRoute>} />
      </Routes>
      </Suspense>
      <PremiumFooter />
    </BrowserRouter>
  );
}

export default App;