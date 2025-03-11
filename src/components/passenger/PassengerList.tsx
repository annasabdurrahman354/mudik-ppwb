import { useState, useEffect, useMemo } from 'react';
import { Passenger, fetchPassengers, fetchBuses, Bus, subscribeToUpdates } from '@/lib/supabase';
import PassengerCard from './PassengerCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchIcon, ClockIcon, CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale'; // Import Indonesian locale

// Time block definitions
const TIME_BLOCKS = [
  { start: 0, end: 6, label: '00:00 - 06:00' },
  { start: 6, end: 12, label: '06:00 - 12:00' },
  { start: 12, end: 18, label: '12:00 - 18:00' },
  { start: 18, end: 24, label: '18:00 - 24:00' }
];

const PassengerList = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBus, setSelectedBus] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  
  // Fetch passenger data
  const { data: passengers = [], isLoading: isLoadingPassengers, refetch: refetchPassengers } = useQuery({
    queryKey: ['passengers'],
    queryFn: fetchPassengers
  });
  
  // Fetch bus data
  const { data: buses = [] } = useQuery({
    queryKey: ['buses'],
    queryFn: fetchBuses
  });
  
  // Format buses for selection
  const busOptions = buses.map(bus => ({
    id: bus.id,
    label: `${bus.destination} #${bus.bus_number}`
  }));
  
  // Filter passengers based on search term, selected bus, and gender
  const filteredPassengers = useMemo(() => {
    return passengers.filter(passenger => {
      const matchesSearch = passenger.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBus = selectedBus === 'all' || passenger.bus_id === selectedBus;
      const matchesGender = selectedGender === 'all' || passenger.gender === selectedGender;
      return matchesSearch && matchesBus && matchesGender;
    });
  }, [passengers, searchTerm, selectedBus, selectedGender]);
  
  // Group passengers by date and time blocks
  const groupedPassengers = useMemo(() => {
    const groups = {};
    
    filteredPassengers.forEach(passenger => {
      try {
        // Parse the created_at timestamp
        const createdDate = parseISO(passenger.created_at);
        
        // Format date for grouping
        const dateKey = format(createdDate, 'yyyy-MM-dd');
        const formattedDate = format(createdDate, 'EEEE, d MMMM yyyy', { locale: id }); // Use Indonesian locale
        
        // Get hours to determine time block
        const hours = createdDate.getHours();
        
        // Determine which time block the passenger belongs to
        const timeBlock = TIME_BLOCKS.find(block => hours >= block.start && hours < block.end);
        
        // Initialize date group if it doesn't exist
        if (!groups[dateKey]) {
          groups[dateKey] = {
            date: formattedDate,
            timeBlocks: {}
          };
        }
        
        // Initialize time block if it doesn't exist
        if (!groups[dateKey].timeBlocks[timeBlock.label]) {
          groups[dateKey].timeBlocks[timeBlock.label] = [];
        }
        
        // Add passenger to the appropriate time block
        groups[dateKey].timeBlocks[timeBlock.label].push(passenger);
      } catch (error) {
        console.error("Error parsing date:", passenger.created_at, error);
      }
    });
    
    // Convert to array and sort by date (newest first)
    return Object.entries(groups)
      .sort(([dateKeyA], [dateKeyB]) => dateKeyB.localeCompare(dateKeyA))
      .map(([dateKey, dateGroup]) => ({
        ...dateGroup,
        timeBlocks: Object.entries(dateGroup.timeBlocks)
          .sort((a, b) => {
            // Sort time blocks in reverse chronological order (latest first)
            const indexA = TIME_BLOCKS.findIndex(block => block.label === a[0]);
            const indexB = TIME_BLOCKS.findIndex(block => block.label === b[0]);
            return indexB - indexA; // Reversed for descending order
          })
          .map(([timeBlockLabel, passengers]) => ({
            label: timeBlockLabel,
            passengers
          }))
      }));
  }, [filteredPassengers]);
  
  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = subscribeToUpdates('passengers', () => {
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div>
            <Label htmlFor="gender-filter" className="block text-sm font-medium text-muted-foreground mb-2">
              Filter berdasarkan Gender
            </Label>
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger id="gender-filter" className="w-full">
                <SelectValue placeholder="Semua Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Gender</SelectItem>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          {groupedPassengers.length > 0 ? (
            <motion.div 
              className="flex flex-col space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {groupedPassengers.map((dateGroup, dateIndex) => (
                <motion.div 
                  key={dateIndex} 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: dateIndex * 0.05 }}
                >
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-medium">{dateGroup.date}</h3>
                  </div>
                  
                  {dateGroup.timeBlocks.map((timeBlock, timeIndex) => (
                    timeBlock.passengers.length > 0 ? (
                      <motion.div 
                        key={timeIndex} 
                        className="ml-4 space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: timeIndex * 0.03 }}
                      >
                        <div className="flex items-center justify-between ml-2 mb-2">
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="h-4 w-4 text-muted-foreground" />
                            <h4 className="text-sm font-medium text-muted-foreground">{timeBlock.label}</h4>
                            <span className="text-xs text-muted-foreground">({timeBlock.passengers.length} penumpang)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-muted-foreground">Total:</span>
                            <span className="text-sm font-semibold text-primary">
                              {new Intl.NumberFormat('id-ID', { 
                                style: 'currency', 
                                currency: 'IDR',
                                minimumFractionDigits: 0
                              }).format(timeBlock.passengers.reduce((sum, passenger) => {
                                // Check if payment_amount exists and is a number
                                const amount = typeof passenger.total_payment === 'number' ? passenger.total_payment : 0;
                                return sum + amount;
                              }, 0))}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-3">
                          {timeBlock.passengers.map(passenger => (
                            <PassengerCard key={passenger.id} passenger={passenger} />
                          ))}
                        </div>
                      </motion.div>
                    ) : null
                  ))}
                </motion.div>
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