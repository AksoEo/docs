# Client authentication
AKSO utilizes two different methods for client authentication.

CORS is not enabled, meaning that application access must be made from a server, and user access from one of the permitted origins (currently `*.akso.org`, `uea.org`, and `tejo.org`).

## Application access (for software)
Applications accessing AKSO's API should use HTTP basic access authentication using their API key as the username and the API secret as the password. This header must be set for each request that requires authentication.

All requests and changes made will be logged as resulting from the application and not any particular user.

For obvious reasons, these requests should never be made from the client side as this would expose the application's API secret.

## User access (for UEA codeholders)
Users accessing AKSO through the official interfaces (user or admin) must use session-based authentication. This is done by making a `PUT` request to `/auth` with the user's credentials. To end the session a `DELETE` request should be made to `/auth`.

All requests made using this method of authentication must include a CSRF token in the `X-CSRF-Token` HTTP header. This token is returned by the original `PUT` request to `/auth` and subsequent `GET` requests to `/auth`.

These requests should always be made from the client side as not to unnecessarily expose the user's credentials to any server.

For users accessing the administration panel at admin.akso.org 2FA is required. Certain IPs may be whitelisted, meaning that 2FA is not needed. The client should always check `GET /auth` to see if `totpUsed` is already set to true and only prompt the user to log in using 2FA if required.
