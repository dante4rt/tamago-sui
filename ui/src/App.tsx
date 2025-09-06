import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Providers from "./providers";
import HomePage from "./pages/home";
import { Toaster } from "./components/ui/sonner";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <Toaster />
    </Providers>
  );
}

export default App;
