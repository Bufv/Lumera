# Implementation Plan: Lumera Core MVP — Functional Interactive Lesson Prototype

**Branch**: `001-core-mvp-prototype` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-core-mvp-prototype/spec.md`, technical direction from `docs/plan.md`

## Summary

Bangun prototype belajar interaktif Lumera Core: **satu `LessonShell` bersama** yang menjalankan
alur 7 langkah secara struktural, diisi oleh 4 modul dengan jenis interaksi berbeda, dibungkus
lapisan gamifikasi dan homepage Lumera Atlas minimal.

Keputusan arsitektur inti: alur 7 langkah (Prinsip II) ditegakkan oleh **struktur kode**, bukan
disiplin manual. Setiap modul hanya mengisi dua slot (Model visual + Aksi pengguna); lima langkah
lainnya milik Shell. Modul baru secara struktural tidak bisa melewatkan langkah.

Backend tidak dibangun. Persistensi memakai penyimpanan lokal peramban, dengan skema event yang
sudah dirancang siap dipindah ke backend — memenuhi FR-015 tanpa membangun infrastruktur.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19

**Primary Dependencies**: Vite (build/dev server), D3 (skala & sumbu grafik untuk modul Matematika
& Ekonomi), `@dnd-kit` (drag-and-drop modul Sejarah). Animasi gerak lurus memakai
`requestAnimationFrame` manual — tanpa library animasi, agar kontrol penuh atas visual (Prinsip VII).

**Storage**: `localStorage` peramban. Tidak ada backend, tidak ada database.

**Testing**: Vitest untuk logika murni (penilaian jawaban, perhitungan mastery, penulisan event
log). Verifikasi alur pelajaran dilakukan manual lewat `quickstart.md` — spec tidak meminta
automated E2E, dan Definition of Done pada `docs/plan.md` memang menetapkan verifikasi manual.

**Target Platform**: Peramban web modern (desktop + mobile web), responsif. Aplikasi native
iOS/Android di luar cakupan prototype.

**Project Type**: Single-project web frontend.

**Performance Goals**: Animasi simulasi 60 fps pada perangkat mid-range. Umpan balik atas aksi
siswa tampil dalam satu frame berikutnya (mendukung SC-003 "instan").

**Constraints**: Tanpa backend; seluruh state hidup di klien. Interaksi wajib punya jalur alternatif
non-drag (edge case spec) agar tetap jalan di perangkat sentuh/tanpa pointer presisi.

**Scale/Scope**: 4 modul pelajaran, 3 layar utama (Atlas, Lesson, Ringkasan progres), 1 shell
bersama, ~20 komponen.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` v1.0.0.

**Pre-Phase 0 evaluation:**

- [x] **I. Interaksi Nyata** — PASS. Keempat modul memakai kontrol yang mengubah state simulasi
      nyata (slider→animasi, slider→kurva, drag→urutan, input→validasi). Tidak ada layar mock.
- [x] **II. Struktur 7 Langkah** — PASS. `LessonShell` memiliki ketujuh langkah sebagai tahap wajib;
      modul hanya mengisi slot 2 dan 3. Langkah "Kenapa?" milik Shell, ditampilkan pada jawaban
      benar maupun salah.
- [x] **III. Kedalaman di Atas Kuantitas** — PASS. 4 modul dipilih sadar dari 6 (batas bawah FR-003).
      Jika waktu menyempit, yang dipotong adalah modul Fase 2, bukan kedalaman modul manapun.
- [x] **IV. Kebenaran Konten** — PASS. Verifikasi konten terhadap Kurikulum Merdeka adalah syarat
      kelulusan tiap modul (FR-016, FR-020), dilakukan reviewer selain penulis modul.
- [x] **V. Dewasa Secara Visual** — PASS. Design token warna/tipografi dibangun di Fase 0 sebelum
      modul manapun, sehingga arah "Soft Academic Adventure" mengikat sejak awal.
- [x] **VI. Instrumentasi Sejak Awal** — PASS. Skema event log masuk Fase 0 (fondasi), bukan
      ditambahkan belakangan. Modul tidak lulus FR-020 tanpa instrumentasi aktif.
- [x] **VII. Aset Orisinal** — PASS. Visual dibangun dari SVG/canvas buatan sendiri; tidak ada
      library ilustrasi pihak ketiga maupun aset AI generik.

