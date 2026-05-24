import "../styles/globals.css";
import "../styles/bestiario.css";
import "../styles/itens.css";
import "../styles/combate.css";
import "../styles/npcs.css";
import "../styles/missoes.css";
import "../styles/areas.css";

import { InventarioProvider } from "../contexts/InventarioContext";
import { CalendarioProvider }  from "../contexts/CalendarioContext";
import { AuthProvider }        from "../contexts/AuthContext";
import Topo    from "../components/Layout/Topo";
import Sidebar from "../components/Layout/Sidebar";

export const metadata = {
  title: "RPG Manager",
  description: "Gerenciador de mesa RPG",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <CalendarioProvider>
            <InventarioProvider>
              <div className="container">
                <Topo />
                <div className="conteudo">
                  <Sidebar />
                  <main className="principal">{children}</main>
                </div>
              </div>
            </InventarioProvider>
          </CalendarioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
