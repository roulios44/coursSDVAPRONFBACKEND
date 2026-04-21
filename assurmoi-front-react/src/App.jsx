import { useDeferredValue, useEffect, useMemo, useState } from "react";

const resourceConfig = {
  users: { label: "Utilisateurs", endpoint: "/users", empty: "Aucun utilisateur charge." },
  contrats: { label: "Contrats", endpoint: "/contrats", empty: "Aucun contrat charge." },
  sinistres: { label: "Sinistres", endpoint: "/sinistres", empty: "Aucun sinistre charge." },
  dossiers: { label: "Dossiers", endpoint: "/dossiers", empty: "Aucun dossier charge." },
  documents: { label: "Documents", endpoint: "/documents", empty: "Aucun document charge." },
  historiques: { label: "Historique", endpoint: "/historiques", empty: "Aucun historique charge." },
};

const initialForms = {
  login: { email: "", mot_de_passe: "" },
  twofa: { utilisateur_id: "", code: "" },
  user: {
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    mot_de_passe: "",
    role_nom: "ADMIN",
    statut: "actif",
    double_auth_active: false,
  },
  contrat: {
    assure_id: "",
    numero_contrat: "",
    type_contrat: "",
    franchise: "",
    date_debut: "",
    date_fin: "",
    statut: "",
  },
  sinistre: {
    assure_id: "",
    vehicule_id: "",
    cree_par: "",
    date_heure_appel: "",
    date_heure_sinistre: "",
    conducteur_nom: "",
    conducteur_prenom: "",
    conducteur_est_assure: true,
    contexte: "",
    responsabilite_engagee: false,
    pourcentage_responsabilite: "0",
    statut: "brouillon",
  },
  dossier: {
    sinistre_id: "",
    numero_dossier: "",
    charge_suivi_id: "",
    gestionnaire_id: "",
    scenario: "reparable",
    statut: "initialise",
    date_ouverture: "",
  },
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("assurmoi_token") || "");
  const [apiBase, setApiBase] = useState(() => localStorage.getItem("assurmoi_api_base") || "http://localhost:3000/api");
  const [feedback, setFeedback] = useState("Pret a dialoguer avec le backend.");
  const [currentView, setCurrentView] = useState("overview");
  const [currentResource, setCurrentResource] = useState("users");
  const [resources, setResources] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [forms, setForms] = useState(initialForms);

  useEffect(() => {
    localStorage.setItem("assurmoi_api_base", apiBase);
  }, [apiBase]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("assurmoi_token", token);
      return;
    }

    localStorage.removeItem("assurmoi_token");
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadOverview();
  }, []);

  async function apiFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBase.replace(/\/+$/, "")}${path}`, {
      ...options,
      headers,
    });

    const raw = await response.text();
    let payload = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch (_error) {
      payload = raw;
    }

    if (!response.ok) {
      throw new Error(payload?.message || `Erreur HTTP ${response.status}`);
    }

    return payload;
  }

  function updateForm(formName, field, value) {
    setForms((current) => ({
      ...current,
      [formName]: {
        ...current[formName],
        [field]: value,
      },
    }));
  }

  function resetForm(formName) {
    setForms((current) => ({ ...current, [formName]: initialForms[formName] }));
  }

  async function loadMany(keys) {
    const results = await Promise.allSettled(keys.map((key) => apiFetch(resourceConfig[key].endpoint)));
    setResources((current) => {
      const next = { ...current };
      results.forEach((result, index) => {
        const key = keys[index];
        next[key] = result.status === "fulfilled" ? toArray(result.value) : [];
      });
      return next;
    });
  }

  async function loadOverview() {
    if (!token) return;
    await loadMany(Object.keys(resourceConfig));
    setFeedback("Dashboard synchronise avec le backend.");
  }

  async function loadResource(resourceKey) {
    setCurrentView("resource");
    setCurrentResource(resourceKey);
    setSelectedItem(null);

    try {
      const payload = await apiFetch(resourceConfig[resourceKey].endpoint);
      const items = toArray(payload);
      setResources((current) => ({ ...current, [resourceKey]: items }));
      if (items.length) {
        setSelectedItem(items[0]);
      }
      setFeedback(`${resourceConfig[resourceKey].label} charge(s) avec succes.`);
    } catch (error) {
      setFeedback(error.message);
      setResources((current) => ({ ...current, [resourceKey]: [] }));
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const payload = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(forms.login),
      });

      if (payload?.data?.token) {
        setToken(payload.data.token);
        setFeedback("Connexion reussie. Session active.");
        await loadOverview();
        return;
      }

      if (payload?.data?.challenge === "2fa_required") {
        setForms((current) => ({
          ...current,
          twofa: {
            utilisateur_id: String(payload.data.utilisateur_id || ""),
            code: String(payload.data.code_demo || ""),
          },
        }));
        setFeedback("2FA requis. Le code demo a ete pre-rempli pour le dev.");
      }
    } catch (error) {
      setFeedback(error.message);
    }
  }

  async function handleTwoFactor(event) {
    event.preventDefault();
    try {
      const payload = await apiFetch("/auth/2fa/verify", {
        method: "POST",
        body: JSON.stringify({
          utilisateur_id: Number(forms.twofa.utilisateur_id),
          code: forms.twofa.code,
        }),
      });
      if (payload?.data?.token) {
        setToken(payload.data.token);
        setFeedback("Double authentification validee.");
        await loadOverview();
      }
    } catch (error) {
      setFeedback(error.message);
    }
  }

  async function handleLogout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (_error) {
      // purge locale meme si deja invalide
    }

    setToken("");
    setResources({});
    setSelectedItem(null);
    setCurrentView("overview");
    setFeedback("Session fermee.");
  }

  async function submitEntity(formName, endpoint, resourceKey, payload) {
    try {
      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      resetForm(formName);
      setFeedback(`${resourceConfig[resourceKey].label.slice(0, -1) || resourceConfig[resourceKey].label} cree(e).`);
      await loadMany([resourceKey]);
      if (currentView === "overview") {
        await loadMany(Object.keys(resourceConfig));
      }
      if (currentView === "resource" && currentResource === resourceKey) {
        await loadResource(resourceKey);
      }
    } catch (error) {
      setFeedback(error.message);
    }
  }

  const stats = useMemo(() => {
    const users = resources.users || [];
    const contrats = resources.contrats || [];
    const sinistres = resources.sinistres || [];
    const dossiers = resources.dossiers || [];

    return [
      { label: "Utilisateurs", value: users.length },
      { label: "Contrats", value: contrats.length },
      { label: "Sinistres", value: sinistres.length },
      { label: "Dossiers", value: dossiers.length },
    ];
  }, [resources]);

  const sinistresByStatut = useMemo(() => countBy(resources.sinistres || [], "statut"), [resources.sinistres]);
  const dossiersByScenario = useMemo(() => countBy(resources.dossiers || [], "scenario"), [resources.dossiers]);

  const visibleResourceItems = useMemo(() => {
    const items = resources[currentResource] || [];
    const normalized = deferredSearch.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(normalized));
  }, [resources, currentResource, deferredSearch]);

  const currentDetailTitle = selectedItem ? titleForItem(currentResource, selectedItem) : "Aucune selection";

  return (
    <div className="app-root">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <div className="page-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">A</div>
            <div>
              <p className="eyebrow">Gestion assurance</p>
              <h1>AssurMoi Console</h1>
            </div>
          </div>

          <section className="sidebar-card">
            <p className="sidebar-label">Connexion API</p>
            <label className="stack-field">
              <span>Base URL</span>
              <input value={apiBase} onChange={(event) => setApiBase(event.target.value)} />
            </label>
            <p className="sidebar-note">Le frontend React vise le backend sur `localhost:3000/api` par defaut.</p>
          </section>

          <nav className="nav-list">
            <SidebarButton active={currentView === "overview"} onClick={() => setCurrentView("overview")}>
              Vue d'ensemble
            </SidebarButton>
            <SidebarButton active={currentView === "operations"} onClick={() => setCurrentView("operations")}>
              Operations
            </SidebarButton>
            {Object.entries(resourceConfig).map(([key, item]) => (
              <SidebarButton
                key={key}
                active={currentView === "resource" && currentResource === key}
                onClick={() => loadResource(key)}
              >
                {item.label}
              </SidebarButton>
            ))}
          </nav>

          <section className="sidebar-card soft">
            <p className="sidebar-label">Etat session</p>
            <p>{token ? "Connecte" : "Non connecte"}</p>
            <button className="ghost-button" disabled={!token} onClick={handleLogout}>
              Se deconnecter
            </button>
          </section>

          <section className="sidebar-card soft">
            <p className="sidebar-label">Token</p>
            <p className="small-copy">{token ? `${token.slice(0, 36)}...` : "Aucun token charge"}</p>
          </section>
        </aside>

        <main className="main-panel">
          <section className="hero">
            <div className="hero-copy-wrap">
              <p className="eyebrow">React Console</p>
              <h2>Un cockpit React pour piloter contrats, utilisateurs, sinistres et dossiers.</h2>
              <p className="hero-copy">
                Cette version React reprend la logique de la V2 avec un dashboard plus vivant, un centre
                d'operations, des vues de ressources riches et une navigation plus naturelle.
              </p>
            </div>

            <div className="hero-badge-grid">
              <div className="hero-badge">
                <span>API cible</span>
                <strong>{apiBase}</strong>
              </div>
              <div className="hero-badge signal">
                <span>Etat</span>
                <strong>{token ? "Session active" : "Hors ligne"}</strong>
              </div>
            </div>
          </section>

          <section className="auth-grid">
            <article className="auth-card">
              <div className="card-head">
                <p className="eyebrow">Authentification</p>
                <h3>Connexion</h3>
              </div>
              <form className="stack-form" onSubmit={handleLogin}>
                <label className="stack-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={forms.login.email}
                    onChange={(event) => updateForm("login", "email", event.target.value)}
                    placeholder="admin@assurmoi.local"
                    required
                  />
                </label>
                <label className="stack-field">
                  <span>Mot de passe</span>
                  <input
                    type="password"
                    value={forms.login.mot_de_passe}
                    onChange={(event) => updateForm("login", "mot_de_passe", event.target.value)}
                    required
                  />
                </label>
                <button className="primary-button" type="submit">
                  Se connecter
                </button>
              </form>
            </article>

            <article className="auth-card">
              <div className="card-head">
                <p className="eyebrow">Double facteur</p>
                <h3>Verification 2FA</h3>
              </div>
              <form className="stack-form" onSubmit={handleTwoFactor}>
                <label className="stack-field">
                  <span>ID utilisateur</span>
                  <input
                    type="number"
                    value={forms.twofa.utilisateur_id}
                    onChange={(event) => updateForm("twofa", "utilisateur_id", event.target.value)}
                    required
                  />
                </label>
                <label className="stack-field">
                  <span>Code</span>
                  <input
                    value={forms.twofa.code}
                    onChange={(event) => updateForm("twofa", "code", event.target.value)}
                    required
                  />
                </label>
                <button className="secondary-button" type="submit">
                  Valider le code
                </button>
              </form>
            </article>
          </section>

          <section className="feedback-strip">
            <div className="feedback-card">
              <p className="sidebar-label">Dernier message</p>
              <p>{feedback}</p>
            </div>
            <div className="feedback-card accent">
              <p className="sidebar-label">Selection courante</p>
              <p>{selectedItem ? titleForItem(currentResource, selectedItem) : "Aucune fiche ouverte."}</p>
            </div>
          </section>

          {currentView === "overview" && (
            <section className="view-panel active">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Tableau de bord</p>
                  <h3>Vue d'ensemble de l'activite</h3>
                </div>
                <button className="ghost-button" onClick={loadOverview} disabled={!token}>
                  Actualiser
                </button>
              </div>

              <div className="stats-grid">
                {stats.map((item) => (
                  <article className="stat-card" key={item.label}>
                    <p>{item.label}</p>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>

              <div className="board-grid">
                <ChartCard title="Sinistres par statut" eyebrow="Repartition" data={sinistresByStatut} tone="accent" />
                <ChartCard title="Dossiers par scenario" eyebrow="Charge" data={dossiersByScenario} tone="olive" />
              </div>

              <div className="content-grid">
                <ListCard
                  eyebrow="Recents"
                  title="Derniers sinistres"
                  items={(resources.sinistres || []).slice(0, 5)}
                  renderItem={(item) => ({
                    title: `Sinistre #${item.id}`,
                    lines: [
                      `${item.conducteur_nom || "-"} ${item.conducteur_prenom || "-"}`,
                      `Statut: ${item.statut || "-"} | Vehicule: ${item.vehicule_id || "-"}`,
                    ],
                  })}
                />
                <ListCard
                  eyebrow="Suivi"
                  title="Dossiers ouverts"
                  items={(resources.dossiers || []).filter((item) => item.statut !== "clos").slice(0, 5)}
                  renderItem={(item) => ({
                    title: item.numero_dossier || `Dossier #${item.id}`,
                    lines: [`Scenario: ${item.scenario || "-"}`, `Statut: ${item.statut || "-"}`],
                  })}
                />
              </div>
            </section>
          )}

          {currentView === "operations" && (
            <section className="view-panel active">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Centre d'operations</p>
                  <h3>Creer rapidement les objets cles</h3>
                </div>
                <button className="ghost-button" onClick={() => loadMany(Object.keys(resourceConfig))} disabled={!token}>
                  Synchroniser
                </button>
              </div>

              <div className="operations-grid">
                <FormCard eyebrow="Creation" title="Utilisateur">
                  <form
                    className="stack-form compact-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      submitEntity("user", "/users", "users", forms.user);
                    }}
                  >
                    <InputPair label="Nom" value={forms.user.nom} onChange={(value) => updateForm("user", "nom", value)} />
                    <InputPair label="Prenom" value={forms.user.prenom} onChange={(value) => updateForm("user", "prenom", value)} />
                    <InputPair label="Email" type="email" value={forms.user.email} onChange={(value) => updateForm("user", "email", value)} />
                    <InputPair label="Telephone" value={forms.user.telephone} onChange={(value) => updateForm("user", "telephone", value)} required={false} />
                    <InputPair
                      label="Mot de passe"
                      type="password"
                      value={forms.user.mot_de_passe}
                      onChange={(value) => updateForm("user", "mot_de_passe", value)}
                    />
                    <SelectPair label="Role" value={forms.user.role_nom} onChange={(value) => updateForm("user", "role_nom", value)} options={["ADMIN", "GESTIONNAIRE", "CHARGE_SUIVI", "CHARGE_CLIENTELE", "ASSURE"]} />
                    <SelectPair label="Statut" value={forms.user.statut} onChange={(value) => updateForm("user", "statut", value)} options={["actif", "inactif"]} />
                    <CheckPair
                      label="2FA active"
                      checked={forms.user.double_auth_active}
                      onChange={(value) => updateForm("user", "double_auth_active", value)}
                    />
                    <button className="primary-button" type="submit">
                      Creer l'utilisateur
                    </button>
                  </form>
                </FormCard>

                <FormCard eyebrow="Creation" title="Contrat">
                  <form
                    className="stack-form compact-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      submitEntity("contrat", "/contrats", "contrats", {
                        assure_id: Number(forms.contrat.assure_id),
                        numero_contrat: forms.contrat.numero_contrat,
                        type_contrat: forms.contrat.type_contrat,
                        franchise: toNullableNumber(forms.contrat.franchise),
                        date_debut: forms.contrat.date_debut || null,
                        date_fin: forms.contrat.date_fin || null,
                        statut: forms.contrat.statut || null,
                      });
                    }}
                  >
                    <InputPair label="ID assure" type="number" value={forms.contrat.assure_id} onChange={(value) => updateForm("contrat", "assure_id", value)} />
                    <InputPair label="Numero contrat" value={forms.contrat.numero_contrat} onChange={(value) => updateForm("contrat", "numero_contrat", value)} />
                    <InputPair label="Type contrat" value={forms.contrat.type_contrat} onChange={(value) => updateForm("contrat", "type_contrat", value)} />
                    <InputPair label="Franchise" type="number" value={forms.contrat.franchise} onChange={(value) => updateForm("contrat", "franchise", value)} required={false} />
                    <InputPair label="Date debut" type="date" value={forms.contrat.date_debut} onChange={(value) => updateForm("contrat", "date_debut", value)} required={false} />
                    <InputPair label="Date fin" type="date" value={forms.contrat.date_fin} onChange={(value) => updateForm("contrat", "date_fin", value)} required={false} />
                    <InputPair label="Statut" value={forms.contrat.statut} onChange={(value) => updateForm("contrat", "statut", value)} required={false} />
                    <button className="secondary-button" type="submit">
                      Creer le contrat
                    </button>
                  </form>
                </FormCard>

                <FormCard eyebrow="Creation" title="Sinistre">
                  <form
                    className="stack-form compact-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      submitEntity("sinistre", "/sinistres", "sinistres", {
                        assure_id: Number(forms.sinistre.assure_id),
                        vehicule_id: Number(forms.sinistre.vehicule_id),
                        cree_par: Number(forms.sinistre.cree_par),
                        date_heure_appel: toIsoOrNull(forms.sinistre.date_heure_appel),
                        date_heure_sinistre: toIsoOrNull(forms.sinistre.date_heure_sinistre),
                        conducteur_nom: forms.sinistre.conducteur_nom,
                        conducteur_prenom: forms.sinistre.conducteur_prenom,
                        conducteur_est_assure: forms.sinistre.conducteur_est_assure,
                        contexte: forms.sinistre.contexte,
                        responsabilite_engagee: forms.sinistre.responsabilite_engagee,
                        pourcentage_responsabilite: Number(forms.sinistre.pourcentage_responsabilite),
                        statut: forms.sinistre.statut,
                      });
                    }}
                  >
                    <InputPair label="ID assure" type="number" value={forms.sinistre.assure_id} onChange={(value) => updateForm("sinistre", "assure_id", value)} />
                    <InputPair label="ID vehicule" type="number" value={forms.sinistre.vehicule_id} onChange={(value) => updateForm("sinistre", "vehicule_id", value)} />
                    <InputPair label="ID createur" type="number" value={forms.sinistre.cree_par} onChange={(value) => updateForm("sinistre", "cree_par", value)} />
                    <InputPair label="Date appel" type="datetime-local" value={forms.sinistre.date_heure_appel} onChange={(value) => updateForm("sinistre", "date_heure_appel", value)} />
                    <InputPair label="Date sinistre" type="datetime-local" value={forms.sinistre.date_heure_sinistre} onChange={(value) => updateForm("sinistre", "date_heure_sinistre", value)} />
                    <InputPair label="Nom conducteur" value={forms.sinistre.conducteur_nom} onChange={(value) => updateForm("sinistre", "conducteur_nom", value)} />
                    <InputPair label="Prenom conducteur" value={forms.sinistre.conducteur_prenom} onChange={(value) => updateForm("sinistre", "conducteur_prenom", value)} />
                    <CheckPair
                      label="Conducteur assure"
                      checked={forms.sinistre.conducteur_est_assure}
                      onChange={(value) => updateForm("sinistre", "conducteur_est_assure", value)}
                    />
                    <CheckPair
                      label="Responsabilite engagee"
                      checked={forms.sinistre.responsabilite_engagee}
                      onChange={(value) => updateForm("sinistre", "responsabilite_engagee", value)}
                    />
                    <label className="stack-field full">
                      <span>Contexte</span>
                      <textarea
                        rows="3"
                        value={forms.sinistre.contexte}
                        onChange={(event) => updateForm("sinistre", "contexte", event.target.value)}
                      />
                    </label>
                    <SelectPair
                      label="Pourcentage responsabilite"
                      value={forms.sinistre.pourcentage_responsabilite}
                      onChange={(value) => updateForm("sinistre", "pourcentage_responsabilite", value)}
                      options={["0", "50", "100"]}
                    />
                    <SelectPair
                      label="Statut"
                      value={forms.sinistre.statut}
                      onChange={(value) => updateForm("sinistre", "statut", value)}
                      options={["brouillon", "complet", "en_cours", "clos"]}
                    />
                    <button className="primary-button" type="submit">
                      Declarer le sinistre
                    </button>
                  </form>
                </FormCard>

                <FormCard eyebrow="Creation" title="Dossier">
                  <form
                    className="stack-form compact-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      submitEntity("dossier", "/dossiers", "dossiers", {
                        sinistre_id: Number(forms.dossier.sinistre_id),
                        numero_dossier: forms.dossier.numero_dossier,
                        charge_suivi_id: toNullableNumber(forms.dossier.charge_suivi_id),
                        gestionnaire_id: toNullableNumber(forms.dossier.gestionnaire_id),
                        scenario: forms.dossier.scenario,
                        statut: forms.dossier.statut,
                        date_ouverture: toIsoOrNull(forms.dossier.date_ouverture),
                      });
                    }}
                  >
                    <InputPair label="ID sinistre" type="number" value={forms.dossier.sinistre_id} onChange={(value) => updateForm("dossier", "sinistre_id", value)} />
                    <InputPair label="Numero dossier" value={forms.dossier.numero_dossier} onChange={(value) => updateForm("dossier", "numero_dossier", value)} />
                    <InputPair label="ID charge suivi" type="number" value={forms.dossier.charge_suivi_id} onChange={(value) => updateForm("dossier", "charge_suivi_id", value)} required={false} />
                    <InputPair label="ID gestionnaire" type="number" value={forms.dossier.gestionnaire_id} onChange={(value) => updateForm("dossier", "gestionnaire_id", value)} required={false} />
                    <SelectPair label="Scenario" value={forms.dossier.scenario} onChange={(value) => updateForm("dossier", "scenario", value)} options={["reparable", "non_reparable"]} />
                    <InputPair label="Statut" value={forms.dossier.statut} onChange={(value) => updateForm("dossier", "statut", value)} />
                    <InputPair label="Date ouverture" type="datetime-local" value={forms.dossier.date_ouverture} onChange={(value) => updateForm("dossier", "date_ouverture", value)} required={false} />
                    <button className="secondary-button" type="submit">
                      Creer le dossier
                    </button>
                  </form>
                </FormCard>
              </div>
            </section>
          )}

          {currentView === "resource" && (
            <section className="view-panel active">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Exploration</p>
                  <h3>{resourceConfig[currentResource].label}</h3>
                </div>
                <div className="section-actions">
                  <input
                    type="search"
                    placeholder="Filtrer par texte..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <button className="ghost-button" onClick={() => loadResource(currentResource)} disabled={!token}>
                    Recharger
                  </button>
                </div>
              </div>

              <div className="resource-layout">
                <article className="surface-card">
                  <div className="table-meta">
                    <p>{`${visibleResourceItems.length} element(s) affiches sur ${(resources[currentResource] || []).length} charge(s).`}</p>
                  </div>

                  <div className="resource-cards">
                    {visibleResourceItems.slice(0, 12).map((item) => (
                      <button
                        className={`resource-card ${selectedItem?.id === item.id ? "active" : ""}`}
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="resource-card-head">
                          <strong>{titleForItem(currentResource, item)}</strong>
                          <span className="pill">{item.statut || item.role_nom || item.action || `id:${item.id}`}</span>
                        </div>
                        <span>{smallMeta(item)}</span>
                      </button>
                    ))}
                  </div>

                  <DataTable items={visibleResourceItems} resourceKey={currentResource} selectedItem={selectedItem} onSelect={setSelectedItem} />
                </article>

                <article className="surface-card detail-panel">
                  <div className="card-head">
                    <p className="eyebrow">Fiche detail</p>
                    <h3>{currentDetailTitle}</h3>
                  </div>

                  <div className="detail-meta">{selectedItem ? smallMeta(selectedItem) : "Choisis une ligne pour inspecter l'objet."}</div>
                  <div className="detail-properties">
                    {selectedItem &&
                      Object.entries(selectedItem).map(([key, value]) => (
                        <div className="detail-row" key={key}>
                          <span>{key}</span>
                          <span dangerouslySetInnerHTML={{ __html: formatScalar(value) }} />
                        </div>
                      ))}
                  </div>
                  <pre className="detail-json">{selectedItem ? JSON.stringify(selectedItem, null, 2) : ""}</pre>
                </article>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarButton({ active, onClick, children }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function FormCard({ eyebrow, title, children }) {
  return (
    <article className="surface-card form-card">
      <div className="card-head">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
      </div>
      {children}
    </article>
  );
}

function InputPair({ label, value, onChange, type = "text", required = true }) {
  return (
    <label className="stack-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}

function SelectPair({ label, value, onChange, options }) {
  return (
    <label className="stack-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckPair({ label, checked, onChange }) {
  return (
    <label className="checkbox-row full">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function ListCard({ eyebrow, title, items, renderItem }) {
  return (
    <article className="surface-card">
      <div className="card-head">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
      </div>
      <div className="list-shell">
        {items.length ? (
          items.map((item) => {
            const data = renderItem(item);
            return (
              <div className="list-item" key={item.id}>
                <strong>{data.title}</strong>
                {data.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            );
          })
        ) : (
          <div className="list-item">
            <strong>Aucune donnee</strong>
            <span>Cette zone se remplira apres synchronisation.</span>
          </div>
        )}
      </div>
    </article>
  );
}

function ChartCard({ eyebrow, title, data, tone }) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, value]) => sum + value, 0) || 1;

  return (
    <article className="surface-card">
      <div className="card-head">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
      </div>
      <div className="chart-list">
        {entries.length ? (
          entries.map(([label, value]) => {
            const percent = Math.round((value / total) * 100);
            return (
              <div className={`chart-row ${tone === "olive" ? "olive" : ""}`} key={label}>
                <div className="chart-row-head">
                  <strong>{label}</strong>
                  <span>{`${value} (${percent}%)`}</span>
                </div>
                <div className="chart-bar">
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="list-item">
            <strong>Aucune donnee</strong>
            <span>Le graphique se remplira apres synchronisation.</span>
          </div>
        )}
      </div>
    </article>
  );
}

function DataTable({ items, resourceKey, selectedItem, onSelect }) {
  if (!items.length) {
    return (
      <div className="table-container">
        <div className="list-item">
          <strong>Aucune donnee</strong>
          <span>{resourceConfig[resourceKey].empty}</span>
        </div>
      </div>
    );
  }

  const preferredColumns = [
    "id",
    "nom",
    "prenom",
    "email",
    "role_nom",
    "numero_contrat",
    "type_contrat",
    "numero_dossier",
    "statut",
    "scenario",
    "action",
    "date_action",
    "conducteur_nom",
    "conducteur_prenom",
  ];

  const allKeys = [...new Set(items.flatMap((item) => Object.keys(item)))];
  const columns = [...preferredColumns.filter((key) => allKeys.includes(key)), ...allKeys.filter((key) => !preferredColumns.includes(key))];

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className={selectedItem?.id === item.id ? "selected" : ""}
              onClick={() => onSelect(item)}
            >
              {columns.map((column) => {
                const value = item[column];
                const renderPill = typeof value === "string" && ["statut", "role_nom", "scenario", "action"].includes(column);
                return (
                  <td key={column}>
                    {renderPill ? <span className="pill">{value}</span> : <span dangerouslySetInnerHTML={{ __html: formatScalar(value) }} />}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function toArray(payload) {
  return Array.isArray(payload?.data) ? payload.data : [];
}

function toNullableNumber(value) {
  return value === "" ? null : Number(value);
}

function toIsoOrNull(value) {
  return value ? new Date(value).toISOString() : null;
}

function titleForItem(resourceKey, item) {
  if (!item) return "Aucune selection";
  if (resourceKey === "users") return `${item.prenom || ""} ${item.nom || ""}`.trim() || `Utilisateur #${item.id}`;
  if (resourceKey === "contrats") return item.numero_contrat || `Contrat #${item.id}`;
  if (resourceKey === "sinistres") return `Sinistre #${item.id}`;
  if (resourceKey === "dossiers") return item.numero_dossier || `Dossier #${item.id}`;
  if (resourceKey === "documents") return item.nom_document || item.type_document || `Document #${item.id}`;
  if (resourceKey === "historiques") return item.action || `Historique #${item.id}`;
  return `${resourceConfig[resourceKey]?.label || "Element"} #${item.id}`;
}

function smallMeta(item) {
  return [item.email, item.role_nom, item.statut, item.numero_contrat, item.numero_dossier, item.scenario, item.action]
    .filter(Boolean)
    .join(" | ") || "Aucune meta disponible";
}

function countBy(items, key) {
  return items.reduce((accumulator, item) => {
    const label = item[key] || "inconnu";
    accumulator[label] = (accumulator[label] || 0) + 1;
    return accumulator;
  }, {});
}

function formatScalar(value) {
  if (value === null || value === undefined || value === "") {
    return '<span class="muted">-</span>';
  }

  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }

  if (typeof value === "object") {
    if (value.nom) return escapeHtml(value.nom);
    if (value.numero_contrat) return escapeHtml(value.numero_contrat);
    if (value.numero_dossier) return escapeHtml(value.numero_dossier);
    return `<span class="muted">${escapeHtml(JSON.stringify(value))}</span>`;
  }

  return escapeHtml(String(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default App;
