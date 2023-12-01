import { BsCircleHalf, BsDashCircle, BsCheckCircleFill } from 'react-icons/bs';

export default function IssueStatus({ status }: { status: string }) {
  if (status === 'to-do') {
    return (
      <BsDashCircle alt='to-do' className='issue__status issue__status--todo' />
    );
  } else if (status === 'in progress') {
    return (
      <BsCircleHalf
        alt='in progress'
        className='issue__status issue__status--in-progress'
      />
    );
  }
  return (
    <BsCheckCircleFill
      alt='done'
      className='issue__status issue__status--done'
    />
  );
}
