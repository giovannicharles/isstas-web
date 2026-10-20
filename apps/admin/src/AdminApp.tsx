import { Route, Routes } from 'react-router-dom';
import { AdminRoot } from './components/AdminRoot';
import { Shell } from './components/Shell';
import Applications from './pages/Applications';
import Chatbot from './pages/Chatbot';
import Dashboard from './pages/Dashboard';
import FloatingActions from './pages/FloatingActions';
import HomeBuilder from './pages/HomeBuilder';
import Login from './pages/Login';
import ResourceEdit from './pages/ResourceEdit';
import ResourceList from './pages/ResourceList';
import SettingsGroup from './pages/SettingsGroup';

/**
 * Administration : meme projet que le site, code separe, montee sous /admin (chargement a la demande :
 * le bundle admin n'est jamais telecharge par un visiteur du site).
 */
export default function AdminApp() {
  return (
    <AdminRoot>
      <Routes>
        <Route path="login" element={<Login mode="login" />} />
        <Route path="forgot-password" element={<Login mode="forgot" />} />
        <Route path="reset-password" element={<Login mode="reset" />} />
        <Route element={<Shell />}>
          <Route index element={<Dashboard />} />
          <Route path="candidatures" element={<Applications />} />
          <Route path="chatbot/:tab?" element={<Chatbot />} />
          <Route path="actions" element={<FloatingActions />} />
          <Route path="accueil/:section?" element={<HomeBuilder />} />
          <Route path="reglages/:group" element={<SettingsGroup />} />
          <Route path="r/:resource" element={<ResourceList />} />
          <Route path="r/:resource/nouveau" element={<ResourceEdit />} />
          <Route path="r/:resource/:id" element={<ResourceEdit />} />
        </Route>
      </Routes>
    </AdminRoot>
  );
}