import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { ref, onValue, off } from "firebase/database";
import { auth, db, logsPath } from "../../src/firebase";
import { KmLog } from "../../src/types";
import { router } from "expo-router";

export default function History() {
  const [allLogs, setAllLogs] = useState<KmLog[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filtered, setFiltered] = useState<KmLog[]>([]);

  const userId = auth.currentUser?.uid;

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

  // Apply filter whenever allLogs or range changes
  useEffect(() => {
    let list = [...allLogs];
    if (fromDate) list = list.filter((l) => l.date >= fromDate);
    if (toDate) list = list.filter((l) => l.date <= toDate);
    setFiltered(list);
  }, [allLogs, fromDate, toDate]);

  const totalKm = filtered.reduce((sum, l) => sum + (l.km || 0), 0);

  const clearFilter = () => {
    setFromDate("");
    setToDate("");
  };

  return (
    <View style={styles.container}>
      {/* Filter */}
      <View style={styles.filterBox}>
        <Text style={styles.filterTitle}>Lọc theo khoảng thời gian</Text>
        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <Text style={styles.label}>Từ ngày</Text>
            <TextInput
              style={styles.input}
              value={fromDate}
              onChangeText={setFromDate}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.filterCol}>
            <Text style={styles.label}>Đến ngày</Text>
            <TextInput
              style={styles.input}
              value={toDate}
              onChangeText={setToDate}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />
          </View>
        </View>
        <View style={styles.filterActions}>
          <TouchableOpacity style={styles.btnOutline} onPress={clearFilter}>
            <Text style={styles.btnOutlineText}>Xoá lọc</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.total}>
        Tổng cộng:{" "}
        <Text style={styles.totalValue}>{totalKm.toFixed(1)} km</Text>
        {filtered.length > 0 ? ` (${filtered.length} ngày)` : ""}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id || item.date}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              // có thể mở form chỉnh sửa sau này
            }}
            activeOpacity={0.7}
          >
            <View style={styles.row}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.km}>{item.km} km</Text>
            </View>
            {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có dữ liệu</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  filterBox: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterCol: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterActions: {
    marginTop: 12,
    flexDirection: "row",
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnOutlineText: {
    color: "#64748b",
    fontWeight: "500",
  },
  total: {
    fontSize: 16,
    fontWeight: "600",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  totalValue: {
    color: "#2563eb",
    fontWeight: "700",
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  item: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontWeight: "600",
    fontSize: 15,
  },
  km: {
    fontSize: 17,
    color: "#2563eb",
    fontWeight: "700",
  },
  note: {
    color: "#666",
    marginTop: 6,
    fontSize: 14,
  },
  empty: {
    textAlign: "center",
    marginTop: 48,
    color: "#999",
    fontSize: 15,
  },
});
