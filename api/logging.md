# Logging
## API calls
All calls made to the AKSO API are logged and stored for a customizable amount of time. The following information is stored:

| Datum        | Description                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| `time`       | The time at which the request was received.                                                                   |
| `user`       | The code of the user who sent the request, if user access is used. Otherwise `null`.                          |
| `app`        | The application key of the application that sent the request, if application access is used. Otherwise `null`. |
| `ip`         | The IP address of the client who sent the request.                                                            |
| `origin`     | The origin header if set by the client sending the request.                                                   |
| `user_agent` | The user agent header of the client if set.                                                                   |
| `method`     | The HTTP method (verb) of the request.                                                                        |
| `path`       | The path (resource identifier) of the request without the query string.                                       |
| `query`      | The query string of the request if present. Otherwise `null`.                                                 |
| `res_status` | The HTTP status of the response.                                                                              |

## User data
All changes made to user data are logged. Previous values of all user data are stored for a customizable amount of time. The following information is stored:

| Datum       | Description                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| `?_modtime` | The time at which the datum was modified.                                                             |
| `?_moduser` | The code of the user who modified the datum, if user access is used. Otherwise `null`.                |
| `?_modapp`  | The code of the application that modified the datum, if application access is used. Otherwise `null`. |
| `?_modcmt`  | An optional comment on why the datum was modified.¹ `null` if not specified.                          |

---
¹ When user access is used it's automatically set to “Memfarita ŝanĝo.” When application access is used this may optionally be set to any value provided by the application to justify the change.
