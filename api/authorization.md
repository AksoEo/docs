# Client authorization
AKSO employs a granular permissions model limiting access not only according to HTTP verb, but also by column, by metadata, etc. The easiest way to get an overview of which permissions are necessary for each API call.

## Permissions
Permissions use a hierarchial form of the type `codeholders.read`, `codeholders.write` etc. Wildcard permissions such as `codeholders.*` or `*` provide access to all permissions below its own level.

## Member restrictions
All API calls related to codeholders are subject to the member restrictions filter.

### memberFilter
The member filter is a filter in the style of `?filter` applied to all the user's codeholder requests. This limits which codeholders the user may access.

### memberFields
The member fields is an object of fields to flags defining the read-write access level of the client. If it's `null` the client is not subject to a whitelist and may access all fields.

## Checklist
The checklist to ensure that your API call is legal is:
1. Ensure that the given combination of resource identifier (path) and HTTP verb (method) is allowed

2. Ensure that the fields used in the query string (e.g. `fields` and `filter`) are allowed

3. Ensure that the request doesn't apply other access control restrictions based on the concerning resource.

	An example of this could be that your client is only permitted to access `HumanCodeholder` resources with an age of 13+.

4. Ensure that no other special permissions are required to perform the request

If you're unsure which permissions your client has, a `GET` request to `/perms` may be made.

If a client attempts to make an unauthorized API call, the server will respond with an HTTP 403 Unauthorized status.

Permissions are granted to clients using the following protocol:
1. Hardcoded business logic

	E.g. clients using user access as their authentication method may obtain certain permissions if they're active members

2. Role-based permissions

	Clients may partain to roles providing certain permissions.

3. Per client additions

	Specific permissions may be granted on a per client basis.
