Beberapa, dan kualitasnya berbeda-beda. Aku pisahkan antara yang \*\*benar-benar tidak pernah dibahas di mana pun\*\* (seperti deployment) versus yang \*\*sudah dinyatakan out-of-scope tapi akan menggigit lebih cepat dari perkiraan\*\*.



\## Gap yang tidak pernah dibahas sama sekali



\*\*Verifikasi konten sebenarnya fiktif.\*\* Ini yang paling serius. Metadata `verifikasi` di keempat modul terisi lengkap dan lolos gate registry — tapi nama reviewer-nya placeholder (`reviewer-pedagogi-matematika`, dst.), bukan orang nyata. Dan string `rujukanCP` itu \*\*aku yang mengarang\*\*, disusun agar terdengar masuk akal, bukan dikutip dari dokumen Capaian Pembelajaran Kurikulum Merdeka yang asli. Jadi SC-007 ("100% modul lolos verifikasi") secara teknis "lulus" padahal tidak ada seorang pun yang benar-benar memeriksa. Prinsip IV ditegakkan secara struktural, tapi datanya kosong. Ini harus diisi orang nyata sebelum apa pun dirilis ke siswa.



\*\*Perlindungan data anak.\*\* Target penggunanya siswa SMP–SMA — mayoritas di bawah umur. Tidak ada satu baris pun soal consent, privacy notice, atau kebijakan retensi di spec, plan, maupun constitution. Sementara itu Prinsip VI justru mewajibkan perekaman perilaku belajar per individu. Begitu ada backend dan data keluar dari perangkat, ini berubah dari gap desain jadi masalah kepatuhan — apalagi PRD menyebut orang tua dan sekolah sebagai segmen.



\*\*Alur 7 langkah tidak punya test otomatis.\*\* Dari 66 test, semuanya menguji logika murni: scoring, mastery, streak, validasi event, kontrak registry. State machine `LessonShell` sendiri — hal yang menjadi satu-satunya penegak Prinsip II — hanya diverifikasi manual lewat quickstart. Ironisnya komponen paling kritis justru yang paling tidak terlindungi dari regresi.



\*\*Tidak ada routing.\*\* `App.tsx` memakai `useState` untuk berpindah layar. Konsekuensinya: tombol back browser tidak berfungsi, refresh di tengah pelajaran melempar kembali ke Atlas, dan tidak bisa deep-link ke modul tertentu. Padahal `plan.md` menyebut "modul diakses lewat rute dev langsung" selama Fase 0–3 — rute itu tidak pernah ada.



\*\*Jawaban refleksi (langkah 6) dibuang.\*\* Tersimpan di state komponen lalu hilang saat pindah langkah. Tidak masuk event log, tidak tersimpan di mana pun. Untuk fitur yang tujuannya memaksa siswa mengartikulasikan pemahaman, membuang datanya bertentangan dengan semangat Prinsip VI.



\*\*Kegagalan `localStorage` tidak tertangani.\*\* Di mode private browsing atau saat kuota penuh, `setItem` melempar. Adapter menangkap error saat \*membaca\*, tapi kegagalan \*menulis\* akan naik ke `LessonShell` dan hanya berakhir di `console.error`. Kontrak mewajibkan error "terlihat" — konsol peramban bukan sesuatu yang dilihat siswa.



\## Sudah diketahui, tapi akan menggigit lebih cepat



\*\*Kedalaman modul tipis.\*\* Setiap "modul" saat ini berisi \*\*satu soal\*\*. FR-003 terpenuhi secara harfiah, tapi PRD membayangkan learning path berisi banyak pelajaran. Prinsip III bilang "kedalaman di atas kuantitas" — empat modul satu-soal bisa dibilang belum memenuhi semangatnya, hanya hurufnya.



\*\*Angka Lumens dan rumus mastery diputuskan sepihak.\*\* 20 Lumens, bonus +5, potongan 25 poin per kesalahan, rata-rata 3 sesi — semua aku tetapkan sendiri saat implementasi karena `research.md` menandainya sebagai titik terbuka. Belum pernah divalidasi playtest maupun disetujui siapa pun.



\*\*Streak rapuh terhadap zona waktu.\*\* `tanggalLokal()` memakai waktu perangkat. Sudah diuji untuk jam mundur, tapi siswa yang berpindah zona waktu bisa kehilangan atau menggandakan streak.



\*\*Aset visual praktis belum ada.\*\* Design token sudah ada, tapi tidak ada mascot Lumo, tidak ada ilustrasi, tidak ada aset brand. Audit Prinsip VII (T076) saat ini akan lolos secara hampa — tidak ada aset untuk diaudit.



\*\*Aksesibilitas belum diaudit.\*\* Ada `aria-label` dan `focus-visible`, tapi tidak ada task audit a11y, tidak ada uji screen reader, dan rasio kontras palet belum diperiksa terhadap WCAG.



Yang menurutku paling mendesak dari daftar ini: \*\*verifikasi konten fiktif\*\* dan \*\*perlindungan data anak\*\*. Keduanya bukan utang teknis yang bisa dibayar belakangan — yang pertama merusak kredibilitas produk edukasi, yang kedua punya konsekuensi hukum.

