Untuk tahap ini di Spec Kit, "principle" biasanya diisi di \*\*constitution\*\* — aturan dasar yang mengikat \*semua\* spec turunan, termasuk spec MVP prototype ini. Berdasarkan PRD yang sudah dikunci, berikut prinsip yang relevan diterapkan:



\## 1. Interaksi harus nyata, bukan dekoratif

Setiap elemen "interaktif" (slider, drag-and-drop, grafik) wajib mengubah state aplikasi secara nyata dan menghasilkan feedback yang sesuai. Dilarang ada tombol/interaksi kosmetik yang terlihat interaktif tapi tidak fungsional. \*(Langsung dari PRD Bagian 14: "membuat tombol interaktif palsu / tidak fungsional".)\*



\## 2. Struktur 7 langkah lesson bersifat non-negotiable

Semua modul — sebeda apa pun gaya interaksinya (slider, drag-drop, grafik) — wajib mengikuti alur: Prompt → Model visual → Aksi pengguna → Feedback instan → "Kenapa?" → Refleksi → Lanjutkan. Ini bukan preferensi UI, tapi kontrak konsistensi produk.



\## 3. Kedalaman di atas kuantitas

Lebih baik 4 modul yang benar-benar solid daripada 6 modul yang tanggung. Kalau ada trade-off waktu, kurangi jumlah modul, jangan kurangi kualitas interaksi/penjelasan per modul.



\## 4. Kebenaran konten tidak bisa dikompromikan untuk kecepatan

Karena ini konten edukasi (fisika, ekonomi, sejarah, dll), akurasi materi sesuai Kurikulum Merdeka lebih penting daripada kecepatan ship. Salah konsep di app belajar = kerusakan kepercayaan yang fatal.



\## 5. Visual modern & jernih berbasis sistem Brilliant

Berlaku untuk semua modul di scope ini — warna, copy, dan gaya UI mengikuti **Sistem Visual Brilliant** (latar putih jernih `#FFFFFF`, tombol aksi utama Vibrant Orange `#FF8300`, tipografi sans-serif Inter modern, navigasi header atas dengan status statistik `🔑`/`⚡`, widget sidebar beranda, dan peta stepping-stone 3D ring disk di Atlas).



\## 6. Desain untuk observability sejak awal

Walaupun Knowledge Bank \& Refresh Harian belum masuk scope, setiap lesson harus mencatat data minimal (konsep apa, kesalahan apa, waktu pengerjaan) sejak awal — supaya saat fitur itu dibangun nanti, tidak perlu instrumentasi ulang dari nol.



\## 7. Tidak ada aset bajakan/generik

Semua ilustrasi, animasi, ikon dibuat/dilisensikan sendiri — tidak menyalin aset dari Brilliant/Kinnu/Duolingo maupun ilustrasi AI generik tanpa arah desain jelas.



\---



Prinsip #1–3 adalah yang paling menentukan untuk spec MVP prototype ini secara spesifik. Mau saya susun ini jadi \*\*constitution.md\*\* (kalau workflow Spec Kit kamu memisahkan constitution dari spec), atau langsung dimasukkan sebagai bagian "Principles" di \*\*spec.md\*\* untuk fitur MVP prototype ini?

