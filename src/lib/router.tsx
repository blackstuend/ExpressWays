import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import NotFoundPage from "@/pages/not-found";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
    ],
  },
]);

export default router;