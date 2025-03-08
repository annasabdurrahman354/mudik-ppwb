
import { useState } from 'react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import FloatingActionButton from '@/components/layout/FloatingActionButton';
import BusList from '@/components/bus/BusList';
import AddBusForm from '@/components/bus/AddBusForm';
import { motion } from 'framer-motion';

const Buses = () => {
  const [isAddBusOpen, setIsAddBusOpen] = useState(false);
  
  return (
    <div className="pb-28 px-8 pt-4 container w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="py-4"
      >
        <h1 className="text-2xl font-bold text-center mb-1">Manajemen Bus</h1>
        <p className="hidden text-center text-muted-foreground text-sm mb-4">Manage your bus schedule and capacity</p>
      </motion.div>
      
      <BusList />
      
      <FloatingActionButton onClick={() => setIsAddBusOpen(true)} />
      <AddBusForm isOpen={isAddBusOpen} onClose={() => setIsAddBusOpen(false)} />
      
      <BottomNavigation />
    </div>
  );
};

export default Buses;
