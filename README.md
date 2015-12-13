# Sparc(k) for Arduino compiler

_Sparklang_ (aka Spark) is an open source programming language for Arduino
The language compiler consists of 3 parts:
1) Parser - generted by peg.js, which produces a parse tree for further analisys
2) Evaluator - checks the semantics of the parse tree, produces AST
3) Code Generator - produces C++ code based on the AST

### Requirements
You will need node v5+ and npm (comes with node) - https://nodejs.org/

### Installation
- clone repo `git clone https://github.com/YemSalat/spark-lang.git`
- cd to project directory `cd spark-lang`
- run `npm install` to install dependencies


## Using the Sparc compiler
From the project _bin_ directory run `sparc [input file] [commands]` 
_inpput file_ - optional, file to read sparc code from
If the input file is not specified - you can supply inline input string with _-i_ command
Commands:
__-i__ - process input, for example `sparc -i "a = 1; b = a + 3"`
__-o__ - output file, where the program will be saved, for example `sparc hello.sprk -o hello.cpp`


## TODO:
- Improve everything

## Quick Language Spec
Variable initialization - inferred types, (also - optional semicolons)
    foo = 10 // int
    bar = "Hello" // str


Parenthesis in if and for statements are optional, but the curly brackets are mandatory.

    if a < 5 { ... }


Alias keywords for common operators - and, or, xor

    if bar < 500 and foo > 100 { ... }


There are alias for equality operators - `is` and `is not` (convert to - '==' and '!='

    if reading is not 0 { ... }
    if ledPin is HIGH { ... }


Loops - there are only for loops in the language.
They can take just the testing condition:

    for i < 10 { ... }


Otherwise they work the same way as regular for loops:

    for i = 0; i < 10; i++ { ... }


You can use `break` and `continue` statement,
there is also an alias for `continue` - `skip`


Functions can have docstrings:

    /// This is the function description
    int readPin ( int number ) { ... }


There are aliases for the built in functions:

    println() - Serial.println()
    pinRead() - digitalRead()
    now()     - millis()


## How to hack the language

### Building the compiler
- from project root run `gulp build_browser` to build all compiler modules
- alternatively you can run `gulp parser`, `gulp evaluator` or `gulp generator` to build compiler modules separately
- after you built all the compiler components - you can build the binary compiler with `gulp build_sparc`

### Running tests
- run `npm test` from the project root directory
- alternatively you can run `jasmine` or `jasmine-node` with custom options from the test/ directory 


## Project directory structure
    [bin] - 'binary' version of the compiler
    [build] - browser version of the compiler
    [src] - project sources
    |__ [parser] - parser source
    |__ [evaluator] - evaluator source
    |__ [generator] - generator source
    [test] - test suites
    |__ [resources] - additional resources for tests
    |__ |__ [code] - code samples
    |__ [spec] - test specifications


###Many thanks to:
- PEGjs project for an awesome parser generator and grammar examples [1]
- Philippe Sigaud for his pegged grammar tutorial and examples [2]
[1] http://pegjs.org/
[2] https://github.com/PhilippeSigaud/Pegged/wiki/Grammar-Examples

###License:
GPLv2.0 - http://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html

