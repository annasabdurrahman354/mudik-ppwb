
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPassengerById } from '@/lib/supabase';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, TicketIcon, PrinterIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const PassengerDetail = () => {
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
          <p className="text-muted-foreground">Memuat data penumpang...</p>
        </div>
      </div>
    );
  }
  
  if (error || !passenger) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <p className="text-destructive mb-4">Gagal memuat data penumpang</p>
          <Button asChild>
            <Link to="/passengers">Kembali ke Daftar Penumpang</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-20 px-8 pt-4 container w-full mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="py-6"
      >
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/passengers">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Detail Penumpang</h1>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{passenger.name}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                passenger.gender === 'L' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-pink-100 text-pink-700'
              }`}>
                {passenger.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
              </span>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Alamat</span>
                <span className="font-medium text-right">{passenger.address}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Tujuan</span>
                <span className="font-medium">{passenger.destination}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Kelompok</span>
                <span className="font-medium">{passenger.group_pondok}</span>
              </div>
              
              {passenger.bus && (
                <>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Bus</span>
                    <span className="font-medium">
                      {passenger.bus.destination} #{passenger.bus.bus_number}
                    </span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Nomor Penumpang</span>
                    <span className="font-medium">#{passenger.bus_seat_number}</span>
                  </div>
                  
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Total Pembayaran</span>
                    <span className="font-semibold text-primary">Rp. {passenger.total_payment}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
          <Button asChild>
            <Link to={`/tickets/${passenger.id}`}>
              <TicketIcon className="mr-2 h-4 w-4" />
              Tampilkan & Cetak Tiket
            </Link>
          </Button>
        </div>
      </motion.div>
      
      <BottomNavigation />
    </div>
  );
};

export default PassengerDetail;
