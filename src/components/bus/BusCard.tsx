import { motion } from 'framer-motion';
import { Bus } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BusCardProps {
  bus: Bus;
  passengersCount: number;
  className?: string;
}

const BusCard = ({ bus, passengersCount, className }: BusCardProps) => {
  const availableSeats = bus.max_passengers - passengersCount;
  const isFull = availableSeats === 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      layout
      className={cn("w-full", className)}
    >
      <Card className={cn(
        "overflow-hidden card-hover border", 
        isFull ? "border-gray-200 bg-gray-50" : "border-primary/10"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  #{bus.bus_number}
                </span>
                <h3 className="font-medium">{bus.destination}</h3>
              </div>
            </div>
            
            <div className={cn(
              "rounded-full h-8 w-8 flex items-center justify-center",
              isFull ? "bg-gray-200 text-gray-500" : "bg-primary/10 text-primary"
            )}>
              <span className="text-sm font-medium">
                {isFull ? "PENUH" : availableSeats}
              </span>
            </div>
          </div>

          <div className="mt-3 text-md text-muted-foreground w-full">
            <div className="flex items-center justify-between">
              <span>Kapasitas:</span>
              <span>{bus.max_passengers} kursi</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span>Tarif:</span>
              <span>Rp. {bus.fare_per_passenger}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span>Jumlah Penumpang:</span>
              <span>{passengersCount}/{bus.max_passengers}</span>
            </div>
          </div>
          
          {/* Bilah progres untuk okupansi kursi */}
          <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full",
                isFull ? "bg-gray-400" : "bg-primary"
              )}
              style={{ 
                width: `${(passengersCount / bus.max_passengers) * 100}%`,
                transition: "width 0.3s ease-out"
              }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BusCard;
