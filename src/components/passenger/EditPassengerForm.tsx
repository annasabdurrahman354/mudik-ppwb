import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Passenger, fetchBuses, supabase, getOccupiedSeats, getAvailableSeatsCount, PREDEFINED_PASSENGER_STATUS } from '@/lib/supabase';
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
  const queryClient = useQueryClient();
  
  // Form state
  const [name, setName] = useState(passenger.name);
  const [gender, setGender] = useState<'L' | 'P'>(passenger.gender);
  const [address, setAddress] = useState(passenger.address || '');
  const [phone, setPhone] = useState(passenger.phone || '');
  const [destination, setDestination] = useState(passenger.destination || '');
  const [status, setStatus] = useState(passenger.status || 'pondok');
  const [groupPondok, setGroupPondok] = useState(passenger.group_pondok || '');
  const [daerahPondok, setDaerahPondok] = useState('');
  const [kelompok, setKelompok] = useState('');
  const [mealCount, setMealCount] = useState(passenger.meal_count || 0);
  const [mealPayment, setMealPayment] = useState(passenger.meal_payment || 0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [petugas, setPetugas] = useState(passenger.petugas || '');
  const [busId, setBusId] = useState(passenger.bus_id || '');
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(passenger.bus_seat_number || null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<any[]>([]);
  const [fetchingSeats, setFetchingSeats] = useState<boolean>(false);
  const [busAvailability, setBusAvailability] = useState<Record<string, number>>({});
  
  // List of petugas options
  const petugasList = [
    'Raja Faza', 'Yusuf Apri', 'Andri Falah', 'Raul', 'Abdul Wahab', 'Anas Titah Prayogi', 
    'Rama Saputra Halim', 'Suhandoko', 'Jibril Aksan', 'Brilian Rizky', 'Abdurrahman', 'Johan Mahendra',
    'Bima Syafaat', 'Diaz Pambudi'
  ];
  
  // Parse group_pondok for umum passengers
  useEffect(() => {
    if (passenger.status === 'umum' && passenger.group_pondok) {
      try {
        // Format expected: U-DAERAH-KELOMPOK
        const parts = passenger.group_pondok.split('-');
        if (parts.length >= 2) {
          setDaerahPondok(parts[1]);
        }
        if (parts.length >= 3) {
          setKelompok(parts[2]);
        }
      } catch (error) {
        console.error('Error parsing group_pondok:', error);
      }
    }
  }, [passenger]);
  
  // Reset form when passenger changes
  useEffect(() => {
    if (passenger) {
      setName(passenger.name);
      setGender(passenger.gender);
      setAddress(passenger.address || '');
      setPhone(passenger.phone || '');
      setDestination(passenger.destination || '');
      setStatus(passenger.status || 'pondok');
      setGroupPondok(passenger.group_pondok || '');
      setMealCount(passenger.meal_count || 0);
      setMealPayment(passenger.meal_payment || 0);
      setPetugas(passenger.petugas || '');
      setBusId(passenger.bus_id || '');
      setSelectedSeatNumber(passenger.bus_seat_number || null);
    }
  }, [passenger]);
  
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
          
          // If this is the current bus of the passenger, add 1 to available count
          // because the passenger's current seat won't count against availability
          if (bus.id === passenger.bus_id) {
            availability[bus.id] = availability[bus.id] + 1;
          }
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
  }, [isOpen, passenger.bus_id]);
  
  // Fetch occupied seats when bus is selected
  useEffect(() => {
    const fetchBusSeats = async () => {
      if (!busId) {
        setOccupiedSeats([]);
        setSelectedSeatNumber(null);
        setSelectedBus(null);
        setTotalPayment(0);
        return;
      }
      
      setFetchingSeats(true);
      try {
        const seats = await getOccupiedSeats(busId);
        // Filter out the current passenger's seat if we're on the same bus
        const filteredSeats = busId === passenger.bus_id ? 
          seats.filter(seat => seat.id !== passenger.id) : seats;
        
        setOccupiedSeats(filteredSeats);
        
        // Fetch and set the selected bus details
        const bus = buses.find(b => b.id === busId);
        setSelectedBus(bus);
        
        // Update payment calculations based on status and bus
        if (bus) {
          updatePaymentCalculations(bus);
        }
      } catch (error) {
        console.error('Gagal memuat kursi yang ditempati:', error);
        toast.error('Gagal memuat informasi kursi');
      } finally {
        setFetchingSeats(false);
      }
    };
    
    fetchBusSeats();
  }, [busId, buses, status, passenger.bus_id, passenger.id]);
  
  // Update groupPondok based on daerahPondok and kelompok for umum passengers
  useEffect(() => {
    if (status === 'umum') {
      const prefix = daerahPondok ? `U-${daerahPondok}` : 'U-';
      setGroupPondok(kelompok ? `${prefix}-${kelompok}` : prefix);
    }
  }, [status, daerahPondok, kelompok]);
  
  // Update meal payment and total payment when meal count changes
  useEffect(() => {
    if (selectedBus) {
      updatePaymentCalculations(selectedBus);
    }
  }, [mealCount, status]);
  
  const updatePaymentCalculations = (bus) => {
    if (status === 'pondok') {
      setMealCount(0);
      setMealPayment(0);
      setTotalPayment(bus.fare_per_passenger);
    } else {
      const mealCost = mealCount * bus.meal_price;
      setMealPayment(mealCost);
      setTotalPayment(bus.fare_per_passenger + mealCost);
    }
  };
  
  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatus(value);
    
    if (value === 'pondok') {
      setMealCount(0);
      setMealPayment(0);
      setDaerahPondok('');
      setKelompok('');
      if (selectedBus) {
        setTotalPayment(selectedBus.fare_per_passenger);
      }
    } else { // umum
      if (selectedBus) {
        setMealCount(selectedBus.meal_count);
        const mealCost = selectedBus.meal_count * selectedBus.meal_price;
        setMealPayment(mealCost);
        setTotalPayment(selectedBus.fare_per_passenger + mealCost);
      }
      setGroupPondok('U-');
    }
  };
  
  const handleSeatSelect = (seatNumber: number) => {
    setSelectedSeatNumber(seatNumber);
  };
  
  const handleMealCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setMealCount(value);
    if (selectedBus) {
      const mealCost = value * selectedBus.meal_price;
      setMealPayment(mealCost);
      setTotalPayment(selectedBus.fare_per_passenger + mealCost);
    }
  };
  
  const handleSubmit = async () => {
    // Validate form data
    if (busId && !selectedSeatNumber) {
      toast.error('Silakan pilih nomor kursi');
      setShowConfirmDialog(false);
      return;
    }
    
    if (!petugas) {
      toast.error('Silakan pilih petugas');
      setShowConfirmDialog(false);
      return;
    }
    
    if (status === 'umum' && !phone) {
      toast.error('Nomor telepon wajib diisi untuk penumpang umum');
      setShowConfirmDialog(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('passengers')
        .update({
          name: name,
          gender: gender,
          address: address,
          phone: phone,
          destination: destination,
          status: status,
          group_pondok: groupPondok,
          petugas: petugas,
          bus_id: busId,
          bus_seat_number: selectedSeatNumber,
          meal_count: mealCount,
          meal_payment: mealPayment,
          total_payment: selectedBus.fare_per_passenger + mealPayment
        })
        .eq('id', passenger.id);
      
      if (error) throw error;
      
      // Success message
      toast.success('Data penumpang berhasil diperbarui');
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      queryClient.invalidateQueries({ queryKey: ['passenger', passenger.id] });
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      
      // Close the form
      onClose();
    } catch (error) {
      console.error('Error updating passenger:', error);
      toast.error('Terjadi kesalahan saat memperbarui data penumpang');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Data Penumpang</DialogTitle>
            <DialogDescription>
              Perbarui informasi penumpang di bawah ini
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
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
            
            {/* Status selection */}
            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup value={status} onValueChange={handleStatusChange} className="flex space-x-4">
                {PREDEFINED_PASSENGER_STATUS.map((s) => (
                  <div key={s} className="flex items-center space-x-2">
                    <RadioGroupItem value={s} id={`status-${s}`} />
                    <Label className="font-normal" htmlFor={`status-${s}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</Label>
                  </div>
                ))}
              </RadioGroup>
              <p className='text-gray-700 text-sm'>Santri, MT dan Siswa PKKPS masuk kategori pondok.</p>
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
            
            {/* Phone field - required for umum */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Nomor Telepon {status === 'umum' ? <span className="text-red-500">(wajib)</span> : <span className="text-red-500">(opsional)</span>}
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Masukkan nomor telepon"
                required={status === 'umum'}
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
              
              {status === 'pondok' ? (
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
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="daerahPondok">Daerah/Pondok</Label>
                    <Input
                      id="daerahPondok"
                      value={daerahPondok}
                      onChange={(e) => setDaerahPondok(e.target.value)}
                      placeholder="Masukkan daerah/pondok"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kelompok">Kelompok</Label>
                    <Input
                      id="kelompok"
                      value={kelompok}
                      onChange={(e) => setKelompok(e.target.value)}
                      placeholder="Masukkan kelompok"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previewGroupPondok">Preview Kelompok</Label>
                    <Input
                      id="previewGroupPondok"
                      value={groupPondok}
                      disabled
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bus">Pilih Bus</Label>
              <Select value={busId} onValueChange={(e) => {
                setBusId(busId === "none" ? "" : e)
                setSelectedSeatNumber(null);
              }} required>
                <SelectTrigger id="bus">
                  <SelectValue placeholder="Pilih bus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada bus</SelectItem>
                  {buses.map(bus => {
                    const isAvailable = (busAvailability[bus.id] || 0) > 0;
                    const isCurrentBus = bus.id === passenger.bus_id;
                    return (
                      <SelectItem 
                        key={bus.id} 
                        value={bus.id}
                        disabled={!isAvailable && !isCurrentBus}
                      >
                        {`${bus.destination} #${bus.bus_number}`} 
                        {isAvailable 
                          ? ` (${busAvailability[bus.id]} kursi tersedia)` 
                          : isCurrentBus ? ' (Kursi Anda)' : ' (PENUH)'}
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
                      disabled={isSubmitting}
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

            {/* Meal count and price - only editable for umum */}
            {status === 'umum' && selectedBus && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mealCount">Jumlah Makan</Label>
                  <Input
                    id="mealCount"
                    type="number"
                    min="0"
                    value={mealCount}
                    onChange={handleMealCountChange}
                    required={status === 'umum'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mealPayment">Biaya Makan</Label>
                  <Input
                    id="mealPayment"
                    value={mealPayment.toLocaleString('id-ID')}
                    disabled
                  />
                  {selectedBus && (
                    <p className="text-xs text-muted-foreground">
                      Harga per porsi: Rp{selectedBus.meal_price.toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Total Payment Preview */}
            {selectedBus && (
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="totalPayment">Total Pembayaran</Label>
                <Input
                  id="totalPayment"
                  value={`Rp${totalPayment.toLocaleString('id-ID')}`}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  {status === 'pondok' 
                    ? `Biaya perjalanan: Rp${selectedBus.fare_per_passenger.toLocaleString('id-ID')}`
                    : `Biaya perjalanan (Rp${selectedBus.fare_per_passenger.toLocaleString('id-ID')}) + Biaya makan (Rp${mealPayment.toLocaleString('id-ID')})`
                  }
                </p>
              </div>
            )}
            
            {/* Petugas Select field */}
            <div className="space-y-2">
              <Label htmlFor="petugas">Petugas</Label>
              <Select value={petugas} onValueChange={setPetugas} required>
                <SelectTrigger id="petugas">
                  <SelectValue placeholder="Pilih petugas" />
                </SelectTrigger>
                <SelectContent>
                  {petugasList.map(name => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                (busId && !selectedSeatNumber) || 
                fetchingSeats || 
                !petugas || 
                (status === 'umum' && !phone) ||
                (status === 'umum' && (!daerahPondok || !kelompok))
              }
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