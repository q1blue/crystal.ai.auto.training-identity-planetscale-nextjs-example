import type { Handler, HandlerEvent, Config } from '@netlify/functions';
import connection from '@netlify/planetscale';

const keepDbAwake: Handler = async (_event: HandlerEvent) => {
  return await connection
    .execute(
      `
	SELECT * FROM issues
	WHERE assignee_email IS NULL`
    )
    .then((issues) => {
      const { rows } = issues;

      return {
        statusCode: 200,
        body: 'OK',
      };
    })
    .catch((error) => {
      return {
        statusCode: 500,
        body: `Internal Server Error: ${error}`,
      };
    });
};

export default keepDbAwake;

export const config: Config = {
  schedule: '@daily',
};
