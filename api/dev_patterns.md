# Internal development patterns
The AKSO API is designed using MVC and ORM principles. This means the protocol, using AKSO's specific stack, looks as following:

1. The request is handled by express.js
2. (optional) The client is authenticated by passport.js
3. The request is handed to its controller
4. The request is verified according to the OpenAPI spec using a JSON schema validator
5. (optional) The client's authorization is verified
6. The request is turned into a js data model using AKSO's own ORM using knex.js
7. The query is performed
8. The database response is turned into a js data model using AKSO's own ORM using knex.js
9. The database response is turned into JSON
10. The response is returned

The AKSO REST API documentation is written using OpenAPI. This is converted into a collection of JSON schemas.
