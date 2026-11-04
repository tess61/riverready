import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
const Home = lazy(() => import('./pages/Home.jsx'));
const StationSearch = lazy(() => import('./pages/StationSearch.jsx'));
const LocationForm = lazy(() => import('./pages/LocationForm.jsx'));
const LocationDetail = lazy(() => import('./pages/LocationDetail.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <Suspense fallback={<p role="status" aria-live="polite" style={{ padding: '1rem' }}>Loading…</p>}>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<StationSearch />} />
        <Route path="/locations/new" element={<LocationForm />} />
        <Route path="/locations/:id" element={<LocationDetail />} />
        <Route path="/locations/:id/edit" element={<LocationForm />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
