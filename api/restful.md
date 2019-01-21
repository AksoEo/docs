# RESTful API design principles
SAKo tries to conform to RESTful API design norms and principles, however, due to the complexity of some of the operations exposed through the API, it has been deemed needed to expand upon these.

## Content-Type
When using `application/vnd.msgpack` binary data must be encoded using the `bin` family. In `application/json` all binary data is encoded using base64 and represented as a string.

### Requests
All requests must use either `application/vnd.msgpack` (recommended) or `application/json` as their `Content-Type`.

### Responses
SAKo attempts to reply with a `Content-Type` acceptable by the client according to its `Accept` header. SAKo supports the following content types:
* `application/vnd.msgpack` (recommended)
* `application/json`
* `text/csv` (recommended for user exports only)

## URL length
Especially when querying collections, the length of URLs may become noticeably big. If the length of a URL exceed 2000 characters, it may cease to function on all stacks. For this reason, SAKo permits the use of the HTTP `X-Http-Method-Override` header on `POST` requests. In the case of `GET` and `DELETE` requests, SAKo expects the request body to contain the query string without the first question mark. Let's look at a fictional example putting this to use:

```
POST /users
X-Http-Method-Override: GET

limit=100&offset=20
```

is functionally equivalent to

```
GET /users?limit=100&offset=20
```

This use of method overriding should only be used when the URL length exceeds 2000 characters unless extra care is taken to ensure proper client-side caching. The cache headers returned when using method overriding are equivalent to those of a native request.

## Querying collections and resources
SAKo utilizes the query string to limit the scope of the data of a collection (`GET`, `DELETE` and `PATCH` only), of an operation performed on a collection (`POST` only) or the returned data of any other type of request. Let's start out by looking at a fictional example: `GET /users?limit=20` will return only 20 users.

All query parameters are optional and a request without any query parameters will always be valid.

The recognized parameters are as follows:
* `limit`: The maximum amount of items in the collection

	Valid in: Collections (`GET`, `DELETE`, `PATCH`, operations)

	Must be a positive non-zero integer. The maximum value is defined by the collection.

	Example: `?limit=20` to return a maximum of 20 items.

* `offset`: The location at which to commence the lookup

	Valid in: Collections (`GET`, `DELETE`, `PATCH`, operations)

	Must be a positive non-zero integer.

	Example: `?offset=20` to ignore the first 20 items and only return items after them.

* `order`: The columns to order a collection by

	Valid in: Collections (`GET`)

	Must be a comma separated list of `field.direction`.

	Example: `?order=name.asc,id.desc,age.asc`.

* `fields`: The fields to return, defaults are defined per resource or collection

	Valid in: Collections, resources (`GET`)

	Example: `?fields=id,name,age` to return only the fields `id`, `name` and `age`.

* `filter`: A filter to apply to a collection

	Valid in: Collections (`GET`, `DELETE`, `PATCH`, operations)

	Must be a base64 representation of a JSON object containing the filters according to the following spec (loosely inspired by MongoDB's db.collection.find https://docs.mongodb.com/manual/reference/method/db.collection.find/):

	The root object must contain fields as keys with their required value as the value, e.g. `{ name: "John Smith", nationality: "US" }` to find all users from the US with the name “John Smith”.

	Alternatively, the value can be an object with an operator (all prefixed by a dollar sign) as the key, e.g. `{ age: { $lt: 35 } }` to find all users younger than 35.

	The full list of comparison operators is:
	* `$eq`: Exact equality. Value may be a `string`, `number`, `boolean` or `null`.
	* `$neq`: Like `$eq` but demands a value not equal to the one provided.
	* `$like`: Filters for values similar to the provided `string`. Performs a SQL query using the provided values wrapped in `%`.
	* `$gt`: Greater than. Value must be a `number`.
	* `$gte`: Greater than or equal to. Value must be a `number`.
	* `$lt`: Lower than. Value must be a `number`.
	* `$lte`: Lower than or equal to. Value must be a `number`.
	* `$in`: Must be equal to one of the provided values. Value must be an array of optionally mixed types allowing any of `string`, `number`, `boolean` or `null`.
	* `$nin`: Like `$in` but demands a value not in the provided array.

	It's also possible to use logical operators, e.g. `{ $or: [ { name: "Zamenhof" }, { age: { $lt: 35 } } ] }` to find all users who are named “Zamenhof” or are under 35.

	The full list of logical operators is:
	* `$and`: Joins expressions with a logical AND. Value must be an array of expressions. This is also possible implicitly by simply listing several expressions in one object.
	* `$or`: Joins expressions with a logical OR. Value must be an array of expressions.
	* `$not`: Negates an expression. Value must be an expression.
	* `$xor`: Joins expressions with a logical XOR. Value must be an array of expressions.

## Operations
SAKo treats paths as *resource identifiers* and HTTP methods as *verbs*. The only exception to this is the addition of operations prefixed by an at-symbol (@). All operations are requested using the `POST` verb. Some operations may be called only on resources, others on entire collections. Let's look at a fictional example:
* All `User` resources in the collection `GET /users` have an operation `ban`.
	* To ban the user with the id `12` we'd call `POST /users/12/@ban`.
* The `User` collection at `GET /users` has an operation `ban`.
	* To ban all users we'd call `POST /users/@ban`
	* To ban all users with green hair we'd call `POST /users/@ban?:hair=green`

## Collection metadata
All `GET` requests on collections include metadata in the headers:
* `X-Total-Items`: Contains the amount of total items in the collection without a limit
* `X-Total-Items-No-Filter`: Contains the total amount of items in the collection with no filters applied

All `DELETE` and `PATCH` requests on collections include metadata in the headers:
* `X-Affected-Items`: Contains the amount of items affected
