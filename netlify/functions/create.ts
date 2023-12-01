import connection from '@netlify/planetscale';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const handler: Handler = async function (
  event: HandlerEvent,
  context: HandlerContext
) {
  const { user } = context.clientContext as {
    identity: { url: string; token: string };
    user: { sub: string; email: string; user_metadata: { full_name: string } };
  };
  if (!event.body) {
    return {
      statusCode: 400,
      body: 'Provide a title for the issue',
    };
  }
  if (!user?.sub || !user?.email) {
    return {
      statusCode: 401,
      body: 'Unauthorized',
    };
  }

  const body = JSON.parse(event.body);

  return connection
    .execute(
      `
    INSERT INTO issues (title, assignee_name, assignee_email)
    VALUES (?, ?, ?)
    `,
      [body.title, user.user_metadata.full_name, user.email]
    )
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Issue created' }),
      };
    })
    .catch((error) => {
      return {
        statusCode: 500,
        body: `Internal Server Error: ${error}`,
      };
    });
};

export { handler };
