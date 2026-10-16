import { useMemo, useRef, useState } from "react";
import { parseInstagramFiles } from "./services/instagramParser";
import "./style.css";

function Icon({ name, size = 20 }) {
  const paths = {
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7" />
        <path d="M10 14 21 3" />
        <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    userX: (
      <>
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a7 7 0 0 1 14 0v2" />
        <path d="m17 8 5 5m0-5-5 5" />
      </>
    ),
    close: <path d="m18 6-12 12M6 6l12 12" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon name={icon} size={21} />
      </div>

      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value.toLocaleString("pt-BR")}
      </div>
    </div>
  );
}

export default function App() {
  const fileInput = useRef(null);

  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("notFollowingBack");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const users = result?.[activeTab] ?? [];

  const filteredUsers = useMemo(() => {
    const term = search.trim().replace(/^@/, "").toLowerCase();

    return users.filter((username) => username.includes(term));
  }, [users, search]);

  async function handleImport(event) {
    const files = event.target.files;

    if (!files?.length) return;

    setLoading(true);
    setError("");

    try {
      const data = await parseInstagramFiles(files);

      setResult(data);
      setActiveTab("notFollowingBack");
      setSearch("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível analisar os arquivos."
      );
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  function exportCSV() {
    if (!filteredUsers.length) return;

    const rows = [
      ["username", "profile_url"],
      ...filteredUsers.map((username) => [
        username,
        `https://www.instagram.com/${username}/`,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      activeTab === "notFollowingBack"
        ? "nao-seguem-de-volta.csv"
        : "seguidores-que-nao-sigo.csv";

    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyUsername(username) {
    try {
      await navigator.clipboard.writeText(username);
    } catch {
      setError(
        "Não foi possível copiar automaticamente. Copie o nome manualmente."
      );
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Icon name="users" size={23} />
          </div>

          <div>
            <div className="brand-name">
              follow<span>check</span>
            </div>
            <div className="brand-caption">INSTAGRAM ANALYZER</div>
          </div>
        </div>

        <div className="sidebar-label">MENU PRINCIPAL</div>

        <div className="nav-item active">
          <Icon name="users" size={18} />
          Visão geral
        </div>

        <div className="sidebar-note">
          <Icon name="shield" size={19} />

          <div>
            <strong>Privacidade em primeiro lugar</strong>
            <p>
              Seus arquivos são processados localmente.
              Não precisamos da sua senha.
            </p>
          </div>
        </div>

        <div className="sidebar-footer">
          <span className="status-dot" />
          Processamento local
          <small>Instagram Analyzer · V1</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">PAINEL PESSOAL</div>
            <h1>Análise de seguidores</h1>
            <p className="subtitle">
              Descubra quem você segue e não segue você de volta.
            </p>
          </div>

          <div className="privacy-chip">
            <Icon name="shield" size={16} />
            Sem login
          </div>
        </header>

        {!result ? (
          <section className="welcome-panel">
            <div className="welcome-art">
              <div className="art-circle circle-one" />
              <div className="art-circle circle-two" />

              <div className="art-bubble bubble-one">
                <Icon name="users" size={25} />
              </div>

              <div className="art-bubble bubble-two">
                <Icon name="userX" size={25} />
              </div>

              <div className="art-center">
                <Icon name="check" size={40} />
              </div>
            </div>

            <div className="welcome-copy">
              <div className="eyebrow">COMECE POR AQUI</div>

              <h2>Quem não segue você de volta?</h2>

              <p>
                Importe a exportação de seguidores do Instagram
                e descubra quais contas você segue que não seguem
                você de volta. Tudo é analisado neste navegador.
              </p>

              <button
                className="primary-button"
                onClick={() => fileInput.current?.click()}
                disabled={loading}
              >
                <Icon name="upload" size={18} />
                {loading ? "Analisando..." : "Importar exportação"}
              </button>

              <div className="supported-formats">
                Formatos aceitos: ZIP ou JSON
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="stats-grid">
              <StatCard
                label="Seus seguidores"
                value={result.followerCount}
                icon="users"
                color="purple"
              />

              <StatCard
                label="Você segue"
                value={result.followingCount}
                icon="users"
                color="blue"
              />

              <StatCard
                label="Não seguem de volta"
                value={result.notFollowingBack.length}
                icon="userX"
                color="orange"
              />

              <StatCard
                label="Você não segue"
                value={result.notFollowedByYou.length}
                icon="users"
                color="green"
              />
            </section>

            <section className="results-panel">
              <div className="results-heading">
                <div>
                  <div className="eyebrow">SUA COMUNIDADE</div>
                  <h2>Resultados da análise</h2>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => fileInput.current?.click()}
                >
                  <Icon name="upload" size={16} />
                  Importar novamente
                </button>
              </div>

              <div className="tabs">
                <button
                  className={
                    activeTab === "notFollowingBack"
                      ? "tab active"
                      : "tab"
                  }
                  onClick={() => setActiveTab("notFollowingBack")}
                >
                  Não seguem de volta
                  <span>{result.notFollowingBack.length}</span>
                </button>

                <button
                  className={
                    activeTab === "notFollowedByYou"
                      ? "tab active"
                      : "tab"
                  }
                  onClick={() => setActiveTab("notFollowedByYou")}
                >
                  Você não segue
                  <span>{result.notFollowedByYou.length}</span>
                </button>
              </div>

              <div className="list-toolbar">
                <label className="search-box">
                  <Icon name="search" size={18} />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar usuário..."
                  />

                  {search && (
                    <button
                      className="icon-button"
                      onClick={() => setSearch("")}
                      aria-label="Limpar busca"
                    >
                      <Icon name="close" size={15} />
                    </button>
                  )}
                </label>

                <button
                  className="secondary-button"
                  onClick={exportCSV}
                  disabled={!filteredUsers.length}
                >
                  <Icon name="download" size={16} />
                  Exportar CSV
                </button>
              </div>

              <div className="list-meta">
                {filteredUsers.length.toLocaleString("pt-BR")} resultado(s)
              </div>

              {filteredUsers.length > 0 ? (
                <div className="user-list">
                  {filteredUsers.map((username) => (
                    <div className="user-row" key={username}>
                      <div className="avatar">
                        {username.charAt(0).toUpperCase()}
                      </div>

                      <div className="user-info">
                        <strong>@{username}</strong>
                        <span>
                          {activeTab === "notFollowingBack"
                            ? "Não segue você de volta"
                            : "Você não segue esta conta"}
                        </span>
                      </div>

                      <button
                        className="text-button"
                        onClick={() => copyUsername(username)}
                      >
                        Copiar
                      </button>

                      <a
                        className="profile-link"
                        href={`https://www.instagram.com/${encodeURIComponent(username)}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir perfil de ${username}`}
                      >
                        <Icon name="external" size={17} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Icon name="check" size={25} />
                  </div>

                  <strong>
                    {search
                      ? "Nenhum usuário encontrado"
                      : "Nenhuma conta nesta lista"}
                  </strong>

                  <p>
                    {search
                      ? "Tente pesquisar outro nome."
                      : "Não há contas para exibir nesta categoria."}
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>

            <button
              className="icon-button"
              onClick={() => setError("")}
              aria-label="Fechar aviso"
            >
              <Icon name="close" size={17} />
            </button>
          </div>
        )}

        <footer className="page-footer">
          <span>followcheck · Instagram Analyzer</span>

          <span>
            <Icon name="shield" size={14} />
            Seus arquivos não são enviados para um servidor
          </span>
        </footer>
      </main>

      <input
        ref={fileInput}
        type="file"
        accept=".zip,.json,application/zip,application/json"
        multiple
        hidden
        onChange={handleImport}
      />
    </div>
  );
}
