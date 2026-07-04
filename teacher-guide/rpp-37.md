# RPP: Pengenalan Database

| Info | Detail |
|------|--------|
| Kode | RPL-AI-37 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Beginner |
| Prasyarat | — |

## Pertemuan 1: What is Database

### Tujuan
- Paham konsep database dan bedanya sama spreadsheet
- Mengenal DBMS types (relational vs NoSQL)
- Memahami table structure, data types, primary key

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: DBMS types, table structure, data types, primary key | Ceramah + demo | Slide + SQLite |
| 25' | Praktik terbimbing: eksplorasi database existing di SQLite | Hands-on | SQLite browser |
| 20' | Latihan mandiri: desain table sederhana untuk aplikasi nyata | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Module README](../37-database-intro/)
- [What is Database](../37-database-intro/01-what-is-database.md)

---

## Pertemuan 2: SQL Basics

### Tujuan
- Nulis CREATE TABLE dan INSERT data
- Menguasai SELECT dengan WHERE, ORDER BY, LIMIT
- UPDATE, DELETE, dan aggregate functions

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: CREATE TABLE, INSERT, SELECT, UPDATE, DELETE, aggregate | Ceramah + demo | Live code (SQLite) |
| 25' | Praktik terbimbing: bikin table & jalankan query CRUD | Hands-on | SQLite |
| 20' | Latihan mandiri: tulis query SELECT dengan GROUP BY & HAVING | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [SQL Basics](../37-database-intro/02-sql-basics.md)

---

## Pertemuan 3: Relationships

### Tujuan
- Memahami foreign key dan table relationships (1:1, 1:N, N:M)
- Menguasai JOIN (INNER, LEFT, RIGHT, FULL)
- Indexing untuk optimasi query

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: foreign key, JOIN, table relationships, indexing | Ceramah + demo | Live code (SQLite) |
| 25' | Praktik terbimbing: desain relational schema & tulis JOIN queries | Hands-on | SQLite |
| 20' | Latihan mandiri: query multi-table dengan JOIN & agregasi | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Relationships](../37-database-intro/03-relationships.md)

---

## Pertemuan 4: Database Design

### Tujuan
- Normalisasi database sampai 3NF
- Bikin ERD dari requirement aplikasi
- Naming convention & migration script

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: normalisasi 1NF-3NF, ERD, naming convention, migration | Ceramah + demo | Slide + Mermaid |
| 25' | Praktik terbimbing: normalisasi spreadsheet ke 3NF + bikin ERD | Hands-on | Mermaid / Draw.io |
| 20' | Latihan mandiri: desain database e-commerce lengkap + migration script | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Database Design](../37-database-intro/04-database-design.md)
