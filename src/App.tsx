
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Buses from "./pages/Buses";
import BusDetail from "./pages/BusDetail";
import Passengers from "./pages/Passengers";
import PassengerDetail from "./pages/PassengerDetail";
import TicketPrint from "./pages/TicketPrint";
import Periods from "./pages/Periods";
import NotFound from "./pages/NotFound";

// Add framer-motion for animations
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/periods" element={<Periods />} />
            <Route path="/buses" element={<Buses />} />
            <Route path="/buses/:id" element={<BusDetail />} />
            <Route path="/passengers" element={<Passengers />} />
            <Route path="/passengers/:id" element={<PassengerDetail />} />
            <Route path="/tickets/:id" element={<TicketPrint />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
