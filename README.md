# Sparc(k) for Arduino compiler

_Sparklang_ (aka Spark) is an open source programming language for Arduino
The language compiler consists of 3 parts:
1) Parser - generted by peg.js, which produces a parse tree for further analisys
2) Evaluator - checks the semantics of the parse tree, produces AST
3) Code Generator - produces C++ code based on the AST

## TODO:
- Make compiler binary

## How to hack the language
### Requirements
You will need node v0.12+ and npm (comes with node)

### Preparations
- clone repo
- cd to project directory `cd spark-lang`
- run `npm install` to install dependencies

### Building browser version
- from project root run `gulp build_browser` to build all compilers
- alternatively you can run `gulp parser`, `gulp evaluator` or `gulp generator` to build compiler modules separately

### Running tests
- run `npm test` from the project root directory
- alternatively you can run `jasmine` or `jasmine-node` with custom options from the test/ directory 

## Project directory structure
**build** - *browser version of the compiler*
**src** - *project sources*
|__ **parser** - *parser source*
|__ **evaluator** - *evaluator source*
|__ **generator** - *generator source*
**test** - *test suites*
|__ **resources** - *additional resources for tests*
|__ |__ **code** - *code samples*
|__ **spec** - *test specifications*


###Many thanks to:
- PEGjs project for an awesome parser generator and grammar examples [1]
- Philippe Sigaud for his pegged grammar tutorial and examples [2]
[1] http://pegjs.org/
[2] https://github.com/PhilippeSigaud/Pegged/wiki/Grammar-Examples

###License:
GPLv2.0 - http://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html

