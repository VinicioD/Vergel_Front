import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

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
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 30,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#263018",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4f5a29",
    marginBottom: 4,
  },
  date: {
    fontSize: 8,
    color: "#667085",
    marginBottom: 18,
  },
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

export default function QuotesPdfDocument({ title, quotes }: QuotesPdfDocumentProps) {
  return (
    <Document title={title} author="Vergel">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>
          Reporte generado el {new Intl.DateTimeFormat("es-SV", { dateStyle: "long", timeStyle: "short" }).format(new Date())}
        </Text>

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
      </Page>
    </Document>
  );
}
