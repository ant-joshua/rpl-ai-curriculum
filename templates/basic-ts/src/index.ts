/**
 * Basic TypeScript Starter
 * Contoh program sederhana untuk memulai project TypeScript.
 */

// === Tipe data dasar ===
const nama: string = "RPL AI";
const tahun: number = 2025;
const aktif: boolean = true;

// === Interface ===
interface Mahasiswa {
  id: number;
  nama: string;
  kelas: string;
  nilai: number;
}

// === Fungsi dengan tipe ===
function sapa(mahasiswa: Mahasiswa): string {
  return `Halo ${mahasiswa.nama} dari kelas ${mahasiswa.kelas}! Nilai: ${mahasiswa.nilai}`;
}

// === Generic function ===
function ambilPertama<T>(arr: T[]): T | undefined {
  return arr[0];
}

// === Async/await ===
async function fetchData(): Promise<string> {
  return "Data berhasil dimuat";
}

// === Main ===
async function main() {
  const siswa: Mahasiswa = {
    id: 1,
    nama: "Budi",
    kelas: "XII RPL 1",
    nilai: 90,
  };

  console.log(sapa(siswa));
  console.log("Nama project:", nama);
  console.log("Tahun:", tahun);
  console.log("Aktif:", aktif);

  const numbers = [10, 20, 30];
  console.log("Pertama:", ambilPertama(numbers));

  const data = await fetchData();
  console.log(data);

  // === Array methods dengan tipe ===
  const nilaiList: number[] = [85, 90, 78, 92, 88];
  const rataRata = nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length;
  console.log("Rata-rata nilai:", rataRata.toFixed(2));

  // === Map dengan tipe ===
  const nilaiMap = new Map<string, number>([
    ["Matematika", 90],
    ["Fisika", 85],
    ["Kimia", 88],
  ]);
  console.log("Nilai Matematika:", nilaiMap.get("Matematika"));
}

main().catch(console.error);
