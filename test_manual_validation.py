import requests
import datetime
import time

BASE_URL = "http://localhost:8000"

# 1. Login as Admin
print("--> Login Admin...")
admin_resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@matholympiad.id", "password": "admin123"})
admin_token = admin_resp.json()["access_token"]
admin_headers = {"Authorization": f"Bearer {admin_token}"}

# 2. Login as Peserta SMA
print("--> Login Peserta SMA...")
part_resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "sma@sekolah.sch.id", "password": "password123"})
part_token = part_resp.json()["access_token"]
part_headers = {"Authorization": f"Bearer {part_token}"}

# 3. Create a Round that starts 2 minutes from now (UTC)
now_utc = datetime.datetime.now(datetime.timezone.utc)
start_dt = now_utc + datetime.timedelta(minutes=2)
end_dt = start_dt + datetime.timedelta(minutes=60)

round_data = {
    "name": "Babak Uji Waktu Otomatis",
    "mode": "online",
    "category": "sma",
    "status": "belum_dibuka", # Akan ditimpa oleh waktu
    "duration_minutes": 60,
    "question_count": 5,
    "tab_switch_limit": 3,
    "is_randomized": True,
    "start_date": start_dt.strftime("%Y-%m-%d"),
    "start_time": start_dt.strftime("%H:%M"),
    "end_date": end_dt.strftime("%Y-%m-%d"),
    "end_time": end_dt.strftime("%H:%M")
}

print(f"--> Membuat Babak baru dengan waktu mulai: {start_dt.strftime('%H:%M')} UTC (2 menit dari sekarang)...")
res_create = requests.post(f"{BASE_URL}/rounds", json=round_data, headers=admin_headers)
new_round_id = res_create.json()["id"]
print(f"[OK] Babak dibuat dengan ID: {new_round_id}")

print("\n=======================================================")
print("MANUAL TEST CASE - SILAKAN LAKUKAN LANGKAH BERIKUT:")
print("=======================================================")
print("\n(A) PENGUJIAN SAAT BELUM WAKTUNYA DIBUKA")
print("Sistem harus menolak permintaan meskipun dipanggil langsung via API.")
print("Mencoba POST /quiz/start sekarang...")

res_start = requests.post(f"{BASE_URL}/rounds/{new_round_id}/quiz/start", headers=part_headers)
print(f"HTTP Status: {res_start.status_code}")
print(f"Response: {res_start.text}")
if res_start.status_code == 403:
    print("[SUCCESS] Sistem BENAR memblokir akses ke soal sebelum waktunya!")
else:
    print("[FAIL] Akses terbuka sebelum waktunya!")

print("\n(B) PENGUJIAN SAAT WAKTU SUDAH LEWAT")
print("Silakan jalankan perintah Curl berikut di terminal Anda sekitar 2-3 menit lagi")
print("tanpa perlu mengubah apapun di Admin Dashboard. Status babak akan otomatis jadi aktif.\n")

print(f"curl -X POST {BASE_URL}/rounds/{new_round_id}/quiz/start \\")
print(f"     -H 'Authorization: Bearer {part_token}'")

print("\n(Atau cukup tunggu 2 menit dan buka akun Peserta SMA di browser, dan perhatikan card Babak ini otomatis menjadi tombol 'Mulai Quiz' di menit tersebut!)")
print("=======================================================\n")
