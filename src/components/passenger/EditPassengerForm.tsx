import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Passenger, fetchBuses, supabase, getOccupiedSeats } from '@/lib/supabase';
import BusSeatSelector from './BusSeatSelector';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EditPassengerFormProps {
  isOpen: boolean;
  onClose: () => void;
  passenger: Passenger;
}

const EditPassengerForm = ({ isOpen, onClose, passenger }: EditPassengerFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [name, setName] = useState(passenger.name);
  const [gender, setGender] = useState<'L' | 'P'>(passenger.gender);
  const [address, setAddress] = useState(passenger.address);
  const [destination, setDestination] = useState(passenger.destination);
  const [groupPondok, setGroupPondok] = useState(passenger.group_pondok);
  const [busId, setBusId] = useState(passenger.bus_id || '');
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(passenger.bus_seat_number || null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [buses, setBuses] = useState<{id: string; label: string}[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<any[]>([]);
  const [fetchingSeats, setFetchingSeats] = useState<boolean>(false);
  
  // Reset form when passenger changes
  useEffect(() => {
    if (passenger) {
      setName(passenger.name);
      setGender(passenger.gender);
      setAddress(passenger.address);
      setDestination(passenger.destination);
      setGroupPondok(passenger.group_pondok);
      setBusId(passenger.bus_id || '');
      setSelectedSeatNumber(passenger.bus_seat_number || null);
    }
  }, [passenger]);
  
  // Reset selected seat when bus changes
  useEffect(() => {
    // Only reset if the bus changes from the passenger's original bus
    if (busId !== passenger.bus_id) {
      setSelectedSeatNumber(null);
    } else {
      // Restore original seat if returning to original bus
      setSelectedSeatNumber(passenger.bus_seat_number || null);
    }
  }, [busId, passenger.bus_id, passenger.bus_seat_number]);
  
  // Load buses for select dropdown
  useEffect(() => {
    const loadBuses = async () => {
      try {
        const busesData = await fetchBuses();
        const formattedBuses = busesData.map(bus => ({
          id: bus.id,
          label: `${bus.destination} #${bus.bus_number}`
        }));
        setBuses(formattedBuses);
      } catch (error) {
        console.error('Error loading buses:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data bus",
          variant: "destructive",
        });
      }
    };
    
    if (isOpen) {
      loadBuses();
    }
  }, [isOpen, toast]);
  
  // Fetch occupied seats when bus is selected
  useEffect(() => {
    const fetchBusSeats = async () => {
      if (!busId || busId === 'none') {
        setOccupiedSeats([]);
        return;
      }
      
      setFetchingSeats(true);
      try {
        const seats = await getOccupiedSeats(busId);
        // Filter out the current passenger's seat
        const filteredSeats = seats.filter(seat => seat.id !== passenger.id);
        setOccupiedSeats(filteredSeats);
      } catch (error) {
        console.error('Gagal memuat kursi yang ditempati:', error);
        toast({
          title: "Error",
          description: "Gagal memuat informasi kursi",
          variant: "destructive",
        });
      } finally {
        setFetchingSeats(false);
      }
    };
    
    fetchBusSeats();
  }, [busId, passenger.id, toast]);
  
  const handleSeatSelect = (seatNumber: number) => {
    setSelectedSeatNumber(seatNumber);
  };
  
  const handleSubmit = async () => {
    // Validate that a seat is selected if a bus is selected
    if (busId !== 'none' && !selectedSeatNumber) {
      toast({
        title: "Peringatan",
        description: "Pilih nomor kursi terlebih dahulu",
        variant: "destructive",
      });
      setShowConfirmDialog(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('passengers')
        .update({
          name,
          gender,
          address,
          destination,
          group_pondok: groupPondok,
          bus_id: busId === 'none' ? null : busId,
          bus_seat_number: busId === 'none' ? null : selectedSeatNumber
        })
        .eq('id', passenger.id);
      
      if (error) throw error;
      
      // Success message
      toast({
        title: "Berhasil!",
        description: "Data penumpang berhasil diperbarui",
      });
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      queryClient.invalidateQueries({ queryKey: ['passenger', passenger.id] });
      
      // Close the form
      onClose();
    } catch (error) {
      console.error('Error updating passenger:', error);
      toast({
        title: "Gagal!",
        description: "Terjadi kesalahan saat memperbarui data penumpang",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Penumpang</DialogTitle>
            <DialogDescription>
              Perbarui informasi penumpang di bawah ini
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Jenis Kelamin</Label>
              <RadioGroup value={gender} onValueChange={(value) => setGender(value as 'L' | 'P')} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="L" id="male" />
                  <Label htmlFor="male" className="cursor-pointer">Laki-laki</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="P" id="female" />
                  <Label htmlFor="female" className="cursor-pointer">Perempuan</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="destination">Kota Tujuan</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Masukkan kota tujuan"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="group">Kelompok Pondok</Label>
              <Input
                id="group"
                value={groupPondok}
                onChange={(e) => setGroupPondok(e.target.value)}
                placeholder="Masukkan kelompok pondok"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bus">Bus</Label>
              <Select 
                value={busId} 
                onValueChange={(value) => {
                  setBusId(value);
                  // Reset seat if bus changes
                  if (value !== passenger.bus_id) {
                    setSelectedSeatNumber(null);
                  }
                }}
              >
                <SelectTrigger id="bus">
                  <SelectValue placeholder="Pilih bus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada bus</SelectItem>
                  {buses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {busId && busId !== 'none' && (
              <div className="space-y-2 border rounded-md p-3">
                <Label className="mb-2 block">Pilih Kursi</Label>
                {fetchingSeats ? (
                  <div className="text-center py-4">Memuat kursi...</div>
                ) : (
                  <>
                    <BusSeatSelector
                      occupiedSeats={occupiedSeats}
                      selectedSeat={selectedSeatNumber}
                      onSeatSelect={handleSeatSelect}
                      disabled={isSubmitting}
                    />
                    {selectedSeatNumber ? (
                      <p className="text-sm text-center mt-2">
                        Anda memilih kursi nomor: <strong>{selectedSeatNumber}</strong>
                      </p>
                    ) : (
                      <p className="text-sm text-center mt-2 text-amber-600">
                        Silakan pilih nomor kursi
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (busId !== 'none' && !selectedSeatNumber) || fetchingSeats}
              onClick={() => setShowConfirmDialog(true)}
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan pada data penumpang ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditPassengerForm;