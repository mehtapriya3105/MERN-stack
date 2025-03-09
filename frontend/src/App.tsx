import { Navigate, Route, Routes } from "react-router-dom";
import SignUpPage from "./pages/auth/signup/SignUpPage.tsx";
import HomePage from "./pages/home/HomePage.tsx";
import LoginPage from "./pages/auth/login/LoginPage.tsx";
import RightPanel from "./components/common/RightPanel.tsx";
import Sidebar from "./components/common/Sidebar.tsx";
import NotificationPage from "./pages/notification/NotificationPage.tsx";
import ProfilePage from "./pages/profile/ProfilePage.tsx";
import { Toaster } from "react-hot-toast";
import { QueryClient, useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner.tsx";

function App() {

  const { data:authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        console.log("User data fetched:", data);
        return data;
      } catch (error) {
        console.error(error);
      }
    },
    retry : false,
  });

  if (isLoading)
    return (
      <div className="h-screen  flex  justify-center items-center">
       <LoadingSpinner size="lg"/>
      </div>
    );
  return (
    <div className="flex max-w-6xl mx-auto">
      <Sidebar />
      <Routes>
        <Route path="/" element={authUser? <HomePage /> : <Navigate to="/login/"/>} />
        <Route path="/signup" element={!authUser? <SignUpPage />:  <Navigate to="/" />} />
        <Route path="/login" element={!authUser? <LoginPage /> :  <Navigate to="/" />}/>
        <Route path="/notifications" element={authUser ? <NotificationPage /> :  <Navigate to="/login/"/>} />
        <Route path="/profile/:username" element={authUser ? <ProfilePage /> :  <Navigate to="/login/"/>} />
      </Routes>
      <RightPanel />
      <Toaster />
    </div>
  );
}
export default App;
