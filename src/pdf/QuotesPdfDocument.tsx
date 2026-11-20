import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfLayout } from "./PdfLayout";

export interface QuotePdfRow {
  code: string;
  client: string;
  date: string;
  services: string;
  amount: string;
  status: string;
}

interface QuotesPdfDocumentProps {
  title: string;
  quotes: QuotePdfRow[];
}

const styles = StyleSheet.create({
  table: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
  },
  header: {
    backgroundColor: "#ece6db",
    fontWeight: "bold",
  },
  cellCode: { width: "15%", padding: 6, borderWidth: 0.5, borderColor: "#d8ddd0" },
  cellClient: { width: "17%", padding: 6, borderWidth: 0.5, borderColor: "#d8ddd0" },
  cellDate: { width: "15%", padding: 6, borderWidth: 0.5, borderColor: "#d8ddd0" },
  cellServices: { width: "29%", padding: 6, borderWidth: 0.5, borderColor: "#d8ddd0" },
  cellAmount: { width: "12%", padding: 6, borderWidth: 0.5, borderColor: "#d8ddd0" },
  cellStatus: { width: "12%", padding: 6, borderWidth: 0.5, borderColor: "#d8ddd0" },
  empty: {
    padding: 10,
    borderWidth: 0.5,
    borderColor: "#d8ddd0",
    color: "#667085",
  },
});

export default function QuotesPdfDocument({
  title,
  quotes,
}: QuotesPdfDocumentProps) {
  return (
    <PdfLayout
      title={title}
      subtitle="Listado de cotizaciones"
      dateRangeLabel="Historial de cotizaciones"
      orientation="landscape"
    >
      <View style={styles.table}>
        <View style={[styles.row, styles.header]}>
          <Text style={styles.cellCode}>Cotización</Text>
          <Text style={styles.cellClient}>Cliente</Text>
          <Text style={styles.cellDate}>Fecha</Text>
          <Text style={styles.cellServices}>Servicios</Text>
          <Text style={styles.cellAmount}>Monto</Text>
          <Text style={styles.cellStatus}>Estado</Text>
        </View>

        {quotes.length === 0 ? (
          <Text style={styles.empty}>No hay cotizaciones para mostrar.</Text>
        ) : (
          quotes.map((quote) => (
            <View key={quote.code} style={styles.row} wrap={false}>
              <Text style={styles.cellCode}>{quote.code}</Text>
              <Text style={styles.cellClient}>{quote.client}</Text>
              <Text style={styles.cellDate}>{quote.date}</Text>
              <Text style={styles.cellServices}>{quote.services}</Text>
              <Text style={styles.cellAmount}>{quote.amount}</Text>
              <Text style={styles.cellStatus}>{quote.status}</Text>
            </View>
          ))
        )}
      </View>
    </PdfLayout>
  );
}
