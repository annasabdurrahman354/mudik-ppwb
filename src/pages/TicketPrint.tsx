
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPassengerById } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TicketView from '@/components/passenger/TicketView';
import { motion } from 'framer-motion';

const TicketPrint = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: passenger, isLoading, error } = useQuery({
    queryKey: ['passenger', id],
    queryFn: () => fetchPassengerById(id!),
    enabled: !!id
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-light text-center">
          <p className="text-muted-foreground">Loading ticket...</p>
        </div>
      </div>
    );
  }
  
  if (error || !passenger) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load ticket</p>
          <Button asChild>
            <Link to="/passengers">Return to Passengers</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to={`/passengers/${passenger.id}`}>
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Ticket</h1>
        </div>
        
        <TicketView passenger={passenger} />
      </motion.div>
    </div>
  );
};

export default TicketPrint;
