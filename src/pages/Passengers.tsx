
import { useState } from 'react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import FloatingActionButton from '@/components/layout/FloatingActionButton';
import PassengerList from '@/components/passenger/PassengerList';
import AddPassengerForm from '@/components/passenger/AddPassengerForm';
import { motion } from 'framer-motion';

const Passengers = () => {
  const [isAddPassengerOpen, setIsAddPassengerOpen] = useState(false);
  
  return (
    <div className="pb-20 px-4 container max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="py-8"
      >
        <h1 className="text-3xl font-bold text-center mb-1">Passenger Management</h1>
        <p className="text-center text-muted-foreground mb-8">Manage passenger bookings and assignments</p>
      </motion.div>
      
      <PassengerList />
      
      <FloatingActionButton onClick={() => setIsAddPassengerOpen(true)} />
      <AddPassengerForm isOpen={isAddPassengerOpen} onClose={() => setIsAddPassengerOpen(false)} />
      
      <BottomNavigation />
    </div>
  );
};

export default Passengers;
