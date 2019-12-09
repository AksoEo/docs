# AKSO Script
AKSO Script is a very simple untyped functional sandboxed programming language meant for following applications:

- Calculations and mild interactivity in conference registration forms
- Calculations and mild interactivity in survey forms
- JSON filter template values

High-level design features:

- no runtime errors
- editable with a GUI
- small runtime
- no mutability

### Representation
Scripts are composed of “definitions” at the top level. Each definition can be thought of as a function taking zero or more arguments, though they will often act like variables.

Scripts are represented as a Javascript object containing all definitions.

```javascript
{
    _a: { type: 'number', value: 5 },
    _c: { type: 'call', f: '+', args: ['_a', '@input-key-name'] },
    _e: { type: 'matrix', data: [[1, 2, 3], [4, 5, 6]] },
    something: { type: 'call', f: 'index', args: ['_e', '@other-input-name', '_a'] },
}
```

Definition identifiers may be prefixed:

- `@` to indicate that this references the value of a form field. This may be `null`.
- `_` to indicate that this is a script-local variable and is not visible in other scripts of the form

The `=` identifier is special and indicates a function’s return value.

### Definitions
##### Type `number`, `string`, `matrix`, `bool`, `null`
Additional key `value`, contains the value this definition will evaluate to (except `null`, whch does not have this key).

- `number` is always real and never `NaN` or `Infinity`.
- `matrix` values are an n-dimensional array. All sub-arrays should have the same size in each dimension.

##### Type `input`
Additional key `key`, contains the name of a form field. Evaluates to the form field value.

##### Type `call`
Calls a function or copies a value. Additional keys:

- `f`: definition name
- `args`: list of definition names to be used as function arguments.

##### Type `fn`
Defines a function. Additional keys:

- `params`: list of parameter names
- `body`: a definitions object, with a `=` key. Has access to all definitions in scope above (unless they were shadowed by definitions in the body or params)

### Suggested Interpretation
```javascript
/// A definitions object, see above.
const definitions = { ... };
/// Standard library of functions.
const stdlib = { ... };
/// Interpreter.
/// Takes definitions, the name of the definition to evaluate, and a list of function arguments.
/// List of function arguments is for recursive calls.
const evaluate = (definitions, id, args = []) => {
    if (id.startsWith('@')) return ...; // form field value

    const item = definitions[id];
    if (item.type === 'call') {
        // Call a function (or copy a value)
        const functionName = item.f;
        // Evaluate function arguments.
        const args = item.args.map(k => evaluate(definitions, k));
        // Run function body.
        return evaluate(definitions, functionName, args);
    } else if (item.type === 'fn') {
        // Run a function.
        if (typeof item.body === 'function') {
            // allow standard library functions to be defined in javascript
            return ...;
        }
        // Create a local scope with definitions from the scope above...
        const localScope = { ...definitions };
        // ...the definitions from the function scope...
        Object.assign(localScope, item.body);
        // ...and function arguments
        Object.assign(localScope, Object.fromEntries(item.params.map((n, i) => [n, args[i]])));
        // (namespace clashes should be warned about in the ui)
        return evaluate(localScope, '=');
    } else {
        // static types like number and input should be obvious
        return ...;
    }
};

evaluate({ ...stdlib, ...definitions }, 'something');
```

### Standard Library of Functions
#### Math
All operations in this section will return null if an argument is not a number.

- `+`/`-`/`*`/`/`/`^` (on two arguments): basic arithmetic
    + division by 0 is 0
    + 0^0 is 0
- `mod a b`: modulo. Will flip the sign if b is negative. Will return 0 if b is 0.
- `floor a`: rounds to the closest integer in the -Infinity direction
- `ceil a`: rounds to the closest integer in the +Infinity direction
- `round a`: rounds to the closest integer
- `trunc a`: rounds to the closest integer towards 0
- `sign a`: returns the sign, either -1, 0, or 1
- `abs a`: returns the magnitude of the argument

#### Logic
- `==`/`!=`/`>`/`<`/`>=`/`<=` (on two arguments): comparison operators
    + using ordered comparison on non-numerical types always evaluates to false
    + comparing two different types always evaluates to false
- `and`/`or`/`not`/`xor` (on two arguments): boolean logic
    + if one argument is not a boolean, always evaluates to false

#### Strings and Lists
Some functions will also work with types that are not strings or arrays (such as `sum`, which will simply act like the identity in that case, or `map f a` which will simply return `length a` times `f` if `f` is not a function).

- `cat ...`: concatenates all arguments
    + if the arguments are not all arrays or not all strings, will cast everything to string
- `if a b c`: if a then b else c
    + if a is not a bool, will always pick c
- `map f a`: maps f over a
- `flat_map f a`: maps f over a and concatenates the results.
- `fold f a r`: left-folds a with f, and uses r as the initial value. If r is not given, will use first item.
- `filter f a`: filters a with f.
- `index a ...`: indexes possibly multidimensional a with the rest of the arguments
    + will return null if the index is out of bounds
    + will return null if the indexing is too deep
- `length a`: returns length of a
    + will return 0 if a is not a string or array
- `contains a b`: returns if a contains b
    + will return false if a is not a string or array

Convenience functions:

- `sum a`: returns the sum of a
- `min a`: returns the minimum value of a
- `max a`: returns the maximum value of a
- `average a`: returns the arithmetic mean of a
- `median a`: returns the median of a

#### Date and Time
- `date_sub t a b`: returns the signed difference between a and b interpreted as RFC3339 date strings, or null. a determines the type of difference; may be one of 'days', 'weeks', 'months', 'years'
- `date_add t a b`: interprets a as an RFC3339 date string, or returns null. Adds b of t, and returns the resulting date string. t may be one of 'days', 'weeks', 'months', 'years'
- `date_today`: returns the current date
- `date_fmt a`: returns the formatted version of a interpreted as a RFC3339 date string, or null
- `time_now`: current epoch timestamp
- `datetime_fmt a`: formats epoch timestamp a

#### Miscellaneous
- `format_currency a b`: returns b (in cents, if applicable) formatted in currency a, where a is a string like 'USD'
- `id a`: returns a

### Panics
Script evaluation may panic in which case an error dialog should be shown to the user. These errors can be identified via simple static analysis.

- referencing an unknown declaration
- calling a function with too few arguments
