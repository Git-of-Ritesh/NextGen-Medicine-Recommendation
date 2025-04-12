import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/authPage/authPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
    </Routes>
  );
}

export default AppRoutes;

