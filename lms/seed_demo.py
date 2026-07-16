#!/usr/bin/env python3
"""Seed D1 with demo data. Matches actual DB schemas."""
import uuid, hashlib

def q(s): return f"'{s.replace(chr(39), chr(39)*2)}'"
def td(): return "'2026-01-15 08:00:00'"

PH = hashlib.sha256("password123".encode()).hexdigest()[:64]
T = "t_default"
lines = []

def ins(tbl, cols, vals_list):
    c = ",".join(cols)
    for vals in vals_list:
        v = ",".join(str(x) for x in vals)
        lines.append(f"INSERT OR IGNORE INTO {tbl} ({c}) VALUES ({v});")

# TENANTS
ins("tenants", ["id","name","slug","type","subdomain","is_active","created_at"], [
    [q(T),q("Default LMS"),q("default"),q("school"),q("default"),"1",td()],
    [q("t_sma"),q("SMA Negeri 1"),q("sma1"),q("school"),q("sma1"),"1",td()],
])

# USERS
us = {}
user_spec = [
    ("admin","admin","Admin","admin",""),
    ("guru1","guru1","Budi Santoso","instructor",""),
    ("guru2","guru2","Siti Rahayu","instructor",""),
    ("guru3","guru3","Ahmad Fauzi","instructor",""),
    ("siswa1","siswa1","Adi Pratama","student",""),
    ("siswa2","siswa2","Bunga Lestari","student",""),
    ("siswa3","siswa3","Citra Dewi","student",""),
    ("siswa4","siswa4","Danu Wicaksono","student",""),
    ("siswa5","siswa5","Eka Putri","student",""),
    ("siswa6","siswa6","Farhan Maulana","student",""),
    ("kaprodi1","kaprodi1","Staff Kaprodi","admin",""),
    ("dosen1","dosen1","Dr. Andi Wijaya","instructor",""),
    ("dosen2","dosen2","Dr. Maya Sari","instructor",""),
    ("mhs1","mhs1","Rina Amelia","student",""),
    ("mhs2","mhs2","Rio Hidayat","student",""),
    ("ortu1","ortu1","Ibu Sari","ta",""),
]
for s in user_spec:
    uid = uuid.uuid4().hex
    us[s[0]] = uid
    ins("users", ["id","username","email","display_name","role","is_active","tenant_id","created_at"], [
        [q(uid),q(s[1]),q(f"{s[1]}@school.com"),q(s[2]),q(s[3]),"1",q(T),td()],
    ])

# ACADEMIC PERIOD (needed by classes)
ins("academic_periods", ["id","tenant_id","name","start_date","end_date","is_active","created_at"], [
    [q("ap_2425"),q(T),q("2024/2025"),q("2024-07-01"),q("2025-06-30"),"0",td()],
    [q("ap_2526"),q(T),q("2025/2026"),q("2025-07-01"),q("2026-06-30"),"1",td()],
])

# GRADE LEVELS
ins("grade_levels", ["id","tenant_id","name","sequence","semester_count","created_at"], [
    [q("gl_10"),q(T),q("Kelas X"),"10","2",td()],
    [q("gl_11"),q(T),q("Kelas XI"),"11","2",td()],
    [q("gl_12"),q(T),q("Kelas XII"),"12","2",td()],
])

# MAJORS
ins("majors", ["id","tenant_id","name","code","type","created_at"], [
    [q("m_ipa"),q(T),q("IPA"),q("IPA"),q("academic"),td()],
    [q("m_ips"),q(T),q("IPS"),q("IPS"),q("academic"),td()],
])

# CLASSES
ins("classes", ["id","tenant_id","grade_level_id","major_id","name","academic_period_id","created_at"], [
    [q("c_10a"),q(T),q("gl_10"),q("m_ipa"),q("X-A"),q("ap_2526"),td()],
    [q("c_10b"),q(T),q("gl_10"),q("m_ips"),q("X-B"),q("ap_2526"),td()],
    [q("c_11a"),q(T),q("gl_11"),q("m_ipa"),q("XI-A"),q("ap_2526"),td()],
    [q("c_12a"),q(T),q("gl_12"),q("m_ipa"),q("XII-A"),q("ap_2526"),td()],
])

