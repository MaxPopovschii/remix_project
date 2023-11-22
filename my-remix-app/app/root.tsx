import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useEffect } from "react";
import appStyleHref from "./app.css";
import { json, redirect } from "@remix-run/node";
import { createEmptyContact, getContacts } from "./data";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  useSubmit,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStyleHref },
];

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");
  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <div>
            <Form
              id="search-form"
              onChange={(event) => {
                const isFirstSearch = q === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch,
                });
              }}
              role="search"
            >
              <input
                aria-label="Search contacts"
                defaultValue={q || ""}
                className={searching ? "Loading" : ""}
                id="q"
                name="q"
                placeholder="Search"
                type="search"
              />
              <div aria-hidden hidden={!searching} id="search-spinner" />
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    {contacts.length ? (
                      <ul>
                        {contacts.map((contact) => (
                          <li key={contact.id}>
                            <Link to={`contacts/${contact.id}`}>
                              {contact.first || contact.last ? (
                                <>
                                  {contact.first} {contact.last}
                                </>
                              ) : (
                                <i>No Name</i>
                              )}{" "}
                              {contact.favorite ? <span>★</span> : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>
                        <i>No contacts</i>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div
          className={
            navigation.state === "loading" && !searching ? "lodaing" : ""
          }
          id="detail"
        >
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