**Post-Phase 1 re-evaluation:** PASS — tidak ada gate yang berubah status. Desain Phase 1
memperkuat Gate II (kontrak slot pada `contracts/lesson-module-contract.md` membuat modul tanpa
langkah lengkap tidak dapat didaftarkan) dan Gate VI (`contracts/learning-event-contract.md`
menetapkan event wajib terbit saat pelajaran selesai).

## Project Structure

### Documentation (this feature)

```text
specs/001-core-mvp-prototype/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── lesson-module-contract.md
│   └── learning-event-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── shell/                    # LessonShell — pemilik alur 7 langkah (Prinsip II)
│   ├── LessonShell.tsx
│   ├── steps/                # Step1_Prompt, Step4_InstantFeedback, Step5_WhyExplanation,
│   │                         #   Step6_Reflection, Step7_Continue — milik Shell, bukan modul
│   └── types.ts              # kontrak slot yang diisi modul
├── modules/                  # tiap modul hanya mengisi slot Step2 + Step3
│   ├── math-slope/
│   ├── physics-motion/
│   ├── econ-supply-demand/
│   └── history-causal-chain/
├── progress/                 # streak, Lumens, mastery — lapisan LUAR Shell
├── telemetry/                # event log (FR-015): perekam + skema + adapter localStorage
├── atlas/                    # homepage peta subject world
├── design/                   # design token: warna, tipografi, spacing, motion
└── content/                  # naskah pelajaran + metadata verifikasi Kurikulum Merdeka

tests/
└── unit/                     # Vitest: penilaian, mastery, penulisan event
```

**Structure Decision**: Single-project frontend. Pemisahan `shell/` dari `modules/` adalah inti
penegakan Prinsip II — logika langkah tidak boleh bocor ke direktori modul. `progress/` dan
`telemetry/` sengaja berada di luar `modules/` agar gamifikasi dan instrumentasi tidak perlu
diimplementasikan ulang (atau terlupa) di setiap modul.

## Build Phases

Diturunkan dari `docs/plan.md` Bagian 4, dipetakan ke user story pada spec.

| Fase | Isi | User Story | Keluaran yang bisa didemokan |
|---|---|---|---|
| **0 — Foundation** | `LessonShell` (7 langkah), design token, skema + perekam event log | — | Shell dengan modul dummy berjalan penuh 7 langkah |
| **1 — Modul baseline** | Matematika: Membaca Kemiringan Grafik | US2 (P1) | Satu pelajaran nyata selesai end-to-end; membuktikan Shell reusable |
| **2 — Modul variatif** | Fisika, Ekonomi, Sejarah (paralel) | US3 (P1), US4 (P2), US5 (P2) | 4 modul memenuhi batas bawah FR-003 |
| **3 — Gamifikasi** | streak, Lumens, mastery %, progress dots | US8 (P3) | Progres terlihat & persisten antar sesi |
| **4 — Atlas minimal** | homepage node subject world → 4 modul | US1 (P1) | Alur lengkap: Atlas → pelajaran → kembali dengan progres |

**Catatan urutan**: Atlas berada di Fase 4 meski berprioritas P1 pada spec. Ini disengaja — Atlas
minimal berbiaya rendah dan bergantung pada daftar modul yang sudah final, sementara risiko
teknis terbesar ada di Shell dan modul. Selama Fase 0–3, modul diakses lewat rute langsung untuk
pengembangan. Konsekuensinya: US1 baru bisa diuji utuh di Fase 4, dan itu harus tercermin di
`tasks.md`.

## Complexity Tracking

> Tidak ada pelanggaran Constitution Check yang perlu dijustifikasi.

Dua keputusan sengaja memilih jalur paling sederhana, dicatat agar tidak salah dibaca sebagai kelalaian:

| Keputusan | Alasan |
|---|---|
| Tanpa state management global (Redux/Zustand) | Prototype tidak punya state lintas layar yang kompleks; state lokal per pelajaran + satu modul progres sudah cukup. Menambah library global adalah over-engineering pada tahap ini. |
| Atlas sebagai node statis, bukan graph engine | FR-001 hanya menuntut node dengan koneksi visual, bukan graph interaktif. Graph engine adalah kebutuhan Knowledge Bank Graph View, yang berada di luar cakupan spec ini. |
