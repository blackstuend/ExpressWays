import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import HomePage from "@/pages/home";
import NotFoundPage from "@/pages/not-found";

const router = createBrowserRouter([
  {
    path: import.meta.env.BASE_URL,
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);

export default router;