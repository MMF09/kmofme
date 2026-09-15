import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import {
  ref,
  push,
  set,
  onValue,
  off,
} from "firebase/database";
import { auth, db, logsPath } from "../../src/firebase";
import { KmLog } from "../../src/types";
import { signOut } from "firebase/auth";
import { router } from "expo-router";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const [date, setDate] = useState(todayStr());
  const [km, setKm] = useState("");
  const [note, setNote] = useState("");
  const [selectedLog, setSelectedLog] = useState<KmLog | null>(null);
  const [allLogs, setAllLogs] = useState<KmLog[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = auth.currentUser?.uid;

  // Load all logs
  useEffect(() => {
    if (!userId) return;
    const logsRef = ref(db, logsPath(userId));
    const unsub = onValue(logsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, v]) => ({
          ...(v as KmLog),
          id,
        }));
        list.sort((a, b) => b.date.localeCompare(a.date));
        setAllLogs(list);
      } else {
        setAllLogs([]);
      }
    });
    return () => off(logsRef);
  }, [userId]);

  // Khi date hoặc allLogs thay đổi → cập nhật form
  useEffect(() => {
    const found = allLogs.find((l) => l.date === date) || null;
    setSelectedLog(found);
    if (found) {
      setKm(String(found.km));
      setNote(found.note || "");
    } else {
      setKm("");
      setNote("");
    }
  }, [date, allLogs]);

  const handleSave = async () => {
    if (!userId) return;
    if (!date) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày");
      return;
    }
    const numKm = parseFloat(km);
    if (isNaN(numKm) || numKm < 0) {
      Alert.alert("Lỗi", "Số km không hợp lệ");
      return;
    }
    setLoading(true);
    try {
      const payload: KmLog = {
        date,
        km: numKm,
        note: note.trim() || null,
        createdAt: Date.now(),
        userId,
      };
      if (selectedLog?.id) {
        await set(ref(db, `${logsPath(userId)}/${selectedLog.id}`), {
          ...payload,
          id: selectedLog.id,
        });
      } else {
        const newRef = push(ref(db, logsPath(userId)));
        await set(newRef, { ...payload, id: newRef.key });
      }
      Alert.alert("Thành công", "Đã lưu số km");
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không lưu được");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Ghi nhận / Cập nhật số km</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Chọn ngày (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2026-09-15"
          keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
          autoCapitalize="none"
        />

        {selectedLog && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Đã có: <Text style={styles.infoKm}>{selectedLog.km} km</Text>
            </Text>
            {selectedLog.note ? (
              <Text style={styles.infoNote}>{selectedLog.note}</Text>
            ) : null}
          </View>
        )}

        <Text style={styles.label}>Số km</Text>
        <TextInput
          style={styles.input}
          placeholder="Số km đi được"
          value={km}
          onChangeText={setKm}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Ghi chú (tuỳ chọn)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ghi chú"
          value={note}
          onChangeText={setNote}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Đang lưu..." : selectedLog ? "Cập nhật" : "Lưu"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  form: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoBox: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
  },
  infoKm: {
    fontWeight: "700",
    color: "#2563eb",
  },
  infoNote: {
    marginTop: 4,
    color: "#666",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  logout: {
    marginTop: 32,
    alignItems: "center",
  },
  logoutText: {
    color: "#dc2626",
    fontSize: 15,
  },
});
