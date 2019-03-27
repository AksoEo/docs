# Client authorization
AKSO employs a granular permissions model limiting access not only according to HTTP verb, but also by column, by metadata, etc. The easiest way to get an overview of which permissions are necessary for each API call.

The checklist to ensure that your API call is legal is:
1. Ensure that the given combination of resource identifier (path) and HTTP verb (method) is allowed
2. Ensure that the fields used in the query string (e.g. `fields` and `filter`) are allowed
3. Ensure that the request doesn't apply other access control restrictions based on the concerning resource.

	An example of this could be that your client is only permitted to access `HumanCodeholder` resources with an age of 13+.

4. Ensure that no other special permissions are required to perform the request

If you're unsure which permissions your client has, a `GET` request to `/auth/permissions` may be made.

If a client attempts to make an unauthorized API call, the server will respond with an HTTP 401 Unauthorized status.

Permissions are granted to clients using the following protocol:
1. Hardcoded business logic

	E.g. clients using user access as their authentication method are always allowed to modify certain fields in their own `Codeholder` resource.

2. Role-based permissions

	Clients may partain to roles providing certain permissions.

3. Per client additions

	Clients may be granted specific permissions on a per client basis.

4. Per client exclusions

	Clients may be denied specific permissions overriding previously granted permissions on a per client basis.
