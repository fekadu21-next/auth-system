import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardPage from "./pages/DashboardPage";
import DocumentPage from "./pages/DocumentPage";
import { UiProvider } from "./Componnts/UiProvider.jsx";
import SessionManager from "./Componnts/SessionManager.jsx";
import "./App.css";

export default function App() {
  return (
    <UiProvider>
    <BrowserRouter>
      <SessionManager />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/document/:id" element={<DocumentPage />} />
      </Routes>
    </BrowserRouter>
    </UiProvider>
  );
}