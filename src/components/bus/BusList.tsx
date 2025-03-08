import { useState, useEffect } from 'react';
import { Bus, fetchBuses, subscribeToUpdates, fetchPassengerCounts } from '@/lib/supabase';
import BusCard from './BusCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

const BusList = () => {
  const [selectedDestination, setSelectedDestination] = useState<string>('semua');
  const [busPassengerCounts, setBusPassengerCounts] = useState<Record<string, number>>({});
  
  // Ambil data bus
  const { data: buses = [], isLoading, refetch } = useQuery({
    queryKey: ['buses'],
    queryFn: fetchBuses
  });
  
  // Dapatkan destinasi unik
  const destinations = ['semua', ...new Set(buses.map(bus => bus.destination))].sort();
  
  // Filter bus berdasarkan destinasi yang dipilih
  const filteredBuses = selectedDestination === 'semua'
    ? buses
    : buses.filter(bus => bus.destination === selectedDestination);
  
  // Ambil jumlah penumpang untuk setiap bus
  useEffect(() => {
    if (buses.length > 0) {
      const loadPassengerCounts = async () => {
        try {
          const counts = await fetchPassengerCounts();
          setBusPassengerCounts(counts);
        } catch (error) {
          console.error('Error mengambil jumlah penumpang:', error);
        }
      };
  
      loadPassengerCounts();
    }
  }, [buses]);
  
  // Berlangganan pembaruan real-time
  useEffect(() => {
    const subscription = subscribeToUpdates('buses', (payload) => {
      refetch();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);
  
  return (
    <div className="w-full mx-auto">
      <div className="mb-6">
        <label htmlFor="destination-filter" className="block text-sm font-medium text-muted-foreground mb-2">
          Filter Berdasarkan Destinasi
        </label>
        <Select value={selectedDestination} onValueChange={setSelectedDestination}>
          <SelectTrigger id="destination-filter" className="w-full">
            <SelectValue placeholder="Semua Destinasi" />
          </SelectTrigger>
          <SelectContent>
            {destinations.map(destination => (
              <SelectItem key={destination} value={destination}>
                {destination === 'semua' ? 'Semua Destinasi' : destination}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filteredBuses.length > 0 ? (
            <motion.div 
              className="flex flex-col space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {filteredBuses.map(bus => (
                <BusCard 
                  key={bus.id}
                  bus={bus}
                  passengersCount={busPassengerCounts[bus.id] || 0}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <p className="text-muted-foreground">Tidak ada bus yang ditemukan</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default BusList;
