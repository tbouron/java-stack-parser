# java-stack-parser
Parse Java stack traces and transform them into comprehensive JS objects

You can checkout [this working demo](http://codepen.io/tbouron/pen/wzOkwr/) to see how it looks like.

| Branch | Build | Grade | Test coverage |
| --- | --- | --- | --- |
| `master` *(Stable)* | [![Travis](https://img.shields.io/travis/tbouron/java-stack-parser/master.svg)](https://travis-ci.org/tbouron/java-stack-parser/branches) | [![Codacy](https://img.shields.io/codacy/grade/ec26bba6230f483e958972fb376f075e/master.svg)](https://www.codacy.com/app/tbouron/java-stack-parser/dashboard?bid=3852863) | [![Codecov](https://img.shields.io/codecov/c/github/tbouron/java-stack-parser/master.svg)](https://codecov.io/gh/tbouron/java-stack-parser/branch/master) |
| `develop` | [![Travis](https://img.shields.io/travis/tbouron/java-stack-parser/develop.svg)](https://travis-ci.org/tbouron/java-stack-parser/branches) | [![Codacy](https://img.shields.io/codacy/grade/ec26bba6230f483e958972fb376f075e/develop.svg)](https://www.codacy.com/app/tbouron/java-stack-parser/dashboard?bid=3852862) | [![Codecov](https://img.shields.io/codecov/c/github/tbouron/java-stack-parser/develop.svg)](https://codecov.io/gh/tbouron/java-stack-parser/branch/develop) |

## Install

You can install this package either with `npm`, `yarn` or `bower`.

### npm / yarn

For npm:
```sh
~$ npm install java-stack-parser
```

For yarn:
```sh
~$ yarn add java-stack-parser
```

Then, you can `require('java-stack-parser')`, `import from 'java-stack-parser'` or include the library in your web page directly via a `<script>` tag
```html
<script src="/node_modules/java-stack-parser/lib/java-stack-parser.min.js"></script>
```

### bower

```sh
~$ bower install java-stack-parser
```

Then, you can include the library in your web page directly via a `<script>` tag
```html
<script src="/bower_components/java-stack-parser/lib/java-stack-parser.min.js"></script>
```

## Documentation

The library defines 3 objects:
- `Stack`: represents the full stacktrace. It is compose of a list of `StackGroup`s.
- `StackGroup` represents a group of consecutive `StackLine`s with the same `StackPackage`.
- `StackLine` represents a line of the full stacktrace, e.g. `at java.net.SocketInputStream.read(SocketInputStream.java:185)`.
- `StackPackage` represents the package of the current `StackLine`. Taking the `StackLine` above, the resulting `StackPackage` will be `java.net`.

### `Stack` Object

This object is used to parse and transform a string representing a Java stack trace. Here is an example of how to use it:
```js
import {Stack} from 'java-stack-parser';

let stacktrace = '...';
let stack = new Stack();

stack.parse(stacktrace);

// Display stack trace information into the console
stack.groups.forEach((group)=> {
    if (group.exception) {
        console.log('[' + group.exception.exception + '] ' + group.exception.message);
    }
    console.log('Package: ' + group.stackPackage.name + ' contains ' + group.lines.length + ' lines');
    group.lines.forEach((line)=> {
        console.log(line.javaClass + '.' + line.method + ' (Source: ' + line.source + ' at line: ' + line.line + ')');
    });
});
```

The `Stack` object gives you the ability of defining your own "vendor" packages, resulting of a better grouping. For example, if your application uses 2 libraries with a groupId of `com.acme` and `my.library`, you can pass this as an optional parameter to the constructor:
```js
let stack = new Stack({
    'My libraries': ['com.acme', 'my.library'],
    "Java/Sun/Oracle": ["java", "javax", "sun", "sunw", "com.sun", "com.oracle"],
    "Apache": ["org.apache"],
});
```
Now, if the stack trace contains consecutive lin with the package `com.acme` or `my.library`, they will be group under the same `StackGroup`.


## Development

To build the library in development mode (non-uglified, with a watch on the source) simply do:
```sh
~$ npm run dev
```

For the production version:
```sh
~$ npm run build
```

You can run tests and check the coverage with the following 2 commands:
```sh
# Run tests
~$ npm test
# Check coverage
~$ npm run coverage
```

## License

This library is released under [Apache 2.0 license](LICENSE)
