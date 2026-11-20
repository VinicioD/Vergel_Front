// src/pdf/PdfLayout.tsx
import type { ReactNode } from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import logoSinFondo from "../assets/LOGO-sin-fondo.png";

export interface PdfLayoutProps {
  title: string;
  subtitle?: string;
  dateRangeLabel?: string;
  orientation?: "portrait" | "landscape";
  children: ReactNode;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 42,
    paddingHorizontal: 28,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    marginBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: "#6C7D38",
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: "35%",
  },
  logo: {
    width: 44,
    height: 44,
    objectFit: "contain",
  },
  brandTextGroup: {
    flexDirection: "column",
  },
  brandName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2A3319",
  },
  brandTag: {
    fontSize: 7.5,
    color: "#6b7280",
    marginTop: 1,
  },
  docMetaGroup: {
    flexDirection: "column",
    alignItems: "flex-end",
    maxWidth: "62%",
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2A3319",
    textAlign: "right",
  },
  docSubtitle: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 2,
  },
  periodBadge: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 7,
    backgroundColor: "#ECE6DB",
    borderRadius: 4,
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#3a3d20",
  },
  content: {
    flexGrow: 1,
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: "#6b7280",
  },
  footerRight: {
    fontWeight: "bold",
    color: "#374151",
  },
});

export function PdfLayout({
  title,
  subtitle,
  dateRangeLabel = "Todo el historial",
  orientation = "landscape",
  children,
}: PdfLayoutProps) {
  const generatedAt = new Date().toLocaleDateString("es-SV", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <Document>
      <Page size="A4" orientation={orientation} style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header} fixed>
          <View style={styles.brandGroup}>
            <Image src={logoSinFondo} style={styles.logo} />
            <View style={styles.brandTextGroup}>
              <Text style={styles.brandName}>Vergel</Text>
              <Text style={styles.brandTag}>
                Gestión Operativa y Financiera
              </Text>
            </View>
          </View>

          <View style={styles.docMetaGroup}>
            <Text style={styles.docTitle}>{title}</Text>
            {subtitle ? (
              <Text style={styles.docSubtitle}>{subtitle}</Text>
            ) : null}
            <Text style={styles.periodBadge}>Período: {dateRangeLabel}</Text>
          </View>
        </View>

        {/* Contenido dinámico */}
        <View style={styles.content}>{children}</View>

        {/* Pie de página */}
        <View style={styles.footer} fixed>
          <Text>Emitido el {generatedAt} · Vergel</Text>
          <Text
            style={styles.footerRight}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
