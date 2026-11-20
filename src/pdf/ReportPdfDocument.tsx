// src/pdf/ReportPdfDocument.tsx
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfLayout } from "./PdfLayout";

export interface ReportPdfRow {
  cells: string[];
}

export interface ReportPdfSummaryItem {
  label: string;
  value: string;
}

export interface ReportPdfDocumentProps {
  reportTitle: string;
  subtitle?: string;
  dateRangeLabel?: string;
  headers: string[];
  rows: ReportPdfRow[];
  summaryItems?: ReportPdfSummaryItem[];
  orientation?: "portrait" | "landscape";
}

const styles = StyleSheet.create({
  summarySection: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6b7280",
    marginBottom: 6,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryCard: {
    minWidth: 115,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
  },
  summaryItemLabel: {
    fontSize: 7.5,
    color: "#6b7280",
  },
  summaryItemValue: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 2,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ECE6DB",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  headerCell: {
    flex: 1,
    fontSize: 7.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#3a3d20",
    paddingRight: 4,
  },
  bodyCell: {
    flex: 1,
    fontSize: 8,
    color: "#374151",
    paddingRight: 4,
  },
  emptyBox: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 8.5,
    color: "#6b7280",
  },
});

export function ReportPdfDocument({
  reportTitle,
  subtitle,
  dateRangeLabel,
  headers,
  rows,
  summaryItems = [],
  orientation = "landscape",
}: ReportPdfDocumentProps) {
  return (
    <PdfLayout
      title={reportTitle}
      subtitle={subtitle}
      dateRangeLabel={dateRangeLabel}
      orientation={orientation}
    >
      {summaryItems.length > 0 && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionLabel}>Resumen del Reporte</Text>
          <View style={styles.summaryGrid}>
            {summaryItems.map((item, idx) => (
              <View key={`${item.label}-${idx}`} style={styles.summaryCard}>
                <Text style={styles.summaryItemLabel}>{item.label}</Text>
                <Text style={styles.summaryItemValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          {headers.map((header, idx) => (
            <Text key={`${header}-${idx}`} style={styles.headerCell}>
              {header}
            </Text>
          ))}
        </View>

        {rows.length > 0 ? (
          rows.map((row, rowIdx) => (
            <View
              key={rowIdx}
              style={[
                styles.tableRow,
                rowIdx % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              {row.cells.map((cell, cellIdx) => (
                <Text key={cellIdx} style={styles.bodyCell}>
                  {cell}
                </Text>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No hay registros disponibles para este reporte y período.
            </Text>
          </View>
        )}
      </View>
    </PdfLayout>
  );
}
