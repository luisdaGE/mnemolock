import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./AppShell";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { AuthPage } from "../features/auth/AuthPage";
import { HomePage } from "../features/home/HomePage";
import { InfoPage } from "../features/info/InfoPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { SourcesPage } from "../features/study-sources/SourcesPage";
import { StrategyPage } from "../features/strategy/StrategyPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="info/:slug" element={<InfoPage />} />
          <Route path="sources" element={<SourcesPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="strategy" element={<StrategyPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
