
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPassengerById, supabase } from '@/lib/supabase';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, TicketIcon, Trash2Icon, PencilIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import EditPassengerForm from '@/components/passenger/EditPassengerForm';

const PassengerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  
  const { data: passenger, isLoading, error } = useQuery({
    queryKey: ['passenger', id],
    queryFn: () => fetchPassengerById(id!),
    enabled: !!id
  });
  
  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('passengers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Berhasil!",
        description: "Penumpang telah dihapus",
      });
      
      // Invalidate queries and navigate back
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      navigate('/passengers');
    } catch (error) {
      console.error('Error deleting passenger:', error);
      toast({
        title: "Gagal!",
        description: "Gagal menghapus penumpang",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleEdit = () => {
    setIsEditFormOpen(true);
  };
  
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

  const createdAt = new Date(passenger.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long", // Full month name in Indonesian
    year: "numeric",
  });
  
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
              <h2 className="text-xl font-semibold">{passenger.name.ucwords()}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                passenger.gender === 'L' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-pink-100 text-pink-700'
              }`}>
                {passenger.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
              </span>
            </div>
            
            <div className="space-y-3 text-sm">
              {passenger.phone  && 
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Telepon</span>
                  <span className="font-medium">{passenger.phone}</span>
                </div>
              }

              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Alamat</span>
                <span className="font-medium text-right">{passenger.address}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Tujuan</span>
                <span className="font-medium">{passenger.destination}</span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{passenger.status === "pondok" ? "Pondok" : "Umum"}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Kelompok</span>
                <span className="font-medium">{passenger.group_pondok.ucwords()}</span>
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

                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Tanggal Pembelian</span>
                    <span className="font-medium">{createdAt}</span>
                  </div>

                  {passenger.meal_count > 0 &&  passenger.meal_payment > 0 &&
                  <>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Makan</span>
                      <span className="font-medium">{passenger.meal_count}x</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Total Uang Makan</span>
                      <span className="font-semibold text-primary">Rp. {passenger.meal_payment.toLocaleString("id-ID")}</span>
                    </div>
                  </>
                  }
                  
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Total Pembayaran</span>
                    <span className="font-semibold text-primary">Rp. {passenger.total_payment.toLocaleString("id-ID")}</span>
                  </div>
                </>
              )}
             
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit Penumpang
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Hapus Penumpang
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Data penumpang akan dihapus secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground"
                  >
                    {isDeleting ? 'Menghapus...' : 'Hapus'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <Button asChild>
            <Link to={`/tickets/${passenger.id}`}>
              <TicketIcon className="mr-2 h-4 w-4" />
              Tampilkan & Cetak Tiket
            </Link>
          </Button>
        </div>
      </motion.div>
      
      {passenger && (
        <EditPassengerForm 
          isOpen={isEditFormOpen} 
          onClose={() => setIsEditFormOpen(false)}
          passenger={passenger}
        />
      )}
      
    </div>
  );
};

export default PassengerDetail;
