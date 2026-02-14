import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchPeriods, 
  createPeriod, 
  updatePeriod, 
  activatePeriod, 
  lockPeriod, 
  archivePeriod,
  deletePeriod, 
  Period 
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Calendar, CheckCircle, Lock, Archive, Edit, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import FloatingActionButton from '@/components/layout/FloatingActionButton';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Periods = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [defaultFare, setDefaultFare] = useState('');
  const [notes, setNotes] = useState('');

  const { data: periods, isLoading } = useQuery({
    queryKey: ['periods'],
    queryFn: () => fetchPeriods(),
  });

  const createMutation = useMutation({
    mutationFn: createPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      toast.success('Periode berhasil dibuat');
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Gagal membuat periode: ' + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Period> }) => updatePeriod(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      toast.success('Periode berhasil diperbarui');
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Gagal memperbarui periode: ' + error.message);
    }
  });

  const activateMutation = useMutation({
    mutationFn: activatePeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      toast.success('Periode berhasil diaktifkan');
    },
    onError: (error) => {
      toast.error('Gagal mengaktifkan periode: ' + error.message);
    }
  });

  const lockMutation = useMutation({
    mutationFn: lockPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      toast.success('Periode berhasil dikunci');
    },
    onError: (error) => {
      toast.error('Gagal mengunci periode: ' + error.message);
    }
  });

  const archiveMutation = useMutation({
    mutationFn: archivePeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      toast.success('Periode berhasil diarsipkan');
    },
    onError: (error) => {
      toast.error('Gagal mengarsipkan periode: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      toast.success('Periode berhasil dihapus');
    },
    onError: (error) => {
      toast.error('Gagal menghapus periode: ' + error.message);
    }
  });

  const resetForm = () => {
    setName('');
    setType('');
    setStartDate('');
    setEndDate('');
    setDefaultFare('');
    setNotes('');
    setSelectedPeriod(null);
  };

  const handleEditClick = (period: Period) => {
    setSelectedPeriod(period);
    setName(period.name);
    setType(period.type || '');
    setStartDate(period.start_date || '');
    setEndDate(period.end_date || '');
    setDefaultFare(period.default_fare?.toString() || '');
    setNotes(period.notes || '');
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent, isEdit: boolean) => {
    e.preventDefault();
    const periodData = {
      name,
      type: type || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      default_fare: defaultFare ? parseInt(defaultFare) : undefined,
      notes: notes || undefined,
      // status field is handled by mutations directly or default (DRAFT)
    };

    if (isEdit && selectedPeriod) {
      updateMutation.mutate({ id: selectedPeriod.id, updates: periodData });
    } else {
      createMutation.mutate(periodData as any);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500 hover:bg-green-600">ACTIVE</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">DRAFT</Badge>;
      case 'LOCKED':
        return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">LOCKED</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline">ARCHIVED</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: idLocale });
  };

  return (
    <div className="container mx-auto pb-24 px-4 pt-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Periode</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola periode operasional untuk pendaftaran dan data bus
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : periods?.map((period) => (
          <Card key={period.id} className={`relative overflow-hidden ${period.status === 'ACTIVE' ? 'border-green-500 border-2 shadow-md' : ''}`}>
             <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold truncate max-w-[200px]" title={period.name}>
                  {period.name}
                </CardTitle>
                {getStatusBadge(period.status)}
              </div>
              <p className="text-xs text-muted-foreground">
                {period.type || 'Umum'}
              </p>
            </CardHeader>
            <CardContent className="text-sm space-y-2 pb-2">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-muted-foreground" />
                <span>
                  {period.start_date ? formatDate(period.start_date) : 'Belum ditentukan'} 
                  {' - '} 
                  {period.end_date ? formatDate(period.end_date) : 'Belum ditentukan'}
                </span>
              </div>
              {period.notes && (
                <div className="bg-muted p-2 rounded text-xs select-all">
                  {period.notes}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2 flex justify-end gap-2 border-t mt-2">
              {/* Actions based on status */}
              
              {(period.status === 'DRAFT' || period.status === 'LOCKED' || period.status === 'ARCHIVED') && (
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 h-8">
                      <CheckCircle size={14} className="mr-1" /> Aktifkan
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Aktifkan Periode?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Mengaktifkan periode ini akan otomatis mengunci (LOCK) periode aktif sebelumnya.
                        Hanya satu periode yang bisa aktif dalam satu waktu.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => activateMutation.mutate(period.id)}>
                        Ya, Aktifkan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {(period.status === 'ACTIVE' || period.status === 'DRAFT') && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 h-8">
                      <Lock size={14} className="mr-1" /> Kunci
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Kunci Periode?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Periode yang dikunci tidak dapat menerima data baru (bus/penumpang).
                        Anda tidak dapat mengubahnya kembali menjadi DRAFT, tapi bisa mengaktifkannya kembali jika perlu.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => lockMutation.mutate(period.id)}>
                        Kunci
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Button size="sm" variant="ghost" className="h-8" onClick={() => handleEditClick(period)}>
                 <Edit size={14} />
              </Button>
              
              {period.status !== 'ACTIVE' && period.status !== 'ARCHIVED' && (
                 <AlertDialog>
                 <AlertDialogTrigger asChild>
                   <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-600 h-8">
                     <Archive size={14} />
                   </Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                   <AlertDialogHeader>
                     <AlertDialogTitle>Arsipkan Periode?</AlertDialogTitle>
                     <AlertDialogDescription>
                       Periode yang diarsipkan akan disembunyikan dari daftar utama (kecuali ada filter).
                       Aksi ini tidak menghapus data.
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                     <AlertDialogCancel>Batal</AlertDialogCancel>
                     <AlertDialogAction onClick={() => archiveMutation.mutate(period.id)}>
                       Arsipkan
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
              )}

              {period.status !== 'ACTIVE' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 h-8">
                      <Trash2 size={14} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Periode?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus periode ini?
                        Data yang sudah dihapus tidak dapat dikembalikan.
                        Jika periode memiliki data bus atau penumpang, penghapusan mungkin gagal.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteMutation.mutate(period.id)}>
                        Hapus Permanen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add Period Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Periode Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Periode</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Mudik 2024" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipe (Opsional)</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mudik">Mudik</SelectItem>
                  <SelectItem value="Balik">Balik</SelectItem>
                  <SelectItem value="Wisata">Wisata</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Tanggal Mulai</Label>
                <Input id="start_date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Tanggal Selesai</Label>
                <Input id="end_date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_fare">Tarif Standar (Opsional)</Label>
              <Input id="default_fare" type="number" value={defaultFare} onChange={e => setDefaultFare(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan tambahan..." />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Period Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Periode</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Periode</Label>
              <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipe (Opsional)</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mudik">Mudik</SelectItem>
                  <SelectItem value="Balik">Balik</SelectItem>
                  <SelectItem value="Wisata">Wisata</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start_date">Tanggal Mulai</Label>
                <Input id="edit-start_date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end_date">Tanggal Selesai</Label>
                <Input id="edit-end_date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="edit-default_fare">Tarif Standar</Label>
              <Input id="edit-default_fare" type="number" value={defaultFare} onChange={e => setDefaultFare(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Catatan</Label>
              <Textarea id="edit-notes" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <FloatingActionButton onClick={() => {
        resetForm();
        setIsAddDialogOpen(true);
      }} />
      
      <BottomNavigation />
    </div>
  );
};

export default Periods;
