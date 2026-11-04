import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import StationSearch from './pages/StationSearch.jsx';
import LocationForm from './pages/LocationForm.jsx';
import LocationDetail from './pages/LocationDetail.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
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
  );
}
