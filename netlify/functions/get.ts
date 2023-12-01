import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import connection from '@netlify/planetscale';

const handler: Handler = async function (
  _event: HandlerEvent,
  context: HandlerContext
) {
  const { user } = context.clientContext as {
    identity: { url: string; token: string };
    user: { sub: string; email: string };
  };

  if (!user?.sub || !user?.email) {
    return {
      statusCode: 401,
      body: 'Unauthorized',
    };
  }

  // For demo purposes we only show some issues that do not have an email assigned
  // as those are some mock issues that we created for the demo. And we also show
  // issues that are assigned to the user.
  // In a real world scenario, you would want to show all issues that are assigned to the user.
  return await connection
    .execute(
      `
    SELECT * FROM issues
    WHERE assignee_email IS NULL OR assignee_email = ?
    `,
      [user.email]
    )
    .then((issues) => {
      const { rows } = issues;

      return {
        statusCode: 200,
        body: JSON.stringify(rows),
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