# SUBJECTS
ins("subjects", ["id","tenant_id","name","code","created_at"], [
    [q("s_mtk"),q(T),q("Matematika Wajib"),q("MTK"),td()],
    [q("s_ipa"),q(T),q("IPA"),q("IPA"),td()],
    [q("s_fisika"),q(T),q("Fisika"),q("FIS"),td()],
    [q("s_kimia"),q(T),q("Kimia"),q("KIM"),td()],
    [q("s_bio"),q(T),q("Biologi"),q("BIO"),td()],
    [q("s_ing"),q(T),q("Bahasa Inggris"),q("BING"),td()],
    [q("s_ind"),q(T),q("Bahasa Indonesia"),q("BIND"),td()],
])

# CLASS_SUBJECTS (teacher assignments)
cs_list = []
i = 0
for cid in ["c_10a","c_10b","c_11a","c_12a"]:
    for sid in ["s_mtk","s_ipa","s_ing","s_ind"]:
        cs_id = f"cs_{i}"
        tch = us["guru1"] if sid == "s_mtk" else (us["guru2"] if sid == "s_ipa" else us["guru3"])
        cs_list.append([q(cs_id),q(T),q(cid),q(sid),q(tch),q("2"),q("active"),td()])
        i += 1
ins("class_subjects", ["id","tenant_id","class_id","subject_id","teacher_id","semester","status","created_at"], cs_list)

# FACULTIES (univ)
ins("faculties", ["id","tenant_id","name","code","created_at"], [
    [q("f_ftik"),q(T),q("Fakultas Teknologi Informasi & Komunikasi"),q("FTIK"),td()],
    [q("f_fe"),q(T),q("Fakultas Ekonomi"),q("FE"),td()],
])

# STUDY PROGRAMS
ins("study_programs", ["id","tenant_id","faculty_id","name","code","degree_type","created_at"], [
    [q("sp_ti"),q(T),q("f_ftik"),q("Teknik Informatika"),q("TI"),q("S1"),td()],
    [q("sp_si"),q(T),q("f_ftik"),q("Sistem Informasi"),q("SI"),q("S1"),td()],
    [q("sp_ak"),q(T),q("f_fe"),q("Akuntansi"),q("AK"),q("S1"),td()],
])

# EXAM TYPES (P8C)
ins("exam_types", ["id","tenant_id","name","code","description","created_at"], [
    [q("ext_uts"),q(T),q("UTS"),q("UTS"),q("Mid Term"),td()],
    [q("ext_uas"),q(T),q("UAS"),q("UAS"),q("Final Exam"),td()],
])

# PAYMENT METHODS (P8D1)
ins("payment_methods", ["id","tenant_id","name","code","provider","is_active","created_at"], [
    [q("pm_tf"),q(T),q("Transfer Bank"),q("BANK_TRANSFER"),q("bank"),"1",td()],
    [q("pm_va"),q(T),q("Virtual Account"),q("VIRTUAL_ACCOUNT"),q("bca"),"1",td()],
])

# FEE STRUCTURES
ins("fee_structures", ["id","tenant_id","name","code","amount","fee_type","academic_year","semester","is_active","created_at"], [
    [q("fs_spp"),q(T),q("SPP Bulanan"),q("SPP"),"250000",q("spp"),q("2025/2026"),"1","1",td()],
    [q("fs_daf"),q(T),q("Biaya Pendaftaran"),q("DAFTAR"),"500000",q("registration"),q("2025/2026"),"1","1",td()],
])

# SURVEY TEMPLATES (P8D4)
ins("survey_templates", ["id","tenant_id","name","description","survey_type","is_anonymous","is_active","created_at"], [
    [q("sv_kep"),q(T),q("Survey Kepuasan Siswa"),q("Semester Genap 2025/2026"),q("kepuasan"),"0","1",td()],
])

out = "/home/midory/rpl-ai-curriculum/lms/seed_demo.sql"
with open(out, "w") as f:
    f.write("\n".join(lines))
print(f"Written {len(lines)} statements ({sum(len(l)+1 for l in lines)} bytes)")
