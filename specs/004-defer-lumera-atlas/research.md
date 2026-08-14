# Phase 0 Research: Lumera Atlas Ditunda ke Pengembangan Berikutnya

## Temuan utama: ada generasi UI kedua yang sudah lengkap, hanya tidak terpasang

Investigasi repositori (dipicu oleh FR-001/FR-005 spec.md, yang mensyaratkan entry point tanpa
Atlas) menemukan bahwa aplikasi punya **dua generasi UI paralel** untuk katalog/pelajaran, bukan
satu:

**Generasi 1 (live, dirender `App.tsx` → `StudentApp.tsx`)**:
- `src/student/StudentScreens.tsx` (`HomeScreen`, dll.) + `src/student/catalog.ts`
  (`StudentModuleSummary` dengan id seperti `'bilangan-di-bawah-nol'`, `'operasi-bilangan-bulat'`)
  + `src/student/IntegerCourseScreen.tsx`.
- Konten katalognya ("Bilangan Bulat") **tidak terkait** dengan 4 modul `LessonShell` yang
  terdaftar di `src/modules/index.ts` (`math-slope`, `physics-motion`, `econ-supply-demand`,
  `history-causal-chain`) — id-nya berbeda semesta sama sekali.
- Saat siswa mengklik modul apa pun di sini, `StudentApp.tsx` (`onOpenModule={setSelectedModule}`)
  hanya menampilkan `InfoDrawer` berisi "Pelajaran interaktif untuk modul ini hadir pada batch
  berikutnya." — tidak pernah merender `LessonShell`.

**Generasi 2 (dibangun, diuji unit, tapi TIDAK PERNAH dipasang ke `App.tsx`/`main.tsx`)**:
- `src/atlas/Atlas.tsx` (367 baris), `src/beranda/Beranda.tsx` (310 baris),
  `src/courses/Belajar.tsx` (240 baris), `src/courses/KursusDetail.tsx` (250 baris) — total ~1167
  baris.
- Didukung `src/courses/katalog.ts` (katalog statis lengkap yang memetakan jalur/kursus/level/
  pelajaran ke `MODULE_META` — metadata 4 modul asli), `src/courses/simpul.ts` (layout node untuk
  Atlas), `src/courses/Progres.tsx` (ring progres), `src/beranda/harian.ts` (streak/target harian).
- Setiap komponen sudah menerima `siswa: Siswa` (store progres nyata, bukan fixture) dan callback
  `onMulai`/`onMulaiPelajaran(moduleId: string)` yang dipanggil dengan id modul asli (mis.
  `'math-slope'`) — dikonfirmasi lewat `tests/unit/layar-belajar.test.tsx`
  (`expect(onMulai).toHaveBeenCalledWith('math-slope')`).
- **Tidak ada satu pun berkas** (produksi maupun test) yang benar-benar merender `<LessonShell>`
  sebagai respons callback ini — rantainya berhenti tepat sebelum titik peluncuran pelajaran.
- Dua berkas lain juga mengimpor `MODULE_META` tapi sama-sama tidak pernah diimpor siapa pun:
  `src/shell/HeaderNav.tsx` (nav chrome alternatif untuk `StudentShell`) dan
  `src/progress/ProgressSummary.tsx` (ringkasan progres alternatif untuk `ProgressScreen`).

Singkatnya: generasi 2 adalah "aplikasi yang seharusnya" — katalog dan progresnya sudah benar
secara data — tapi tidak pernah disatukan menjadi satu pohon komponen yang bisa dijangkau
pengguna, dan `LessonShell` (alur 7 langkah yang sudah stabil dan diuji sejak spec 001) tidak
pernah disambungkan ke ujungnya.

## Decision 1: Entry point interim rilis ini = generasi 2 (Beranda/KursusDetail/Belajar), bukan
membangun ulang di atas generasi 1

**Rationale**: Generasi 2 sudah selesai, teruji terisolasi, dan sudah berbicara dengan tipe data
yang benar (`Siswa`, `MODULE_META`/`AnyLessonModule`). Menyambungkan `LessonShell` ke ujungnya
adalah pekerjaan kecil (kontrak `LessonShell` hanya butuh `modul`, `onKeluar`, `onSelesai`).
Sebaliknya, membangun jalur baru di atas generasi 1 (`catalog.ts`/`IntegerCourseScreen`) berarti
menciptakan pemetaan baru dari id konten "Bilangan Bulat" yang tidak terkait ke 4 modul konstitusi
yang sebenarnya — pekerjaan dua kali lebih besar untuk hasil yang sama, dan tetap tidak akan
mewakili 4 modul yang benar-benar sudah dibangun dan diverifikasi.

