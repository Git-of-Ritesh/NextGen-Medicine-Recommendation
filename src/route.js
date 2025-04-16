import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/authPage/authPage";
import ProfilePage from '../src/pages/profile'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/profile" element={<ProfilePage/>}/>
    </Routes>
  );
}

export default AppRoutes;

