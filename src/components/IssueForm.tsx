import { IssueFormData } from '@/types/types';
import { useState } from 'react';

export default function IssueForm({
  handleSubmit,
}: {
  handleSubmit: (formData: IssueFormData) => void;
}) {
  const [issueTitle, setIssueTitle] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { value } = e.target;
    setIssueTitle(value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSubmit({ title: issueTitle });
      setIssueTitle('');
    } catch (error) {
      console.error('Error submitting issue:', error);
    }
  };

  return (
    <form className='issue__form' onSubmit={onSubmit}>
      <label className='visually-hidden' htmlFor='title'>
        Title:
      </label>
      <input
        onChange={handleInputChange}
        type='text'
        id='title'
        name='title'
        placeholder='Add an issue'
        required
        value={issueTitle}
      />

      <button className='btn btn--secondary' type='submit'>
        Submit
      </button>
    </form>
  );
}
