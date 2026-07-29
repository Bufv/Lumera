# Contract: Learning Event Log

**Feature**: `001-core-mvp-prototype` | **Date**: 2026-07-29

Kontrak data instrumentasi (FR-015, Prinsip VI). Knowledge Bank dan Refresh Harian belum dibangun,
tapi keduanya nanti bergantung penuh pada data ini — dan data yang tidak direkam hari ini hilang
permanen. Karena itu bentuknya dikunci sekarang, bukan nanti.

## Prinsip penyimpanan

Seluruh penulisan lewat satu adapter dengan antarmuka **async**, meski implementasi awalnya
`localStorage` yang sinkron (R-002). Saat backend dibangun, hanya isi adapter yang berubah; tidak
ada pemanggil yang perlu disentuh.

```ts
interface TelemetryAdapter {
  record(event: LearningEvent): Promise<void>;
  readAll(): Promise<LearningEvent[]>;   // untuk verifikasi SC-006
}
```

## Event

### `lesson_completed`

Satu-satunya event yang **wajib** ada di prototype ini. Terbit **hanya** saat siswa menekan
"Lanjutkan" di langkah 7.

```ts
interface LessonCompletedEvent {
  type: 'lesson_completed';
  eventId: string;
  siswaId: string;
  moduleId: string;
  conceptIds: string[];          // wajib non-kosong
  mistakes: MistakeEntry[];      // boleh kosong
  durasiMs: number;              // wajib > 0
  selesaiPada: string;           // ISO 8601
  schemaVersion: 1;
}

interface MistakeEntry {
  conceptId: string;
  mistakeType: string;
  nomorPercobaan: number;
}
```

**Ketiga data minimal Prinsip VI dipetakan sebagai**: konsep → `conceptIds`, kesalahan →
`mistakes`, waktu pengerjaan → `durasiMs`.

### Event yang sengaja TIDAK dibuat

- `lesson_abandoned` — FR-014 melarang pelajaran yang ditinggalkan dihitung. Kalau nanti dibutuhkan
  untuk analitik funnel, itu keputusan spec lain.
- `step_viewed` — tidak ada requirement yang membutuhkannya; menambahkannya sekarang adalah
  instrumentasi spekulatif.

## Aturan yang mengikat

1. **Terbit tepat sekali per pelajaran yang selesai.** Penerbitan ganda merusak perhitungan mastery
   dan Lumens.

2. **Tidak terbit untuk pelajaran yang ditinggalkan** (FR-014).

3. **Validasi sebelum tulis.** Event yang melanggar aturan field (misal `conceptIds` kosong,
   `durasiMs` ≤ 0) MUST ditolak dan dicatat sebagai error yang terlihat — **bukan** gagal diam-diam.
   Kegagalan senyap adalah mode kegagalan paling berbahaya di sini: demo manual tetap terlihat
   normal sementara datanya tidak pernah tersimpan.

4. **`schemaVersion` wajib disertakan** sejak event pertama, supaya migrasi ke backend nanti bisa
   membedakan data lama.

5. **`durasiMs` mengukur waktu aktif pengerjaan**, dihitung dari langkah 1 sampai penekanan
   "Lanjutkan".

## Cara memverifikasi (SC-006)

`readAll()` sengaja ada di kontrak agar klaim "100% pelajaran selesai menghasilkan catatan lengkap"
bisa dibuktikan, bukan diasumsikan. Prosedurnya ada di [quickstart.md](../quickstart.md).
