
import { useState } from 'react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import FloatingActionButton from '@/components/layout/FloatingActionButton';
import BusList from '@/components/bus/BusList';
import AddBusForm from '@/components/bus/AddBusForm';
import { motion } from 'framer-motion';

const Buses = () => {
  const [isAddBusOpen, setIsAddBusOpen] = useState(false);
  
  return (
    <div className="pb-20 px-4 container max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="py-8"
      >
        <h1 className="text-3xl font-bold text-center mb-1">Bus Management</h1>
        <p className="text-center text-muted-foreground mb-8">Manage your bus schedule and capacity</p>
      </motion.div>
      
      <BusList />
      
      <FloatingActionButton onClick={() => setIsAddBusOpen(true)} />
      <AddBusForm isOpen={isAddBusOpen} onClose={() => setIsAddBusOpen(false)} />
      
      <BottomNavigation />
    </div>
  );
};

export default Buses;
