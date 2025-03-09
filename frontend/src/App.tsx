import { Route, Routes } from "react-router-dom";
import SignUpPage from "./pages/auth/signup/SignUpPage.tsx";
import HomePage from "./pages/home/HomePage.tsx";
import LoginPage from "./pages/auth/login/LoginPage.tsx";
import RightPanel from "./components/common/RightPanel.tsx";
import Sidebar from "./components/common/Sidebar.tsx";
import NotificationPage from "./pages/notification/NotificationPage.tsx";
import ProfilePage from "./pages/profile/ProfilePage.tsx";
import {Toaster} from "react-hot-toast";
function App() {
	return (
		<div className='flex max-w-6xl mx-auto'>
			<Sidebar />
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/signup' element={<SignUpPage />} />
				<Route path='/login' element={<LoginPage />} />
				<Route path="/notifications" element={<NotificationPage />} />
				<Route path = "/profile/:username"  element = {<ProfilePage/>}/>
				</Routes>
			<RightPanel/>
		</div>
	);
}
export default App;