\## 1. Tech Stack yang Direkomendasikan



| Layer | Pilihan | Alasan |

|---|---|---|

| Frontend | React + TypeScript | Cocok untuk komponen interaktif (slider, drag-drop, grafik) yang reusable antar modul |

| Visualisasi/simulasi | SVG custom + library ringan (misal D3 untuk grafik, atau canvas manual untuk animasi gerak) | Kontrol penuh atas animasi, hindari "AI illustration generik" (Principle #7) |

| State management | React state/hooks lokal per lesson dulu | Prototype belum butuh state global kompleks — hindari over-engineering di tahap ini |

| Styling | Design token terpisah (warna, tipografi) sesuai palet Bagian 7 PRD | Supaya konsisten "Soft Academic Adventure" di semua modul sejak awal, bukan didesain ulang belakangan |

| Data logging (Principle #6) | Event lokal sederhana (concept\_id, mistake\_type, duration) disimpan dulu ke local state/storage sementara | Belum perlu backend — cukup skema data yang \*siap\* dicolok ke backend nanti |

| Backend/persistence | \*\*Belum dibangun di tahap ini\*\* — cukup mock/local | MVP prototype fokus ke pengalaman belajar, bukan infrastruktur |



\## 2. Arsitektur Komponen (mengikat Principle #2 — 7 langkah non-negotiable)



Buat \*\*satu shared "Lesson Shell" component\*\* yang menjalankan alur 7 langkah, lalu setiap modul (Fisika, Ekonomi, dst.) hanya mengisi "slot" Step 2 (Model visual) dan Step 3 (Aksi pengguna) dengan komponen interaksinya sendiri.



```

LessonShell

&#x20;├─ Step1\_Prompt

&#x20;├─ Step2\_VisualModel      ← slot berbeda per modul (slider/drag-drop/grafik)

&#x20;├─ Step3\_UserAction       ← slot berbeda per modul

&#x20;├─ Step4\_InstantFeedback  ← shared logic (benar/salah + animasi feedback)

&#x20;├─ Step5\_WhyExplanation   ← shared modal component

&#x20;├─ Step6\_Reflection

&#x20;└─ Step7\_Continue

```



\*\*Kenapa ini penting secara arsitektur:\*\* kalau tiap modul dibuat sebagai halaman terpisah tanpa shell bersama, Principle #2 akan gampang dilanggar diam-diam (developer lain bikin modul baru, lupa satu langkah). Shell yang shared membuat pelanggaran itu sulit terjadi secara struktural, bukan cuma diandalkan pada disiplin manual.



\## 3. Pemilihan 4 Modul (menerapkan saran variasi interaksi sebelumnya)



| Modul | Jenis interaksi | Kompleksitas teknis |

|---|---|---|

| Fisika — Simulasi Gerak Lurus | Slider + animasi live | Sedang (perlu animasi frame-based) |

| Ekonomi — Supply \& Demand | Slider + grafik equilibrium bergerak | Sedang-tinggi (grafik reaktif) |

| Sejarah — Rantai Sebab-Akibat | Drag-and-drop sequencing | Sedang (drag logic + validasi urutan) |

| Matematika — Membaca Kemiringan Grafik | Baca grafik statis + input jawaban | Rendah (baseline paling sederhana, bangun duluan) |



Urutan build: \*\*Matematika dulu\*\* (paling sederhana, jadi validasi Lesson Shell), lalu 3 lainnya paralel.



\## 4. Fase Pengerjaan (Milestones)



1\. \*\*Fase 0 — Foundation\*\*: bangun `LessonShell` + design token warna/tipografi + skema data logging sederhana.

2\. \*\*Fase 1 — Modul baseline\*\*: Matematika (Membaca Kemiringan Grafik) selesai penuh, dipakai untuk validasi apakah Shell benar-benar reusable.

3\. \*\*Fase 2 — Modul variatif\*\*: Fisika, Ekonomi, Sejarah dibangun paralel memakai Shell yang sama.

4\. \*\*Fase 3 — Gamifikasi dasar\*\*: streak, Lumens, progress bar dipasang di lapisan luar Shell (bukan di dalam logic tiap modul).

5\. \*\*Fase 4 — Lumera Atlas minimal\*\*: homepage yang menghubungkan ke 4 modul (bisa statis node, belum perlu graph engine kompleks).



\## 5. Kriteria "Selesai" (Definition of Done) per Prinsip



\- \[ ] Setiap modul lolos ke-7 langkah Lesson Shell tanpa langkah yang di-skip (Principle #2)

\- \[ ] Semua interaksi mengubah state nyata dan feedback sesuai aksi user, diverifikasi manual (Principle #1)

\- \[ ] Konten fisika/ekonomi/sejarah/matematika direview akurasinya terhadap Kurikulum Merdeka sebelum dianggap selesai (Principle #4)

\- \[ ] Tidak ada warna hijau terang dominan / mascot berlebihan di UI modul (Principle #5)

\- \[ ] Event logging (concept\_id, mistake, duration) tercatat di keempat modul meski belum ada backend (Principle #6)

\- \[ ] Tidak ada aset ilustrasi hasil copy/generik tanpa arah desain (Principle #7)



\---



Mau saya lanjutkan ke tahap \*\*/tasks\*\* (breakdown task teknis siap-kerja dari plan ini), atau plan ini dulu yang perlu direvisi/didetail bagian tertentu?

