import { Link } from 'react-router-dom';
import { Passenger } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { UserIcon } from 'lucide-react';

interface PassengerCardProps {
  passenger: Passenger;
  className?: string;
}

const PassengerCard = ({ passenger, className }: PassengerCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      layout
      className={cn("w-full", className)}
    >
      <Link to={`/passengers/${passenger.id}`} className="block w-full">
        <Card className="overflow-hidden card-hover border border-primary/10">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  {passenger.gender === 'L' ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Laki-laki</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">Perempuan</span>
                  )}
                  <h3 className="font-medium">{passenger.name}</h3>
                </div>
                
                <div className="mt-1 text-sm text-muted-foreground">
                  <p>Kelompok: {passenger.group_pondok}</p>
                </div>
                
                {passenger.bus && (
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      Bus {passenger.bus.destination} #{passenger.bus.bus_number}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      Kursi #{passenger.bus_seat_number}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="rounded-full h-10 w-10 flex items-center justify-center bg-primary/10 text-primary">
                <UserIcon size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default PassengerCard;
