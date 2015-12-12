# Sparc(k) for Arduino compiler

## How to hack the language
### Requirements
You will need node v0.12+ and npm (comes with node)

### Preparations
- clone repo
- cd to project directory `cd spark-lang`
- run `npm install` to install dependencies

### Building browser version
- from project root run `gulp all` to build all compilers
- alternatively you can run `gulp parser`, `gulp evaluator` or `gulp generator` to build these modules separately

### Running tests
- cd to the test folder `cd test`
- run jasmine with `jasmine` command

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

