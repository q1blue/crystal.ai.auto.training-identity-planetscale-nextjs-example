# Netlify Identity + PlanetScale + Next.js example

This is an example of how to use [Netlify Identity](https://www.netlify.com/docs/identity/) with Netlify's [PlanetScale](https://planetscale.com/) integration and [Next.js](https://nextjs.org/). This README.md will walk you through the most important steps to make it yourself! You can also just press the following button and follow steps TODO

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=)

## Steps

### 1. Create a Netlify site

Let's create a basic Next.js site and deploy it to Netlify! In your terminal run:

```bash
npx create-next-app
```

Follow the default options, we went with using the `src` directory. Then, let's deploy it to Netlify. Make sure to have the [Netlify CLI](https://docs.netlify.com/cli/get-started/) installed and to have logged in with `netlify login`. Then, run:

```bash
cd my-next-app
netlify init
```

Follow the prompts and then when you're done, run `netlify open` to open your site's settings in your Netlify account.

### 2. Enable Netlify Identity

In your Netlify site's settings, go to the Identity tab and enable Identity. We won't be using any external providers for this example.

### 3. Enable PlanetScale

Make sure you have a [PlanetScale account](https://auth.planetscale.com/sign-up) and a [database](https://planetscale.com/docs/tutorials/planetscale-quick-start-guide). The database should have the following table:

```sql
CREATE TABLE `issues` (
	`id` int NOT NULL AUTO_INCREMENT,
	`title` varchar(255) NOT NULL,
	`assignee_name` varchar(255) NOT NULL,
	`assignee_email` varchar(255),
	`status` enum('to-do', 'in progress', 'done') DEFAULT 'to-do',
	PRIMARY KEY (`id`)
);
```

In your Netlify site view, go to Integrations and under Database enable PlanetScale. On the next page, click 'connect'. You'll be redirected to PlanetScale where you can authorize Netlify to access your database. Once you've done that, you'll be redirected back to Netlify and you can select your organization, database and configure which PlanetScale branch should be used in what environments for your Netlify site.

### 4. Configure your Next.js app

Now that we have Netlify Identity and PlanetScale enabled, let's configure our Next.js app to use them. First, let's install the dependencies we'll need:

```bash
npm install netlify-identity-widget @types/netlify-identity-widget @netlify/functions @netlify/planetscale
```

### 5. Configure Netlify Identity

We'll be using [React Context](https://react.dev/learn/passing-data-deeply-with-context) to make the Netlify Identity instance available to all components in our app. Create a new file `src/context/authContext.tsx` and add the following contents:

```tsx
// src/context/authContext.tsx
import netlifyIdentity, { type User } from 'netlify-identity-widget';

declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

interface NetlifyAuth {
  isAuthenticated: boolean;
  user: User | null;
  initialize(callback: (user: User | null) => void): void;
  authenticate(callback: (user: User) => void): void;
  signout(callback: () => void): void;
}

const netlifyAuth: NetlifyAuth = {
  isAuthenticated: false,
  user: null,
  initialize(callback) {
    window.netlifyIdentity = netlifyIdentity;
    netlifyIdentity.on('init', (user: User | null) => {
      callback(user);
    });
    netlifyIdentity.init();
  },
  authenticate(callback) {
    this.isAuthenticated = true;
    netlifyIdentity.open();
    netlifyIdentity.on('login', (user) => {
      this.user = user;
      callback(user);
      netlifyIdentity.close();
    });
  },
  signout(callback) {
    this.isAuthenticated = false;
    netlifyIdentity.logout();
    netlifyIdentity.on('logout', () => {
      this.user = null;
      callback();
    });
  },
};
```

This will create a `netlifyAuth` object that we can use to interact with Netlify Identity. Now let's create `AuthContext` and use the `netlifyAuth` object we just created.

```tsx
// src/context/authContext.tsx
interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
  deleteAccount?: () => void;
}
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: false,
  deleteAccount: () => {},
});
```

And then we'll create the provider:

```tsx
// src/context/authContext.tsx
export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loggedIn, setLoggedIn] = useState<boolean>(
    netlifyAuth.isAuthenticated
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = () => {
    netlifyAuth.authenticate((user) => {
      setLoggedIn(!!user);
      setUser(user);
    });
  };

  const logout = () => {
    netlifyAuth.signout(() => {
      setLoggedIn(false);
      setUser(null);
    });
  };

  const deleteAccount = () => {
    // TODO
  };

  useEffect(() => {
    netlifyAuth.initialize((user: User | null) => {
      setUser(user);
      setLoggedIn(!!user);
    });
    setLoading(false);
  }, [loggedIn]);

  const contextValues = { user, login, logout, loading, deleteAccount };

  return (
    <AuthContext.Provider value={contextValues}>
      {children}
    </AuthContext.Provider>
  );
};
```

Now inside of your app's layout file, in our case `src/app/layout.tsx`, we'll wrap the app in the `AuthContextProvider`:

```tsx
// src/app/layout.tsx
'use client';

import { AuthContextProvider } from '@/context/authContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}
```

This means that all children of the `AuthContextProvider` will have access to the `AuthContext` we created earlier. Now we'll be able to use the different functions from the `AuthContext` to add `login` and `logout` buttons to our app.

```tsx
// src/app/page.tsx
'use client';

import { AuthContext } from '@/context/authContext';
import { User } from 'netlify-identity-widget';
import { useContext, useEffect, useState } from 'react';

export default function Home() {
  const { user, login, logout, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return user ? (
    <>
      <button onClick={logout}>Log out</button>
    </>
  ) : (
    <button onClick={login}>Log in / Register</button>
  );
}
```

To try it out, run `netlify dev` and open your app in the browser. You should now be able to log in and log out! You can also check the Netlify Identity tab in your Netlify site settings view to see the users that have been created.

### 6. Adding a form to create issues

Now that we have Netlify Identity set up, let's add a form to create issues in our PlanetScale database. Add the following code to `src/app/page.tsx`:

```tsx
// src/app/page.tsx
'use client';

import { AuthContext } from '@/context/authContext';
import { User } from 'netlify-identity-widget';
import { useContext, useEffect, useState } from 'react';

export default function Home() {
  const { user, login, logout, loading } = useContext(AuthContext);

  const handleSubmit = async (formData: { title: string }) => {
    try {
      await fetch(`/.netlify/functions/create`, {
        method: 'POST',
        headers: {
          // this will ensure that the Netlify function has access to the user object.
          Authorization: `Bearer ${user?.token?.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
        }),
      });
    } catch (error) {
      console.error('Error submitting issue:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return user ? (
    <>
      {/* Our new form */}
      <form onSubmit={onSubmit}>
        <label htmlFor='title'>Title:</label>
        <input
          onChange={handleInputChange}
          type='text'
          id='title'
          name='title'
          placeholder='Add an issue'
          required
          value={issueTitle}
        />

        <button type='submit'>Submit</button>
      </form>
      <button onClick={logout}>Log out</button>
    </>
  ) : (
    <button onClick={login}>Log in / Register</button>
  );
}
```

Now we'll need to create a serverless function to handle the form submission. Create a new file `netlify/functions/create.ts` and add the following code:

```ts
// netlify/functions/create.ts
import connection from '@netlify/planetscale';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const handler: Handler = async function (
  event: HandlerEvent,
  context: HandlerContext
) {
  // We get the user from the context's clientContext
  const { user } = context.clientContext as {
    identity: { url: string; token: string };
    user: { sub: string; email: string; user_metadata: { full_name: string } };
  };

  if (!event.body) {
    return {
      statusCode: 400,
      body: 'Please provide a title for the issue',
    };
  }
  // This checks wether the user is logged in or not
  if (!user?.sub || !user?.email) {
    return {
      statusCode: 401,
      body: 'Unauthorized',
    };
  }

  const body = JSON.parse(event.body);

  // We insert the issue into the PlanetScale database using the user's name and email from the user object
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
```

It should now be possible to create issues in your PlanetScale database! Try adding one and then checking your PlanetScale database to see if it worked.

### 7. Adding a list of issues

Now that we can create issues, let's add a list of issues to our app. We'll create a new serverless function to get all issues from our PlanetScale database. Create a new file `netlify/functions/get.ts` and add the following code:

```ts
// netlify/functions/get.ts
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import connection from '@netlify/planetscale';

const handler: Handler = async function (
  _event: HandlerEvent,
  context: HandlerContext
) {
  // We get the user from the context's clientContext
  const { user } = context.clientContext as {
    identity: { url: string; token: string };
    user: { sub: string; email: string };
  };

  // This checks wether the user is logged in or not
  if (!user?.sub || !user?.email) {
    return {
      statusCode: 401,
      body: 'Unauthorized',
    };
  }

  // We get all issues from the PlanetScale database
  return await connection
    .execute(`SELECT * FROM issues`)
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
```

Now inside of `src/app/page.tsx` we'll add a new `useEffect` hook to fetch the issues from our PlanetScale database. We'll also add a new state variable to store the issues in. The code will look like this:

```tsx
// src/app/page.tsx
'use client';

import { AuthContext } from '@/context/authContext';
import { User } from 'netlify-identity-widget';
import { useContext, useEffect, useState } from 'react';

export default function Home() {
  const { user, login, logout, loading } = useContext(AuthContext);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchIssues(user).then((issues) => {
        setIssues(issues);
        setLoadingIssues(false);
      });
    }
  }, [user]);

  const handleSubmit = async (formData: { title: string }) => {
    try {
      await fetch(`/.netlify/functions/create`, {
        method: 'POST',
        headers: {
          // this will ensure that the Netlify function has access to the user object.
          Authorization: `Bearer ${user?.token?.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      // Also fetch the issues again after creating a new one
      if (user) {
        fetchIssues(user).then((issues) => {
          setIssues(issues);
        });
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
    }
  };

  if (loading || loadingIssues) return <div>Loading...</div>;

  return user ? (
    <>
      {/* Our new form */}
      <form onSubmit={onSubmit}>
        <label htmlFor='title'>Title:</label>
        <input
          onChange={handleInputChange}
          type='text'
          id='title'
          name='title'
          placeholder='Add an issue'
          required
          value={issueTitle}
        />

        <button type='submit'>Submit</button>
      </form>
			{/* List our issues */}
			<ul>
				{issues.map((issue) => (
					<li key={issue.id}>{issue.title}</li>
				))}
      <button onClick={logout}>Log out</button>
    </>
  ) : (
    <button onClick={login}>Log in / Register</button>
  );
}
```

### #. Delete users from Netlify Identity and their entries from PlanetScale

We want to make sure that users can also delete their account and issues. Let's make a new [serverless function](https://docs.netlify.com/functions/get-started/?fn-language=ts) in `netlify/functions/delete.ts`. In that file we'll check if the user is currently logged in and authenticated, and then we delete that user Netlify Identity, and delete all of their entries from our PlanetScale database. The code will look like this:

```ts
// netlify/functions/delete.ts
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
```

Inside the `deleteAccount` function in the `authContext` file, we'll do a call to the function we just created. We'll first ask the user to confirm they want to delete their account, and then we'll call the serverless function. The code will look like this:

```tsx
// src/context/authContext.tsx
const deleteAccount = () => {
  if (
    window.confirm(
      'Are you sure? This will delete the issues you created and your account. '
    )
  ) {
    fetch('/.netlify/functions/delete', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${user?.token?.access_token}`,
      },
    })
      .then(async () => logout())
      .catch((err) => console.error(err));
  }
};
```

This function is exported in the `AuthContext` provider, so you can use it in any children of the `AuthContextProvider`. For example by providing a button that calls the function.

```tsx
// src/app/page.tsx
'use client';

import { AuthContext } from '@/context/authContext';
import { User } from 'netlify-identity-widget';
import { useContext, useEffect, useState } from 'react';

export default function Home() {
  const { user, login, logout, loading, deleteAccount } =
    useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return user ? (
    <>
      <button onClick={logout}>Log out</button>
      <button onClick={deleteAccount}>Delete account</button>
    </>
  ) : (
    <button onClick={login}>Log in / Register</button>
  );
}
```
