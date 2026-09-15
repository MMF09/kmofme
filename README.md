# Hộp Đen KM - Android (React Native + Expo)

Ứng dụng ghi nhận số km đi được mỗi ngày (giống hộp đen xe).

## Công nghệ
- React Native + Expo (SDK 51)
- TypeScript
- Firebase Authentication (Email/Password)
- Firebase Realtime Database
- Expo Router

## Cấu trúc dữ liệu
```
users/
  {uid}/
    logs/
      {logId}/
        date, km, note, createdAt, userId, id
```

## Rules Firebase
```json
{
  "rules": {
    "users": {
      "$user_id": {
        ".read": "$user_id === auth.uid",
        ".write": "$user_id === auth.uid"
      }
    }
  }
}
```

## Tính năng
- Chọn **ngày bất kỳ** để ghi / cập nhật km
- Lọc lịch sử theo **khoảng thời gian** (Từ ngày – Đến ngày)
- Đăng ký / Đăng nhập email
- Tổng km theo bộ lọc

## Cài đặt & chạy local
```bash
cd km-blackbox-android
npm install
npx expo start
```
Nhấn `a` để mở Android.

---

## 🚀 Build Debug APK trên GitHub (không cần EAS / EXPO_TOKEN)

Workflow sẽ:
1. `expo prebuild` → tạo thư mục `android/`
2. `./gradlew assembleDebug` → ra file APK debug
3. Upload APK lên **Artifacts** của GitHub Actions

### Cách dùng
1. Push code lên GitHub (nhánh `main` hoặc `master`)
2. Vào tab **Actions** → workflow **Build Android Debug APK**
3. Chờ build xong (~5–15 phút)
4. Vào run đó → phần **Artifacts** → tải file `km-blackbox-debug-apk`

Hoặc bấm **Run workflow** thủ công.

**Không cần** secret `EXPO_TOKEN`, không cần tài khoản Expo.

### Build local (máy có Android SDK)
```bash
npm install
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug
# APK nằm ở: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## File quan trọng
| File | Mô tả |
|------|--------|
| `.github/workflows/build-apk.yml` | Build debug APK + upload artifact |
| `eas.json` | (Tùy chọn) nếu muốn dùng EAS sau này |
| `app.json` | package: `com.kmblackbox.app` |

## Lưu ý
- APK debug cài trực tiếp trên máy Android được (cho phép "Cài đặt từ nguồn không xác định").
- Build chạy trên runner GitHub (miễn phí cho public repo).
