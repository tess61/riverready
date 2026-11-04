import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { useTitle } from '../hooks/useTitle.js';
import LocationCard from '../components/LocationCard.jsx';
import { Empty, ErrorNotice, Loading } from '../components/Feedback.jsx';
import EmptyScene from '../components/EmptyScene.jsx';
import { AddIcon } from '../components/icons/index.jsx';

export default function Home() {
  const { data, loading, error, reload } = useApi((s) => api.listLocations(s), []);
  useTitle('My locations');
  return (
    <>
      <div className="page-head page-head-hero">
        <div>
          <h1>My locations</h1>
          <p className="lede">The places you care about, the river gauge next to each one, and how ready you are.</p>
        </div>
        <Link to="/search" className="btn btn-primary btn-lg"><AddIcon size={20} />Add a location</Link>
      </div>
      {loading && <Loading label="Loading your locations…" skeleton="cards" />}
      {error && <ErrorNotice error={error} onRetry={reload} title="Could not load your locations" />}
      {data && data.length === 0 && (
        <Empty title="No saved locations yet." art={<EmptyScene />}>
          Find a monitoring station near a place you care about, then save it here.
        </Empty>
      )}
      {data && data.length > 0 && (
        <ul className="cards">
          {data.map((l) => (
            <li key={l.id}>
              <LocationCard location={l} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
