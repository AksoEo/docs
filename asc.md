# AKSO Script
AKSO Script is a very simple untyped functional sandboxed programming language meant for following applications:

- Calculations and mild interactivity in conference registration forms
- Calculations and mild interactivity in survey forms
- JSON filter template values

High-level design features:

- all runtime errors are statically identifiable
- editable with a GUI
- small runtime
- no mutability, almost completely deterministic
    + sources of nondeterminism are time-related functions in the standard library and form variables

## Representation
Scripts are composed of “definitions” at the top level. Each definition can be thought of as a function taking zero or more arguments, though they will often act like variables.

Scripts are represented as a Javascript object containing all definitions.

```javascript
{
    _a: { t: 'n', v: 5 },
    _c: { t: 'c', f: '+', a: ['_a', '@input-key-name'] },
    _e: { t: 'm', v: [[1, 2, 3], [4, 5, 6]] },
    something: { t: 'c', f: 'index', a: ['_e', '@other-input-name', '_a'] },
}
```

Identifiers may be prefixed:

- `@` to indicate that this references the value of a form field. This may be `null`. Hence definitions may not start with this letter.
- `_` to indicate that this is a variable that was not explicitly created by the user and may be manipulated arbitrarily by the editor. These will usually have non-human-readable names. Additionally, these *cannot* be referenced from child scopes (e.g. function bodies).

The `=` identifier is special and indicates a function’s return value.

## Definitions
### Type `n` (number), `s` (string), `m` (matrix), `b` (bool), `u` (null)
Additional key `v`, contains the value this definition will evaluate to (except `u`, which does not have this key).

- `n` is always real and never `NaN` or `Infinity`.
- `m` values are n-dimensional arrays.

#### Semantics
These definitions associate the definition name with the value, i.e. define a constant. These can be thought of as zero-argument functions.

### Type `l`
Constructs a list. Additional keys:

- `v`: list of definition names to be used as list contents

#### Semantics
This creates a possibly heterogenous list consisting of the contents of the referenced definitions.

### Type `c`
Calls a definition. Additional keys:

- `f`: definition name
- `a`: optional list of definition names to be used as function arguments

#### Semantics
These can be thought of as function calls. Calling a definition that is not explicitly a function simply copies its value. Calling a function applies each argument to the result in sequence.

Calling a function or referencing a definition with the incorrect number of arguments is an error (if the target definition is not a function, the number of arguments should always be zero).

### Type `f`
Defines a function. Additional keys:

- `p`: list of parameter names
- `b`: function body. a nested definitions object, with a `=` key.

#### Semantics
Functions capture the scope in which they were defined. Definitions may be shadowed by the body or parameters. The priority when resolving names is as follows:

1. Parameters
2. Function body
3. Parent scopes wrt. definition (starting with the closest)

### Type `w`
Matches a list of conditions. Additional keys:

- `m`: an array of objects with following keys:
    + `c`: optional definition name (condition)
    + `v`: definition name (value)

#### Semantics
Each condition/value pair in `m` is traversed sequentially, and the value of the first condition that is strictly equal to the boolean value `true` will be returned. If the condition is not given, it will always match. If no condition matches, the result is `null`.

## Suggested Interpretation
See [AKSO Script reference implementation](https://github.com/AksoEo/akso-script-js).

## Standard Library of Functions
These functions are available in the global scope. All functions (except comparison and logic operators) will return null if an input is null.

### Math
All operations in this section will return null if an argument is not a number.

- `+`/`-`/`*`/`/`/`^` (on two arguments): basic arithmetic
    + division by 0 is 0
    + 0^0 is 1
- `mod a b`: modulo. Will flip the monoid if b is negative. Will return 0 if b is 0.
- `floor a`: rounds to the closest integer in the -Infinity direction
- `ceil a`: rounds to the closest integer in the +Infinity direction
- `round a`: rounds to the closest integer
- `trunc a`: rounds to the closest integer towards 0
- `sign a`: returns the sign, either -1, 0, or 1
- `abs a`: returns the magnitude of the argument

### Comparison and Logic
- `==`/`!=`/`>`/`<`/`>=`/`<=` (on two arguments): comparison operators
    + using ordered comparison on types that are not a number or string always evaluates to false
    + using ordered comparison on two different types always evaluates to false
    + comparing two different types always evaluates to false
- `and`/`or`/`not`/`xor` (on two arguments): boolean logic
    + if one argument is not a boolean, always evaluates to false

### Strings and Lists
Some functions will also work with types that are not strings or arrays (such as `map f a` which will simply return `length a` times `f` if `f` is not a function).

- `++ a b`: concatenates a and b
    + if the arguments are not both arrays or not both strings, then strings are treated as an array of code points, and other data types are wrapped in a single-element array.
- `map f a`: maps f over a
- `flat_map f a`: maps f over a and concatenates the results
- `fold f r a`: left-folds a with f, and uses r as the initial value
- `fold1 f a`: like fold, but uses first item as initial value
    + will return null if a is empty or not a string or array
- `filter f a`: filters a with f
    + will return null if a is not a string or array
- `index a b`: returns the item at index b inside a
    + will return null if the index is out of bounds
    + will return null if b is not an integer
- `length a`: returns length of a
    + will return null if a is not a string or array
- `contains a b`: returns if a contains b
    + will return false if a is not a string or array
    + will return false if a is a string and b is not
- `head a b`: splits a at index b and returns the first part
- `tail a b`: splits a at index b and returns the second part

Convenience functions:

- `sum a`: returns the sum of a
- `min a`: returns the minimum value of a
- `max a`: returns the maximum value of a
- `avg a`: returns the arithmetic mean of a
- `med a`: returns the median of a
- `sort a`: returns a sorted version of a, or null

### Date and Time
- `date_sub t a b`: returns the signed difference between a and b interpreted as RFC3339 date strings, or null. a determines the type of difference; may be one of 'days', 'weeks', 'months', 'years'
- `date_add t a b`: interprets a as an RFC3339 date string, or returns null. Adds b of t, and returns the resulting date string. t may be one of 'days', 'weeks', 'months', 'years'
- `date_today`: returns the current date
- `date_fmt a`: returns the formatted version of a interpreted as a RFC3339 date string, or null
- `time_now`: current epoch timestamp in seconds
- `datetime_fmt a`: formats epoch timestamp a

### Miscellaneous
- `currency_fmt a b`: returns b (interpreted as smallest currency unit, e.g. cents) formatted in currency a, where a is a string like 'USD'
- `country_fmt a`: if a is an ISO 639-1 country code (case insensitive), returns the country name. Otherwise null
- `phone_fmt a`: if a is a phone number string, then returns a formatted version. Otherwise null
- `id a`: returns a

## Panics
Script evaluation may panic in which case an error dialog should be shown to the user. These errors can be identified via simple static analysis.

Causes:

- referencing an unknown declaration
- naming a definition with a leading `@`
- unknown types of definitions
- calling with an incorrect number of arguments
