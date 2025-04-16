import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import MainPage from "./pages/Index-page";
import RegisterPage from "./pages/Register-page";
import LoginPage from "./pages/Login-page";
import SchedulePage from "./pages/Schedule-page";
import MedicinePage from "./pages/Medicine-page";
import NoPage from "./pages/NoPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<MainPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/medicine" element={<MedicinePage />} />
      <Route path="/*" element={<NoPage />} />
    </>
  )
);

export default function MainRouter() {
  return <RouterProvider router={router} />;
}
