import "./globals.css";

import Topo from "../components/Topo/Topo";
import Sidebar from "../components/Sidebar/Sidebar";

export const metadata = {
  title: "RPG Manager",
  description: "Gerenciador de mesa RPG"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>

        <div className="container">

          <Topo/>

          <div className="conteudo">

            <Sidebar/>

            <main className="principal">

              {children}

            </main>

          </div>

        </div>

      </body>
    </html>
  );
}