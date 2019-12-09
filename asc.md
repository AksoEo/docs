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
- `+`/`-`/`*`/`/`/`^`/`mod`/`floor`/`ceil`/`round`/`trunc`/`sign`/`abs`: basic arithmetic and math
    + `mod` refers to actual mod and not `%`
    + division by 0 is 0
    + 0^0 is 0
- `==`/`!=`/`>`/`<`/`>=`/`<=`: comparison
    + using ordered comparison on non-numerical types always evaluates to false
- `and`/`or`/`not`/`xor`: boolean logic
    + using these on non-bool types always evaluates to false
- `cat`: concatenates all arguments
    + if the arguments are not all arrays or not all strings, will cast everything to string
- `if`: if argument 1, then argument 2, else argument 3
    + if argument 1 is not a bool, will always pick argument 3
- `map`: maps argument 2 with function in argument 1
- `flat_map`: maps argument 2 with function in argument 1 and returns a flattened array
- `fold`: right-folds argument 2 with function in argument 1, and uses argument 3 as the initial value. If argument 3 is not given, will use first item.
- `filter`: filters argument 2 with function in argument 1
- `index`: indexes possibly multidimensional argument 1 with the rest of the arguments
- `length`: returns length of argument 1
    + will return 0 if argument 1 is not a string or array
- `contains`: returns if argument 1 contains argument 2
    + will return false if argument 1 is not a string or array
- `sum`: returns the sum of argument 1
- `min`: returns the minimum value of argument 1
- `max`: returns the maximum value of argument 1
- `average`: returns the arithmetic mean of argument 1
- `median`: returns the median of argument 1
- `format_currency`: formats a number as currency and returns a string

### Panics
Script evaluation may panic in which case an error dialog should be shown to the user. These errors can be identified via simple static analysis.

- referencing an unknown declaration
- calling a function with too few arguments
