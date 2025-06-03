import { Toaster } from "sonner";
import { Router } from "./components/Router";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster />
      <Router />
    </div>
  );
}
