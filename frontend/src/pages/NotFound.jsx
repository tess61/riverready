import { Link } from 'react-router-dom';
import { Empty } from '../components/Feedback.jsx';

export default function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <Empty title="That page does not exist.">
        <Link to="/">Go to your saved locations</Link>
      </Empty>
    </>
  );
}
