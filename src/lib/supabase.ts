
import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://kcowmghdgmumnkaqngiz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb3dtZ2hkZ211bW5rYXFuZ2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzOTU0ODIsImV4cCI6MjA1Njk3MTQ4Mn0.kD50v_oFQMd_wtVPBd-vUpWLQUe_12hCnSXnyF-dxCI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our application
export type Bus = {
  id: string;
  destination: string;
  bus_number: number;
  max_passengers: number;
  meal_count: number;
  meal_price: number;
  fare_per_passenger: number;
  created_at: string;
};

export type Passenger = {
  id: string;
  name: string;
  gender: 'L' | 'P';
  address: string;
  phone: string;
  destination: string;
  status: string;
  group_pondok: string;
  bus_seat_number: number;
  meal_count: number;
  meal_payment: number;
  total_payment: number;
  petugas: string;
  bus_id: string | null;
  created_at: string;
  // For UI only, not in database
  bus?: Bus;
};

// Destinations
export const PREDEFINED_DESTINATIONS = [
  'Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Solo', 'Malang', 'Semarang', 'Bali'
];

export const PREDEFINED_PASSENGER_STATUS = [
  'pondok', 'umum'
];

// Helper functions
export async function fetchBuses() {
  const { data, error } = await supabase
    .from('buses')
    .select('*')
    .order('destination', { ascending: true })
    .order('bus_number', { ascending: true });
  
  if (error) {
    console.error('Error fetching buses:', error);
    throw error;
  }
  
  return data as Bus[];
}

export async function fetchPassengers() {
  const { data, error } = await supabase
    .from('passengers')
    .select(`
      *,
      bus:buses(*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching passengers:', error);
    throw error;
  }
  
  return data as Passenger[];
}

export async function fetchPassengerById(id: string) {
  const { data, error } = await supabase
    .from('passengers')
    .select(`
      *,
      bus:buses(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching passenger:', error);
    throw error;
  }
  
  return data as Passenger;
}

export async function fetchBusById(id: string) {
  const { data, error } = await supabase
    .from('buses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching bus:', error);
    throw error;
  }
  
  return data as Bus;
}

export async function addBus(bus: Omit<Bus, 'id' | 'created_at' | 'bus_number'>) {
  // Get the next bus number for this destination
  const { data: lastBus } = await supabase
    .from('buses')
    .select('bus_number')
    .eq('destination', bus.destination)
    .order('bus_number', { ascending: false })
    .limit(1);
  
  const nextBusNumber = lastBus && lastBus.length > 0 ? (lastBus[0].bus_number + 1) : 1;
  
  const { data, error } = await supabase
    .from('buses')
    .insert([{ ...bus, bus_number: nextBusNumber }])
    .select();
  
  if (error) {
    console.error('Error adding bus:', error);
    throw error;
  }
  
  return data[0] as Bus;
}

export async function updatePassenger(id: string, updatedFields: Partial<Passenger>) {
  const { data, error } = await supabase
    .from('passengers')
    .update(updatedFields)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating passenger:', error);
    throw error;
  }
  
  return data[0] as Passenger;
}

export async function addPassenger(passenger: Omit<Passenger, 'id' | 'created_at' | 'total_payment'> & { bus_id: string }) {
  // Get the selected bus details
  const bus = await fetchBusById(passenger.bus_id);
  
  // Calculate total payment based on bus fare
  const totalPayment = bus.fare_per_passenger + (passenger.meal_count * bus.meal_price);
  
  const { data, error } = await supabase
    .from('passengers')
    .insert([{ 
      ...passenger, 
      total_payment: totalPayment 
    }])
    .select();
  
  if (error) {
    console.error('Error adding passenger:', error);
    throw error;
  }
  
  return data[0] as Passenger;
}

