import { Link } from 'react-router-dom';
import { Empty } from '../components/Feedback.jsx';
import EmptyScene from '../components/EmptyScene.jsx';
import { ArrowLeftIcon } from '../components/icons/index.jsx';
import { useTitle } from '../hooks/useTitle.js';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <>
      <h1>Page not found</h1>
      <Empty title="That page does not exist." art={<EmptyScene />}>
        <Link to="/" className="btn btn-primary empty-cta"><ArrowLeftIcon size={18} />Go to your saved locations</Link>
      </Empty>
    </>
  );
}
