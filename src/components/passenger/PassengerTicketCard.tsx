import { Passenger } from "@/lib/supabase"

interface PassengerTicketCardProps {
  passenger: Passenger
}

export default function PassengerTicketCard({ passenger}: PassengerTicketCardProps) {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  // Calculate age based on created_at date
  const today = new Date()

  return (
    <div id="print" className="w-full mx-auto bg-white shadow-md rounded-md overflow-hidden print:shadow-none">
      <div className="flex flex-col md:flex-row border border-black">
        {/* Left section - Main passenger info */}
        <div className="w-full p-3 border-r border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center align-middle">
              <div className="mx-auto p-2">
                <img src="/logo.png" width={60} height={60} />
              </div>
              <div className="text-center">
                <h1 className="text-md font-bold">PONDOK PESANTREN WALI BAROKAH KOTA KEDIRI</h1>
                <p className="text-xs">Sekretariat: Jl. Hos Cokroaminoto No.195, Kota Kediri, Jawa Timur, Indonesia</p>
                <p className="text-xs">Telp. (0354) 687367 - 681167 | website: www.walibarokah.org</p>
              </div>
            </div>
          </div>

          <div className="border-t border-b border-gray-300 mt-3"></div>

          <div className="grid grid-cols-2 mt-2">

            <div className="flex text-sm">
              <p className="w-20 font-medium">Bus</p>
              <p className="w-4">:</p>
              <p>{passenger.bus?.destination + " #" + passenger.bus?.bus_number || "-"}</p>
            </div>

            <div className="flex text-sm">
              <p className="w-24 font-medium">Nomor Kursi</p>
              <p className="w-4">:</p>
              <p>{passenger.bus_seat_number}</p>
            </div>

            <div className="flex text-sm">
              <p className="w-20 font-medium">Nama</p>
              <p className="w-4">:</p>
              <p>{passenger.name}</p>
            </div>
            <div className="flex text-sm">
              <p className="w-24 font-medium">Jenis Kelamin</p>
              <p className="w-4">:</p>
              <p>{passenger.gender === "L" ? "Laki-laki" : "Perempuan"}</p>
            </div>

            <div className="flex text-sm">
              <p className="w-20 font-medium">Kelompok</p>
              <p className="w-4">:</p>
              <p>{passenger.group_pondok}</p>
            </div>

            <div className="flex text-sm">
              <p className="w-24 font-medium">Kota Tujuan</p>
              <p className="w-4">:</p>
              <p>{passenger.destination}</p>
            </div>
            
          </div>

          <div className="mt-8 grid grid-cols-2">
            <div>
              <p className="font-medium underline text-sm">Alamat Lengkap:</p>
              <p className="text-sm">{passenger.address}</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Kediri, {currentDate}</p>
              <p className="text-sm">Petugas,</p>
              <div className="h-10"></div>
              <p>( ________________________ )</p>
            </div>
          </div>
        </div>

        {/* Right section - Payment details */}
        <div className="w-full md:w-1/4 p-4">
          <div className="border-b border-gray-300 pb-2 mb-4">
            <h2 className="font-semibold text-center">DETAIL PEMBAYARAN</h2>
          </div>

          <div className="flex mb-2">
            <p className="w-24 font-medium text-sm">Keperluan</p>
            <p className="w-4">:</p>
            <p className="text-sm">Tiket Bus</p>
          </div>

          <div className="border-t border-gray-300 my-4"></div>

          <div className="flex flex-col font-bold">
            <p>TOTAL</p>
            <div className="flex">
              <p>Rp.</p>
              <p className="w-20 text-right">{passenger.total_payment.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

