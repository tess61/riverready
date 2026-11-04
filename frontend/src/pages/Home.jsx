import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import LocationCard from '../components/LocationCard.jsx';
import { Empty, ErrorNotice, Loading } from '../components/Feedback.jsx';

export default function Home() {
  const { data, loading, error, reload } = useApi((s) => api.listLocations(s), []);
  return (
    <>
      <div className="page-head">
        <h1>My locations</h1>
        <Link to="/search" className="btn btn-primary">Add a location</Link>
      </div>
      {loading && <Loading label="Loading your locations…" />}
      {error && <ErrorNotice error={error} onRetry={reload} title="Could not load your locations" />}
      {data && data.length === 0 && (
        <Empty title="No saved locations yet.">
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
