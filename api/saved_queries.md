# Saved Queries Format
Saved queries are currently mainly used in the AKSO admin dashboard, and initially were a 1:1 mapping from saved query data to filter in the REST API, but this has been proven to be cumbersome:

- Users may wish to add comments to their JSON filter, as the format isn’t the most human-friendly
- Users may wish to parameterize the JSON filter with dynamically computed values, such as the current year
- Users may wish to have fields in the results be automatically selected

The saved queries is an object at its root, with the following fields:

- `source`: containing the human-editable source; optional
- `filter`: containing the compiled object that would’ve been in the `query` field previously
- `fields`: containing a list of associated fields; optional

### The `source` Field
The source field may contain any arbitrary representation of the human-editable source code, and hence, interpretation of the source field is up to the API client. In the interest of detecting incompatibility early, however, it should be an object with a `repr` field at the top-level, where `repr` contains a unique identifier for the source representation, such as `org.akso.admin` (see admin dashboard).

Changing the contents of this field should be reflected in the `filter` field appropriately.

### The `filter` Field
This is simply an object that would be passed verbatim to the `filter` parameter in an associated API call. This field should be treated as derived data from the `source` (if present).

### The `fields` Field
If given, the fields field must be an array containing strings identifying fields of the objects returned by the API calls this query is associated with. Nested fields may be identified using dot-accessor notation.



