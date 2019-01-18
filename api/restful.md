# RESTful API design principles
SAKo tries to conform to RESTful API design norms and principles, however, due to the complexity of some of the operations exposed through the API, it has been deemed needed to expand upon these.

## URL length
Especially when querying collections, the length of URLs may become noticeably big. If the length of a URL exceed 2000 characters, it may cease to function on all stacks. For this reason, SAKo permits the use of the HTTP `X-Http-Method-Override` header on `POST` requests if the value of the header is set to `GET`. In this case, SAKo expects the request body to contain the query string without the first question mark. Let's look at a fictional example putting this to use:

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
SAKo utilizes the query string to limit the scope of the data of a collection (`GET` only), of an operation performed on a collection (`POST` only) or the returned data of any other type of request. Let's start out by looking at a fictional example: `GET /users?limit=20` will return only 20 users.

All query parameters are optional and a request without any query parameters will always be valid.

The recognized parameters are as follows:
* `limit`: The maximum amount of items in the collection

	Valid in: Collections (`GET`, `DELETE`, operations)

	Must be a positive non-zero integer. The maximum value is defined by the collection.

	Example: `?limit=20` to return a maximum of 20 items.

* `offset`: The location at which to commence the lookup

	Valid in : Collections (`GET`, `DELETE`, operations)

	Must be a positive non-zero integer.

	Example: `?offset=20` to ignore the first 20 items and only return items after them.

* `search`: Limits the collection to items matching a certain search value

	Valid in: Collections (`GET`, `DELETE`, operations)

	* `search.val`: The value to search for

		Must be a string

	* `search.in`: The fields to search in

		Must be a comma-separated list of field names.

	Example: `?search.val=John Smith&search.in=name,nickname` to find items with a name or nickname similar to “John Smith”.

* `fields`: The fields to return, defaults are defined per resource or collection

	Valid in: Collections, resources (`GET`, operations)

	Must be a comma-separated list of field names.

* `:[field]`: Returns only items matching a set of requirements

	Valid in: Collections (`GET`, `DELETE`, operations)

	If this parameter is defined directly it is treated as `WHERE [field] = [value]` or `WHERE [field] in ([value])`.

	The value of the parameter is always treated as a string unless it's prefixed by `$type`, where `type` is any of:

	* `str`: To treat the value as a string
	* `num`: To treat the value as a number
	* `null`: To treat the value as a null value

	In order to search for a string beginning with a dollar symbol, the parameter should be rewritten as `:field=$str$`.

	Examples:
	* `?:hair=blue` to find all items with blue hair.
	* `?:hair=$null` to find all items without hair.

	If the value is prefixed by `$type[]` the behavior is similar to that of `$type` except the remaining value is expected to be a comma-separated value of permitted values.

	Examples:
	* `?:hair=$[]blue,green` to find all items with blue or green hair.
	* `?:number=$num[]1,2` to find all items with a column number with the value 1 or 2.

	Alteratively, it's possible to leave out this parameter and use only its subparameters:

	* `:[field].in`: The field must be a number with a value within the specified interval

	Must be an interval of the format `[min;max]`, `]min;max[`, `[min;max[` or `]min;max]`, where an inwards-facing bracket indicates an inclusive interval and an outwards-facing bracket indicates an exclusive interval. Either `min` or `max` may be left in order to define only a maximum or minimum value.

	Examples:

	`?:id.in=[0;[` to find all items with a positive id.

## Operations
SAKo treats paths as *resource identifiers* and HTTP methods as *verbs*. The only exception to this is the addition of operations prefixed by an at-symbol (@). All operations are requested using the `POST` verb. Some operations may be called only on resources, others on entire collections. Let's look at a fictional example:
* All `User` resources in the collection `GET /users` have an operation `ban`.
	* To ban the user with the id `12` we'd call `POST /users/12/@ban`.
* The `User` collection at `GET /users` has an operation `ban`.
	* To ban all users we'd call `POST /users/@ban`
	* To ban all users with green hair we'd call `POST /users/@ban?:hair=green`
