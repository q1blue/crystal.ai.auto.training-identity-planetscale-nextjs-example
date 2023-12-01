import { BsFillPersonFill } from 'react-icons/bs';
import { Issue, IssueFormData } from '@/types/types';
import IssueStatus from './IssueStatus';
import IssueForm from './IssueForm';
import '../styles/issues.css';

export default function IssuesList({
  issues,
  handleSubmit,
}: {
  issues: Issue[];
  handleSubmit: (formData: IssueFormData) => void;
}) {
  return (
    <>
      <IssueForm handleSubmit={handleSubmit} />
      <ul className='issues__list'>
        {issues.map((issue) => (
          <li key={issue.id}>
            <span className='issue__details'>
              <IssueStatus status={issue.status} /> {issue.title}
            </span>
            <span className='issue__details'>
              <BsFillPersonFill />
              {issue.assignee_name}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
