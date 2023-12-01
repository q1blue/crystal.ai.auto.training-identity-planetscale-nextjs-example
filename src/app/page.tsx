'use client';

import IssuesList from '@/components/IssuesList';
import Loading from '@/components/Loading';
import { AuthContext } from '@/context/authContext';
import { Issue, IssueFormData } from '@/types/types';
import { User } from 'netlify-identity-widget';
import { useContext, useEffect, useState } from 'react';

const fetchIssues = async (user: User) => {
  const res = await fetch('/.netlify/functions/get', {
    headers: {
      Authorization: `Bearer ${user?.token?.access_token}`,
    },
  });
  const data = await res.json();
  return data as Issue[];
};

export default function Home() {
  const { user } = useContext(AuthContext);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchIssues(user).then((issues) => {
        setIssues(issues);
        setLoading(false);
      });
    }
  }, [user]);

  const handleSubmit = async (formData: IssueFormData) => {
    try {
      await fetch(`/.netlify/functions/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token?.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (user) {
        fetchIssues(user).then((issues) => {
          setIssues(issues);
        });
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <IssuesList issues={issues} handleSubmit={handleSubmit} />
      )}
    </>
  );
}
