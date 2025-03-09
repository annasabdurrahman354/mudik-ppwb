import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { fetchBuses, addPassenger, getAvailableSeatsCount, getOccupiedSeats } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import BusSeatSelector from './BusSeatSelector';

interface AddPassengerFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPassengerForm = ({ isOpen, onClose }: AddPassengerFormProps) => {
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [address, setAddress] = useState<string>('');
  const [destination, setDestination] = useState<string>(''); // Added destination state
  const [groupPondok, setGroupPondok] = useState<string>('');
  const [busId, setBusId] = useState<string>('');
  const [occupiedSeats, setOccupiedSeats] = useState<any[]>([]);
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchingSeats, setFetchingSeats] = useState<boolean>(false);
  const [buses, setBuses] = useState<any[]>([]);
  const [busAvailability, setBusAvailability] = useState<Record<string, number>>({});
  
  const queryClient = useQueryClient();
  
  // Load buses and their availability
  useEffect(() => {
    const loadBuses = async () => {
      try {
        const busesData = await fetchBuses();
        setBuses(busesData);
        
        // Check availability for each bus
        const availability: Record<string, number> = {};
        for (const bus of busesData) {
          const availableSeats = await getAvailableSeatsCount(bus.id);
          availability[bus.id] = availableSeats;
        }
        
        setBusAvailability(availability);
      } catch (error) {
        console.error('Gagal memuat bus:', error);
        toast.error('Gagal memuat daftar bus');
      }
    };
    
    if (isOpen) {
      loadBuses();
    }
  }, [isOpen]);

  // Fetch occupied seats when bus is selected
  useEffect(() => {
    const fetchBusSeats = async () => {
      if (!busId) {
        setOccupiedSeats([]);
        setSelectedSeatNumber(null);
        return;
      }
      
      setFetchingSeats(true);
      try {
        const seats = await getOccupiedSeats(busId);
        setOccupiedSeats(seats);
      } catch (error) {
        console.error('Gagal memuat kursi yang ditempati:', error);
        toast.error('Gagal memuat informasi kursi');
      } finally {
        setFetchingSeats(false);
      }
    };
    
    fetchBusSeats();
  }, [busId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSeatNumber) {
      toast.error('Silakan pilih nomor kursi');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await addPassenger({
        name,
        gender,
        address,
        destination, // Use the manually entered destination
        group_pondok: groupPondok,
        bus_seat_number: selectedSeatNumber,
        bus_id: busId,
      });
      
      toast.success('Penumpang berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      resetForm();
      onClose();
    } catch (error) {
      console.error('Gagal menambahkan penumpang:', error);
      toast.error('Gagal menambahkan penumpang');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setGender('L');
    setAddress('');
    setDestination(''); // Reset destination field
    setGroupPondok('');
    setBusId('');
    setSelectedSeatNumber(null);
    setOccupiedSeats([]);
  };

  const handleSeatSelect = (seatNumber: number) => {
    setSelectedSeatNumber(seatNumber);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambahkan Penumpang Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <RadioGroup value={gender} onValueChange={(value) => setGender(value as 'L' | 'P')} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="L" id="male" />
                  <Label className="font-normal" htmlFor="male">L</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="P" id="female" />
                  <Label className="font-normal" htmlFor="female">P</Label>
                </div>
              </RadioGroup>
            </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Alamat Lengkap</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Masukkan alamat"
              required
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Kota Tujuan</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Masukkan kota tujuan"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="groupPondok">Kelompok Pondok</Label>
              <Input
                id="groupPondok"
                value={groupPondok}
                onChange={(e) => setGroupPondok(e.target.value)}
                placeholder="Masukkan nama kelompok"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bus">Pilih Bus</Label>
            <Select value={busId} onValueChange={setBusId}>
              <SelectTrigger id="bus">
                <SelectValue placeholder="Pilih bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map(bus => {
                  const isAvailable = (busAvailability[bus.id] || 0) > 0;
                  return (
                    <SelectItem 
                      key={bus.id} 
                      value={bus.id}
                      disabled={!isAvailable}
                    >
                      {`${bus.destination} #${bus.bus_number}`} 
                      {isAvailable 
                        ? ` (${busAvailability[bus.id]} kursi tersedia)` 
                        : ' (PENUH)'}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {buses.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Tidak ada bus tersedia. Silakan tambahkan bus terlebih dahulu.
              </p>
            )}
          </div>
          
          {busId && (
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
                    disabled={isLoading}
                  />
                  {selectedSeatNumber && (
                    <p className="text-sm text-center mt-2">
                      Anda memilih kursi nomor: <strong>{selectedSeatNumber}</strong>
                    </p>
                  )}
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || buses.length === 0 || !selectedSeatNumber || fetchingSeats}
            >
              {isLoading ? 'Menambahkan...' : 'Tambah Penumpang'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPassengerForm;