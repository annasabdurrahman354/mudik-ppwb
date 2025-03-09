import { useState, useEffect } from 'react';
import { Passenger, fetchPassengers, fetchBuses, Bus, subscribeToUpdates } from '@/lib/supabase';
import PassengerCard from './PassengerCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';

const PassengerList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBus, setSelectedBus] = useState<string>('all');
  
  // Ambil data penumpang
  const { data: passengers = [], isLoading: isLoadingPassengers, refetch: refetchPassengers } = useQuery({
    queryKey: ['passengers'],
    queryFn: fetchPassengers
  });
  
  // Ambil data bus
  const { data: buses = [] } = useQuery({
    queryKey: ['buses'],
    queryFn: fetchBuses
  });
  
  // Format bus untuk seleksi
  const busOptions = buses.map(bus => ({
    id: bus.id,
    label: `${bus.destination} #${bus.bus_number}`
  }));
  
  // Filter penumpang berdasarkan kata kunci pencarian dan bus yang dipilih
  const filteredPassengers = passengers.filter(passenger => {
    const matchesSearch = passenger.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBus = selectedBus === 'all' || passenger.bus_id === selectedBus;
    return matchesSearch && matchesBus;
  });
  
  // Berlangganan pembaruan real-time
  useEffect(() => {
    const subscription = subscribeToUpdates('passengers', (payload) => {
      refetchPassengers();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [refetchPassengers]);
  
  return (
    <div className="w-full mx-auto">
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Label htmlFor="search-passengers" className="block text-sm font-medium text-muted-foreground mb-2">
            Cari Penumpang
          </Label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search-passengers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama..."
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="bus-filter" className="block text-sm font-medium text-muted-foreground mb-2">
            Filter berdasarkan Bus
          </Label>
          <Select value={selectedBus} onValueChange={setSelectedBus}>
            <SelectTrigger id="bus-filter" className="w-full">
              <SelectValue placeholder="Semua Bus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bus</SelectItem>
              {busOptions.map(bus => (
                <SelectItem key={bus.id} value={bus.id}>
                  {bus.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoadingPassengers ? (
        <div className="flex flex-col space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filteredPassengers.length > 0 ? (
            <motion.div 
              className="flex flex-col space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {filteredPassengers.map(passenger => (
                <PassengerCard key={passenger.id} passenger={passenger} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <p className="text-muted-foreground">Tidak ada penumpang yang ditemukan</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default PassengerList;
