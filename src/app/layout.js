import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Digita Marketing | Agency Dashboard & WhatsApp Bot",
  description: "Production-ready marketing agency panel and integrated WhatsApp bot system.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
