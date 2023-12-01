import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import connection from '@netlify/planetscale';

const handler: Handler = async function (
  _event: HandlerEvent,
  context: HandlerContext
) {
  const { identity, user } = context.clientContext as {
    identity: { url: string; token: string };
    user: { sub: string; email: string };
  };

  if (!user?.sub || !user?.email) {
    return {
      statusCode: 401,
      body: 'Unauthorized',
    };
  }

  const userUrl = `${identity.url}/admin/users/{${user.sub}}`;
  const adminAuthHeader = `Bearer ${identity.token}`;

  return fetch(userUrl, {
    method: 'DELETE',
    headers: { Authorization: adminAuthHeader },
  })
    .then(async () => {
      console.log('Deleted a user!');

      await connection.execute(
        `
          DELETE FROM issues
          WHERE assignee_email = ?
          `,
        [user.email]
      );
    })
    .then(() => {
      console.log('Deleted all issues assigned to the user!');
      return { statusCode: 204 };
    })
    .catch((error) => ({
      statusCode: 500,
      body: `Internal Server Error: ${error}`,
    }));
};

export { handler };
