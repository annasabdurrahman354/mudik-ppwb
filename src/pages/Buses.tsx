import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import BottomNavigation from '@/components/layout/BottomNavigation';
import FloatingActionButton from '@/components/layout/FloatingActionButton';
import BusList from '@/components/bus/BusList';
import AddBusForm from '@/components/bus/AddBusForm';
import { motion } from 'framer-motion';
import { getActivePeriod } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Buses = () => {
  const [isAddBusOpen, setIsAddBusOpen] = useState(false);
  
  const { data: activePeriod, isLoading: isLoadingPeriod } = useQuery({
    queryKey: ['activePeriod'],
    queryFn: getActivePeriod,
  });

  return (
    <div className="pb-28 px-8 pt-4 container w-full mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="py-4 flex flex-col items-center"
      >
        <h1 className="text-2xl font-bold text-center mb-1">Manajemen Bus</h1>
        {isLoadingPeriod ? (
          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mt-2"></div>
        ) : activePeriod ? (
          <Badge variant="outline" className="mt-1 border-primary/20 bg-primary/5 text-primary">
            Periode: {activePeriod.name}
          </Badge>
        ) : (
          <div className="flex flex-col items-center gap-2 mt-2">
             <Badge variant="destructive">Tidak ada periode aktif</Badge>
             <Button variant="link" size="sm" asChild>
               <Link to="/periods">Atur Periode</Link>
             </Button>
          </div>
        )}
      </motion.div>
      
      <BusList activePeriodId={activePeriod?.id} />
      
      {activePeriod && (
        <>
          <FloatingActionButton onClick={() => setIsAddBusOpen(true)} />
          <AddBusForm 
            isOpen={isAddBusOpen} 
            onClose={() => setIsAddBusOpen(false)} 
            periodId={activePeriod.id}
          />
        </>
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default Buses;
