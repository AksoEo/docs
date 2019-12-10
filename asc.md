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

## Representation
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

Identifiers may be prefixed:

- `@` to indicate that this references the value of a form field. This may be `null`. Hence definitions may not start with this letter.
- `_` to indicate that this is a script-local variable and is not visible in other scripts of the form

The `=` identifier is special and indicates a function’s return value.

## Definitions
### Type `number`, `string`, `matrix`, `bool`, `null`
Additional key `value`, contains the value this definition will evaluate to (except `null`, whch does not have this key).

- `number` is always real and never `NaN` or `Infinity`.
- `matrix` values are an n-dimensional array. All sub-arrays should have the same size in each dimension. Empty values should be contain null.

#### Semantics
These definitions associate the definition name with the value, i.e. define a constant. These can be thought of as zero-argument functions.

### Type `call`
Calls a definition. Additional keys:

- `f`: definition name
- `args`: optional list of definition names to be used as function arguments

#### Semantics
These can be thought of as function calls. Calling a definition that is not explicitly a function simply copies its value. Calling a function applies each argument to the result in sequence. Excess arguments (i.e. arguments given to non-function values) will be ignored. See `fn` for more details.

### Type `fn`
Defines a function. Additional keys:

- `params`: list of parameter names
- `body`: a nested definitions object, with a `=` key.

#### Semantics
Functions capture the scope in which they were defined. Definitions may be shadowed by the body or parameters. The priority when resolving names is as follows:

1. Parameters
2. Body
3. Parent scopes wrt. definition (starting with the closest)

Functions are curried, meaning a function `f a b = a + b` (with params a and b) resolves to the equivalent of the Javascript expression `a => b => a + b`.

Functions with no parameters act the same way as constant definitions.

## Suggested Interpretation
(Pseudocode)

```javascript
const stdlib = { ... };

// To evaluate a definition named `id`
function evaluate (definitions, id) {
    const item = definitions[id];
    if (!item) panicSomehow(); // unknown item

    if (item.type === 'call') {
        // call a declaration

        let value;
        if (item.f.startsWith('@')) {
            // this is a form variable
            value = getFormValueSomehow(item.f);
        } else {
            // resolve it from definitions otherwise
            value = evaluate(definitions, item.f);
        }

        // apply arguments
        for (let i = 0; i < item.args.length; i++) {
            if (typeof value === 'function') {
                const argumentName = item.args[i];
                const argument = evaluate(definitions, argumentName);
                value = value(argument);
            } else {
                // too many arguments
                warnAboutThisMaybe();
                break;
            }
        }

        return value;
    } else if (item.type === 'fn') {
        // define a function

        // define an inner function that contains the body
        let f = (params) => {
            const functionScope = {
                ...definitions, // definitions from the parent scope
                ...item.body, // function body
                ...params, // and the parameters
            };
            return evaluate(functionScope, '=');
        };

        if (item.params.length === 0) {
            // a function with no parameters is the same as a constant
            return f({});
        }

        // curried function construction.
        // we use (params, index) as state and a as the next parameter.
        // params is a definitions object containing only the parameters.
        // index is the index in the item.params array.
        const c = (params, index) => a => {
            const paramName = item.params[index];
            const newParams = { ...params, [paramName]: a };

            // we’ve got enough arguments to call f here
            if (index + 1 === item.params.length) return f(newParams);

            // otherwise just return a “partially applied function”
            // and wait to collect more arguments
            return c(newParams, index + 1);
        };

        // return c with initial state
        return c({}, 0);
    } else if (item.type == 'number' || item.type == ...etc...) {
        // constant types should be obvious
        return item.value;
    } else {
        // unknown definition type
        panicSomehow();
    }
}

const script = { ...definitions go here... };

const topScope = { ...stdlib, ...script };
evaluate(topScope, 'something');
```

## Standard Library of Functions
These functions are available in the global scope. All functions will return null if an input is null.

### Math
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

### Logic
- `==`/`!=`/`>`/`<`/`>=`/`<=` (on two arguments): comparison operators
    + using ordered comparison on non-numerical types always evaluates to false
    + comparing two different types always evaluates to false
- `and`/`or`/`not`/`xor` (on two arguments): boolean logic
    + if one argument is not a boolean, always evaluates to false

### Strings and Lists
Some functions will also work with types that are not strings or arrays (such as `sum`, which will simply act like the identity in that case, or `map f a` which will simply return `length a` times `f` if `f` is not a function).

- `cat a b`: concatenates a and b
    + if the arguments are not both arrays or not both strings, will cast everything to strings
- `if a b c`: if a then b else c
    + if a is not a bool, will always pick c
- `map f a`: maps f over a
- `flat_map f a`: maps f over a and concatenates the results.
- `fold f r a`: left-folds a with f, and uses r as the initial value
- `fold1 f a`: like fold, but uses first item as initial value
- `filter f a`: filters a with f.
- `index a b`: returns the item at index b inside a
    + will return null if the index is out of bounds
- `length a`: returns length of a
    + will return null if a is not a string or array
- `contains a b`: returns if a contains b
    + will return false if a is not a string or array

Convenience functions:

- `sum a`: returns the sum of a
- `min a`: returns the minimum value of a
- `max a`: returns the maximum value of a
- `avg a`: returns the arithmetic mean of a
- `med a`: returns the median of a

### Date and Time
- `date_sub t a b`: returns the signed difference between a and b interpreted as RFC3339 date strings, or null. a determines the type of difference; may be one of 'days', 'weeks', 'months', 'years'
- `date_add t a b`: interprets a as an RFC3339 date string, or returns null. Adds b of t, and returns the resulting date string. t may be one of 'days', 'weeks', 'months', 'years'
- `date_today`: returns the current date
- `date_fmt a`: returns the formatted version of a interpreted as a RFC3339 date string, or null
- `time_now`: current epoch timestamp in seconds
- `datetime_fmt a`: formats epoch timestamp a

### Miscellaneous
- `format_currency a b`: returns b (interpreted as smallest currency unit, e.g. cents) formatted in currency a, where a is a string like 'USD'
- `id a`: returns a

## Panics
Script evaluation may panic in which case an error dialog should be shown to the user. These errors can be identified via simple static analysis.

Causes:

- referencing an unknown declaration
- naming a definition with a leading `@`
- unknown types of definitions
