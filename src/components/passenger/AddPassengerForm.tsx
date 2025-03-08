import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { fetchBuses, addPassenger, getAvailableSeatsCount } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface AddPassengerFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPassengerForm = ({ isOpen, onClose }: AddPassengerFormProps) => {
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [address, setAddress] = useState<string>('');
  const [groupPondok, setGroupPondok] = useState<string>('');
  const [busId, setBusId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const selectedBus = buses.find(bus => bus.id === busId);
      
      if (!selectedBus) {
        toast.error('Silakan pilih bus yang valid');
        return;
      }
      
      await addPassenger({
        name,
        gender,
        address,
        destination: selectedBus.destination,
        group_pondok: groupPondok,
        bus_id: busId
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
    setGroupPondok('');
    setBusId('');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
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
                <Label htmlFor="male">Laki-laki (L)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="P" id="female" />
                <Label htmlFor="female">Perempuan (P)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Masukkan alamat"
              required
              rows={3}
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
                      {`${bus.destination}#${bus.bus_number}`} 
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
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || buses.length === 0}>
              {isLoading ? 'Menambahkan...' : 'Tambah Penumpang'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPassengerForm;