**Alternatives considered**:
- *Bangun wiring baru di atas `HomeScreen`/`catalog.ts` generasi 1* — ditolak: catalog ini secara
  konten tidak overlap dengan 4 modul `LessonShell`; menambah modul baru ke situ berarti membangun
  konten "Bilangan Bulat" jadi modul 7-langkah dari nol, bukan menyambungkan yang sudah ada.
- *Pasang Atlas seperti rencana awal* — ditolak oleh spec 004 sendiri (US1 spec 004 secara eksplisit
  menunda Atlas).
- *Biarkan InfoDrawer "coming soon" apa adanya* — ditolak: ini persis kondisi yang membuat spec 004
  dibuat (loop inti tidak bisa dicoba siapa pun).

## Decision 2: `HeaderNav`/`ProgressSummary` (nav & ringkasan progres generasi-2) TIDAK ikut
dipasang bersamaan

**Rationale**: Keduanya bukan bagian dari "fitur Atlas" secara harfiah (tidak disebut di spec.md),
tapi sama-sama komponen generasi-2 yang belum pernah dipasang. Memasang keduanya berarti mengganti
seluruh chrome navigasi (`StudentShell`) yang sudah live, teruji, dan menangani banyak hal di luar
cakupan spec ini (aksesibilitas keyboard, pencarian `Ctrl+K`, bottom-nav mobile — lihat
`specs/002-production-readiness`). Itu perubahan jauh lebih besar dan berisiko daripada yang
dibutuhkan untuk sekadar membuat loop inti bisa dicoba. Memisahkan keputusan ini menjaga spec 004
tetap surgical: hanya menyambungkan cukup untuk "pilih pelajaran → selesaikan", bukan mendesain
ulang seluruh navigasi aplikasi.

**Alternatives considered**:
- *Pasang sekalian sebagai "sudah di sini juga"* — ditolak: scope creep, menaikkan risiko regresi
  pada nav yang sudah teruji berat di spec 002 (US9 aksesibilitas), tanpa diminta oleh spec 004.

**Konsekuensi**: `src/shell/HeaderNav.tsx` dan `src/progress/ProgressSummary.tsx` tetap orphan
setelah spec ini — dicatat sebagai keputusan terpisah untuk pengembangan berikutnya (bukan bagian
dari backlog Atlas, tapi bucket "UI generasi-2 belum terpasang" yang sama disebut di
`specs/001-core-mvp-prototype/tasks.md` T089).

## Decision 3: Mekanisme peluncuran `LessonShell`

**Rationale**: Pola yang sudah ada di `StudentApp.tsx` untuk `selectedModule` (state + render
kondisional sebagai overlay) dipakai ulang: saat `onMulai`/`onMulaiPelajaran(id)` terpanggil,
`StudentApp` memanggil `muatModul(id)` (async, sudah ada di `src/modules/index.ts`), lalu merender
`<LessonShell modul={...} onKeluar={...} onSelesai={...} />` sebagai pengganti `InfoDrawer` "coming
soon". `onSelesai` MUST memicu `setSiswa(bacaSiswa())` (pola yang sudah dipakai `StudentApp` untuk
impor/hapus-data) supaya layar yang menampilkan progres langsung mencerminkan data terbaru tanpa
reload (memenuhi FR-005 spec.md / T087 spec 001).

**Alternatives considered**:
- *Route terpisah (`#/pelajaran/:id`) alih-alih overlay state* — dipertimbangkan tapi tidak
  dipilih untuk rilis ini: pola hash-routing `StudentApp` saat ini (`parseStudentHash`) tidak
  dirancang untuk parameter dinamis; menambah itu adalah perubahan routing yang lebih besar dari
  yang dibutuhkan. Overlay state konsisten dengan pola `selectedModule`/`selectedConcept` yang
  sudah ada dan teruji.

## Resolved unknowns (Technical Context)

Tidak ada `NEEDS CLARIFICATION` tersisa di Technical Context plan.md — seluruh keputusan teknis di
atas menjawabnya langsung dari kondisi kode yang sudah ada, tanpa memerlukan pilihan
teknologi/dependency baru.