export async function getAvailableSeatsCount(busId: string) {
  // Get the bus details
  const bus = await fetchBusById(busId);
  
  // Get the occupied seats
  const { data: occupiedSeats, error } = await supabase
    .from('passengers')
    .select('id')
    .eq('bus_id', busId);
  
  if (error) {
    console.error('Error getting occupied seats:', error);
    throw error;
  }
  
  const occupiedSeatCount = occupiedSeats?.length || 0;
  return bus.max_passengers - occupiedSeatCount;
}

export async function getOccupiedSeats(busId: string) {
  const { data, error } = await supabase
    .from('passengers')
    .select('id, gender, bus_seat_number')
    .eq('bus_id', busId)
    .order('bus_seat_number', { ascending: true });
  
  if (error) {
    console.error('Error fetching occupied seats:', error);
    throw error;
  }
  
  return data as { id: string; gender: 'L' | 'P'; bus_seat_number: number }[];
}

export async function fetchPassengerCounts() {
  const { data, error } = await supabase
    .from('passengers')
    .select('bus_id');

  if (error) {
    console.error('Error fetching passenger counts:', error);
    throw error;
  }

  // Count passengers per bus
  const counts: Record<string, number> = {};
  data.forEach(({ bus_id }) => {
    if (bus_id) {
      counts[bus_id] = (counts[bus_id] || 0) + 1;
    }
  });

  return counts;
}

// Subscribe to real-time updates
export function subscribeToUpdates(
  table: 'buses' | 'passengers',
  callback: (payload: any) => void
) {
  return supabase
    .channel(`${table}-channel`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table }, 
      callback
    )
    .subscribe();
}

export async function generatePassengerExcel() {
  const passengers = await fetchPassengers();
  
  // Group passengers by bus
  const buses = {};
  passengers.forEach(passenger => {
    if (!passenger.bus) return;
    const sheetName = `${passenger.bus.destination} ${passenger.bus.bus_number}`;
    if (!buses[sheetName]) {
      buses[sheetName] = [];
    }
    buses[sheetName].push(passenger);
  });

  const workbook = new ExcelJS.Workbook();
  
  Object.entries(buses).forEach(([sheetName, passengers]: [string, Passenger[]]) => {
    const sheet = workbook.addWorksheet(sheetName);
    
    // Define headers
    sheet.columns = [
      { header: 'Nama', key: 'name', width: 20 },
      { header: 'L/P', key: 'gender', width: 10 },
      { header: 'Alamat', key: 'address', width: 30 },
      { header: 'Destination', key: 'destination', width: 20 },
      { header: 'Klp', key: 'group_pondok', width: 15 },
      { header: 'Dapur', key: 'dapur', width: 15 },
      { header: 'Nomor', key: 'bus_seat_number', width: 10 },
      { header: 'Telepon', key: 'phone', width: 10 },
      { header: 'Pembayaran', key: 'total_payment', width: 15 },
      { header: 'Tanggal Pemesanan', key: 'created_at', width: 20 }
    ];
    
    // Sort passengers by gender first, then name
    passengers.sort((a, b) => {
      if (a.gender !== b.gender) {
        return a.gender.localeCompare(b.gender);
      }
      return a.name.localeCompare(b.name);
    });
    
    // Add data rows
    passengers.forEach(passenger => {
      const dapurKeywords = ['Guru', 'Pembina', 'Wustha', 'Ulya', 'Kelas', 'Firma', 'listrik', 'UKP', 'UB', "GP", "GB", "CBR", "Database", "Wustho", "Ketua", "Putri"];
      const dapur = dapurKeywords.some(keyword => passenger.group_pondok.toLowerCase().includes(keyword.toLowerCase())) ? 'Firma' : 'Mbahman';
      
      sheet.addRow({
        name: passenger.name,
        gender: passenger.gender,
        address: passenger.address,
        destination: passenger.destination,
        group_pondok: passenger.group_pondok,
        dapur: dapur,
        bus_seat_number: passenger.bus_seat_number,
        phone: passenger.phone,
        total_payment: passenger.total_payment,
        created_at: new Date(passenger.created_at).toLocaleDateString()
      });
    });
  });

  // Write to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Create a Blob and trigger download
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Export Penumpang.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}
