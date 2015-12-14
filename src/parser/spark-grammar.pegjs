/*
 * Sparklang Grammar
 * ==================
 * 
 * Grammar file for Peg.js parser generator (http://pegjs.org)
 *
 * Sparklang (aka Spark) is an open source programming language for Arduino
 *
 * The language compiler consists of 3 parts:
 * 1) Parser - generted by peg.js, it produces a parse tree for further analisys
 * 2) Evaluator - checks the semantics of the parse tree, produces AST
 * 3) Code Generator - produces C++ code based on the AST
 * 
 * Sparklang also has a small runtime to support some of the language functionality
 *
 * Many thanks to:
 * - PEGjs project for an awesome parser generator and grammar examples [1]
 * - Philippe Sigaud for his pegged grammar tutorial and examples [2]
 *
 *
 * [1] http://pegjs.org/
 * [2] https://github.com/PhilippeSigaud/Pegged/wiki/Grammar-Examples
 *
 * Original language design and concept by Konstantin Levin aka YemSalat
 */

{

  var DATA = {
    errors: {
      missing_parenthesis: "Parentheses do not match in FOR statement"
    }
  };

  var getLocation = location;
  // var getLocation = function () { return null; };

  function compiler_error (errorKey, replaceArr) {
    if (DATA.errors[errorKey]) {
      var err = DATA.errors[errorKey];
      for (var i=0,l=replaceArr.length; i<l; i++) {
        err = err.replace('{'+i+'}', replaceArr[i].toString());
      }
      error(DATA.errors[errorKey]);
    }
    else {
      error("Unknown error");
    }
  }

  var TYPES_TO_PROPERTY_NAMES = {
    CallExpression:   "callee",
    MemberExpression: "object",
  };

  function filledArray(count, value) {
    var result = new Array(count), i;

    for (i = 0; i < count; i++) {
      result[i] = value;
    }

    return result;
  }

  function extractOptional(optional, index) {
    return optional ? optional[index] : null;
  }

  function extractList(list, index) {
    var result = new Array(list.length), i;

    for (i = 0; i < list.length; i++) {
      result[i] = list[i][index];
    }

    return result;
  }

  function buildList(head, tail, index) {
    return [head].concat(extractList(tail, index));
  }

  function buildTree(head, tail, builder) {
    var result = head, i;

    for (i = 0; i < tail.length; i++) {
      result = builder(result, tail[i]);
    }

    return result;
  }

  function buildTimeLiteral (h, m, s, ms) {
    var _h = (h) ? ( parseInt(h, 10) || 0 ) : 0;
    var _m = (m) ? ( parseInt(m, 10) || 0 ) : 0;
    var _s = (s) ? ( parseInt(s, 10) || 0 ) : 0;
    var _ms = (ms) ? ( parseInt(ms, 10) || 0 ) : 0;
    
    var result = ( _h * 3600 + _m * 60 + _s ) * 1000 + _ms;

    return result;
  }

  function buildDocComment (head, tail) {
    var doc = head + tail.join('');
    return doc.trim();
  }

  function buildBinaryExpression(head, tail) {
    return buildTree(head, tail, function(result, element) {
      return {
        location: getLocation(),
        $$:       "BINARY_EXPRESSION",
        operator: element[1],
        left:     result,
        right:    element[3]
      };
    });
  }

  function buildLogicalExpression(head, tail) {
    return buildTree(head, tail, function(result, element) {
      return {
        location: getLocation(),
        $$:       "LOGICAL_EXPRESSION",
        operator: element[1],
        left:     result,
        right:    element[3],
        type:     "bool"
      };
    });
  }

  function optionalList(value) {
    return value !== null ? value : [];
  }
}

Start
  = __ program:Program __ { return program; }

/* ----- A.1 Lexical Grammar ----- */

SourceCharacter
  = .

WhiteSpace "whitespace"
  = "\t"
  / "\v"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"
  / Zs

NobreakWhitespace "non-break whitespae"
  = "\t"
  / " "

LineTerminator
  = [\n\r\u2028\u2029]

LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"

DocComment "docstring comment"
  = head:DocLineComment tail:(__ DocLineComment)* {
    return { $$: 'DOCSTRING', body: buildList(head, tail, 1) };
  }

Comment "comment"
  = MultiLineComment
  / SingleLineComment

MultiLineComment
  = "/*" (!"*/" SourceCharacter)* "*/"

MultiLineCommentNoLineTerminator
  = "/*" (!("*/" / LineTerminator) SourceCharacter)* "*/"

SingleLineComment
  = "//" !"/" (!(LineTerminator) SourceCharacter)*

DocLineComment
  = "///" text:(!(LineTerminator) s:SourceCharacter { return s })* { return text.join(''); }

Identifier
  = !ReservedWord name:IdentifierName { return name; }

IdentifierName "identifier"
  = head:IdentifierStart tail:IdentifierPart* {
      return {
        location: getLocation(),
        $$: "IDENTIFIER",
        name: head + tail.join("")
      };
    }

IdentifierStart
  = UnicodeLetter
  / "$"
  / "_"

IdentifierPart
  = IdentifierStart
  / UnicodeDigit
  / "\u200C"
  / "\u200D"

UnicodeLetter
  = Lu
  / Ll


UnicodeDigit
  = Nd


ReservedWord
  = Keyword
  / NullLiteral
  / BooleanLiteral

Keyword
  = BreakToken
  / CaseToken
  / ConstToken
  / ContinueToken
  / DefaultToken
  / ElseToken
  / FalseToken
  / ForToken
  / IfToken
  / InToken
  / NewToken
  / NullToken
  / ReturnToken
  / SwitchToken
  / ThisToken
  / TrueToken
  / VarByteToken
  / VarUByteToken
  / VarIntToken
  / VarUIntToken
  / VarLongToken
  / VarULongToken
  / VarFloatToken
  / VarStrToken
  / VoidToken
  / IsToken
  / NotToken

  / AndToken
  / OrToken

  / WhenToken
  / WaitToken


Literal
  = NullLiteral
  / BooleanLiteral
  / TimeLiteral
  / NumericLiteral
  / StringLiteral

NullLiteral
  = NullToken { return { location: getLocation(), $$: "LITERAL", value: null }; }

BooleanLiteral
  = TrueToken  { return { location: getLocation(), $$: "LITERAL", value: true, type: "bool"  }; }
  / FalseToken { return { location: getLocation(), $$: "LITERAL", value: false, type: "bool" }; }

/*
 * The "!(IdentifierStart / DecimalDigit)" predicate is not part of the official
 * grammar, it comes from text in section 7.8.3.
 */

TimeLiteral
  = ms:MillisecondPartLiteral !IdentifierStart {
    return { location: getLocation(), $$: "LITERAL", value: buildTimeLiteral([], [], [], ms), type: "int" };
  }
  / s:SecondPartLiteral _nbws_ ms:MillisecondPartLiteral* !IdentifierStart {
    return { location: getLocation(), $$: "LITERAL", value: buildTimeLiteral([], [], s, ms), type: "int" };
  }
  / m:MinutePartLiteral _nbws_ s:SecondPartLiteral* _nbws_ ms:MillisecondPartLiteral* !IdentifierStart {
    return { location: getLocation(), $$: "LITERAL", value: buildTimeLiteral([], m, s, ms), type: "int" };
  }


NumericLiteral "number"
  = literal:HexIntegerLiteral !(IdentifierStart / DecimalDigit) {
      return literal;
    }
  / literal:DecimalLiteral !(IdentifierStart / DecimalDigit) {
      return literal; 
    }


DecimalLiteral
  = DecimalIntegerLiteral "." DecimalDigit* ExponentPart? {
      return { location: getLocation(), $$: "LITERAL", value: parseFloat(text()), type: "float" };
    }
  / "." DecimalDigit+ ExponentPart? {
      return { location: getLocation(), $$: "LITERAL", value: parseFloat(text()), type: "float" };
    }
  / DecimalIntegerLiteral ExponentPart? {
      return { location: getLocation(), $$: "LITERAL", value: parseInt(text(), 10), type: "int" };
    }


MinutePartLiteral
  = head:TimeIntegerLiteral tail:"m" { return head+tail; }

SecondPartLiteral
 = head:TimeIntegerLiteral tail:"s" { return head+tail; }

MillisecondPartLiteral
  = head:TimeIntegerLiteral tail:"ms" { return head+tail; }

TimeIntegerLiteral
  = head:NonZeroDigit tail:DecimalDigit* { return head + tail.join(''); }

DecimalIntegerLiteral
  = "0"
  / NonZeroDigit DecimalDigit*

DecimalDigit
  = [0-9]

NonZeroDigit
  = [1-9]

ExponentPart
  = ExponentIndicator SignedInteger

ExponentIndicator
  = "e"i

SignedInteger
  = [+-]? DecimalDigit+

HexIntegerLiteral
  = "0x"i digits:$HexDigit+ {
      return { location: getLocation(), $$: "LITERAL", value: parseInt(digits, 16), type: "int" };
     }

HexDigit
  = [0-9a-f]i

StringLiteral "string"
  = '"' chars:DoubleStringCharacter* '"' {
      return { location: getLocation(), $$: "LITERAL", value: chars.join(""), type: "str" };
    }
  / "'" chars:SingleStringCharacter* "'" {
      return { location: getLocation(), $$: "LITERAL", value: chars.join(""), type: "str" };
    }

StringTemplateMember
  = "{" _nbws_ identifier:Identifier _nbws_ "}"

DoubleStringCharacter
  = !('"' / "\\" / LineTerminator) SourceCharacter { return text(); }
  / "\\" sequence:EscapeSequence { return sequence; }
  / LineContinuation

SingleStringCharacter
  = !("'" / "\\" / LineTerminator) SourceCharacter { return text(); }
  / "\\" sequence:EscapeSequence { return sequence; }
  / LineContinuation

LineContinuation
  = "\\" LineTerminatorSequence { return ""; }

EscapeSequence
  = CharacterEscapeSequence
  / "0" !DecimalDigit { return "\0"; }
  / HexEscapeSequence

CharacterEscapeSequence
  = SingleEscapeCharacter
  / NonEscapeCharacter

SingleEscapeCharacter
  = "'"
  / '"'
  / "\\"
  / "b"  { return "\b";   }
  / "f"  { return "\f";   }
  / "n"  { return "\n";   }
  / "r"  { return "\r";   }
  / "t"  { return "\t";   }

NonEscapeCharacter
  = !(EscapeCharacter / LineTerminator) SourceCharacter { return text(); }

EscapeCharacter
  = SingleEscapeCharacter
  / DecimalDigit
  / "x"

HexEscapeSequence
  = "x" digits:$(HexDigit HexDigit) {
      return String.fromCharCode(parseInt(digits, 16));
    }


/*
 * Unicode Characters (simplified, only main latin characters)
 */

// Letter, Lowercase
Ll = [a-z]

// Letter, Uppercase
Lu = [A-Z]

// Number, Decimal digit
Nd = [0-9]

// Separator, Space
Zs = [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]

/* Tokens */

BreakToken        = "break"      !IdentifierPart
CaseToken         = "case"       !IdentifierPart
ConstToken        = "const"      !IdentifierPart
ContinueToken     = "continue"   !IdentifierPart
DefaultToken      = "default"    !IdentifierPart
ElseToken         = "else"       !IdentifierPart
FalseToken        = "false"      !IdentifierPart
ForToken          = "for"        !IdentifierPart
IfToken           = "if"         !IdentifierPart
InToken           = "in"         !IdentifierPart
NewToken          = "new"        !IdentifierPart
NullToken         = "null"       !IdentifierPart
ReturnToken       = "return"     !IdentifierPart
SwitchToken       = "switch"     !IdentifierPart
ThisToken         = "this"       !IdentifierPart
TrueToken         = "true"       !IdentifierPart
VarIntToken       = "int"        !IdentifierPart
VarUIntToken      = "u_int"      !IdentifierPart
VarByteToken      = "byte"       !IdentifierPart
VarUByteToken     = "u_byte"     !IdentifierPart
VarLongToken      = "long"       !IdentifierPart
VarULongToken      = "u_long"     !IdentifierPart
VarFloatToken     = "float"      !IdentifierPart
VarStrToken       = "str"        !IdentifierPart
VoidToken         = "void"       !IdentifierPart
IsToken           = "is"         !IdentifierPart
NotToken          = "not"        !IdentifierPart

/* Spark: special tokens */

AndToken          = "and"        !IdentifierPart
OrToken           = "or"         !IdentifierPart

WhenToken         = "when"       !IdentifierPart
WaitToken         = "wait"       !IdentifierPart

/* Skipped */

_nbws_
  = NobreakWhitespace*

__
  = (WhiteSpace / LineTerminatorSequence / Comment)*

_
  = (WhiteSpace / MultiLineCommentNoLineTerminator)*

/* End of stream */

EOS
  = __ ";"
  / _ SingleLineComment? LineTerminatorSequence
  / _ &"}"
  / __ EOF

EOF
  = !.

/* ----- A.3 Expressions ----- */

PrimaryExpression
  = ThisToken { return { location: getLocation(), $$: "THIS_EXPRESSION" }; }
  / Identifier
  / Literal
  / ArrayLiteral
  / "(" __ expression:Expression __ ")" { return expression; }

PrimaryExpressionNoLiteral
  = ThisToken { return { location: getLocation(), $$: "THIS_EXPRESSION" }; }
  / Identifier
  / ArrayLiteral
  / "(" __ expression:Expression __ ")" { return expression; }

ArrayLiteral
  = "[" __ elements:ElementList __ "]" {
      return {
        location: getLocation(),
        $$:       "ARRAY_EXPRESSION",
        elements: elements
      };
    }

ElementList
  = head:(
      element:AssignmentExpression {
        return element;
      }
    )
    tail:(
      __ "," __ element:AssignmentExpression {
        return element;
      }
    )*
    { return Array.prototype.concat.apply(head, tail); }

MemberExpression
  = head:(
        pe:PrimaryExpression { return pe; }
      / NewToken __ callee:MemberExpression __ args:Arguments {
          return { location: getLocation(), $$: "NEW_EXPRESSION", callee: callee, arguments: args };
        }
    )
    tail:(
        __ "[" __ property:Expression __ "]" {
          return { property: property, computed: true };
        }
      / __ "." __ property:IdentifierName {
          return { property: property, computed: false };
        }
    )*
    {
      return buildTree(head, tail, function(result, element) {
        return {
          location: getLocation(),
          $$:       "MEMBER_EXPRESSION",
          object:   result,
          property: element.property,
          computed: element.computed
        };
      });
    }

NewExpression
  = MemberExpression
  / NewToken __ callee:NewExpression {
      return { location: getLocation(), $$: "NEW_EXPRESSION", callee: callee, arguments: [] };
    }

CallExpression
  = head:(
      callee:MemberExpression __ args:Arguments {
        return { location: getLocation(), $$: "CALL_STATEMENT", callee: callee, arguments: args };
      }
    )
    tail:(
        __ args:Arguments {
          return { location: getLocation(), $$: "CALL_STATEMENT", arguments: args };
        }
    )*
    {
      return buildTree(head, tail, function(result, element) {
        element[TYPES_TO_PROPERTY_NAMES[element.type]] = result;

        return element;
      });
    }

Arguments
  = "(" __ args:(ArgumentList __)? ")" {
      return optionalList(extractOptional(args, 0));
    }

ArgumentList
  = head:AssignmentExpression tail:(__ "," __ AssignmentExpression)* {
      return buildList(head, tail, 3);
    }

LeftHandSideExpression
  = CallExpression
  / NewExpression

LeftHandSideAssignmentExpression
  = VariableStatement
  / Identifier


PostfixExpression
  = argument:LeftHandSideExpression _ operator:PostfixOperator {
      return {
        location: getLocation(),
        $$:       "UPDATE_EXPRESSION",
        operator:       operator,
        argument: argument,
        prefix:   false
      };
    }
  / LeftHandSideExpression

PostfixOperator
  = "++"
  / "--"

UnaryExpression
  = PostfixExpression
  / operator:UnaryOperator __ argument:UnaryExpression {
      var type = (operator === "++" || operator === "--")
        ? "UPDATE_EXPRESSION"
        : "UNARY_EXPRESSION";

      return {
        location: getLocation(), $$:     type,
        operator:       operator,
        argument: argument,
        prefix:   true
      };
    }

UnaryOperator
  = $VoidToken
  / "++"
  / "--"
  / $("+" !"=")
  / $("-" !"=")
  / "~"
  / "!"

MultiplicativeExpression
  = head:UnaryExpression
    tail:(__ MultiplicativeOperator __ UnaryExpression)*
    { return buildBinaryExpression(head, tail); }

MultiplicativeOperator
  = $("*" !"=")
  / $("/" !"=")
  / $("%" !"=")

AdditiveExpression
  = head:MultiplicativeExpression
    tail:(__ AdditiveOperator __ MultiplicativeExpression)*
    { return buildBinaryExpression(head, tail); }

AdditiveOperator
  = $("+" ![+=])
  / $("-" ![-=])

ShiftExpression
  = head:AdditiveExpression
    tail:(__ ShiftOperator __ AdditiveExpression)*
    { return buildBinaryExpression(head, tail); }

ShiftOperator
  = $("<<"  !"=")
  / $(">>>" !"=")
  / $(">>"  !"=")

RelationalExpression
  = head:ShiftExpression
    tail:(__ RelationalOperator __ ShiftExpression)* {
      var expr = buildLogicalExpression(head, tail);
      return expr;
  }

RelationalOperator
  = "<="
  / ">="
  / $("<" !"<")
  / $(">" !">")


EqualityExpression
  = head:RelationalExpression
    tail:(__ EqualityOperator __ RelationalExpression)*{
      var expr = buildLogicalExpression(head, tail);
      return expr;
  }


EqualityOperator
  = IsNotOperator
  / IsOperator
  / "=="
  / "!="

IsOperator
  = IsToken { return "is"; }

IsNotOperator
  = IsToken _nbws_ NotToken { return "is not"; }

BitwiseANDExpression
  = head:EqualityExpression
    tail:(__ BitwiseANDOperator __ EqualityExpression)*
    { return buildBinaryExpression(head, tail); }


BitwiseANDOperator
  = $("&" ![&=])

BitwiseXORExpression
  = head:BitwiseANDExpression
    tail:(__ BitwiseXOROperator __ BitwiseANDExpression)*
    { return buildBinaryExpression(head, tail); }


BitwiseXOROperator
  = $("^" !"=")

BitwiseORExpression
  = head:BitwiseXORExpression
    tail:(__ BitwiseOROperator __ BitwiseXORExpression)*
    { return buildBinaryExpression(head, tail); }


BitwiseOROperator
  = $("|" ![|=])

LogicalANDExpression
  = head:BitwiseORExpression
    tail:(__ LogicalANDOperator __ BitwiseORExpression)*{
      var expr = buildLogicalExpression(head, tail);
      return expr;
  }


LogicalANDOperator
  = "&&" / AndToken { return "&&"; }

LogicalORExpression
  = head:LogicalANDExpression
    tail:(__ LogicalOROperator __ LogicalANDExpression)*{
      var expr = buildLogicalExpression(head, tail);
      return expr;
  }

LogicalOROperator
  = "||" / OrToken { return "||"; }

ConditionalExpression
  = test:LogicalORExpression __
    "?" __ consequent:AssignmentExpression __
    ":" __ alternate:AssignmentExpression
    {
      return {
        location: getLocation(),
        $$:       "CONDITIONAL",
        test:       test,
        consequent: consequent,
        alternate:  alternate
      };
    }
  / LogicalORExpression

AssignmentExpression
  = left:LeftHandSideAssignmentExpression _nbws_
    "=" !"=" _nbws_
    right:AssignmentExpression
    {
      return {
        location: getLocation(),
        $$:       "ASSIGNMENT_STATEMENT",
        operator: "=",
        left:     left,
        right:    right,
        type:     "bool"
      };
    }
  / left:LeftHandSideAssignmentExpression _nbws_
    operator:AssignmentOperator _nbws_
    right:AssignmentExpression
    {
      return {
        location: getLocation(),
        $$:       "ASSIGNMENT_ACTION",
        operator:       operator,
        left:     left,
        right:    right,
        type:     "bool"
      };
    }
  / ConditionalExpression

AssignmentOperator
  = "*="
  / "/="
  / "%="
  / "+="
  / "-="
  / "<<="
  / ">>="
  / ">>>="
  / "&="
  / "^="
  / "|="

Expression
  = head:AssignmentExpression tail:(__ "," __ AssignmentExpression)* {
      return ((tail.length && tail.length > 0) ? { location: getLocation(), $$: "SEQUENCE_EXPRESSION", expressions: buildList(head, tail, 3) } : head);
    }

/* ----- A.4 Statements ----- */

Statement
  = Block
  / VariableStatement
  / EmptyStatement
  / ExpressionStatement
  / IfStatement
  / IterationStatement
  / ContinueStatement
  / BreakStatement
  / ReturnStatement
  / LabelledStatement
  / SwitchStatement

Block
  = "{" __ body:(StatementList __)? "}" {
      return {
        location: getLocation(),
        $$: "BLOCK_STATEMENT",
        body: optionalList(extractOptional(body, 0))
      };
    }

StatementList
  = head:Statement tail:(__ Statement)* { return buildList(head, tail, 1); }

VariableStatement
  = type:VariableType __ declarations:VariableDeclarationList EOS {
      return {
        location: getLocation(),
        $$:         "VARIABLE_STATEMENT",
        type: type,
        declarations: declarations
      };
    }

VariableDeclarationList
  = head:VariableDeclaration tail:(__ "," __ VariableDeclaration)* {
      return buildList(head, tail, 3);
    }

VariableDeclaration
  = id:Identifier init:(_nbws_ Initialiser)? {
      return {
        location: getLocation(),
        $$: "VARIABLE_DECLARATOR",
        id:   id,
        init: extractOptional(init, 1)
      };
    }

// spark
FunctionType =
    type: VariableType { return type; }
  / type: VoidToken { return "void"; } 

VariableType =
    VarIntToken { return "int"; }
  / VarByteToken { return "byte"; }
  / VarLongToken { return "long"; }
  / VarFloatToken { return "float"; }
  / VarStrToken { return "str"; }


Initialiser
  = "=" !"=" _nbws_ expression:AssignmentExpression { return expression; }

EmptyStatement
  = ";" { return { location: getLocation(), $$: "EMPTY_STATEMENT" }; }

ExpressionStatement
  = !("{") expression:Expression EOS {
      return {
        location: getLocation(),
        $$:       "EXPRESSION_STATEMENT",
        expression: expression
      };
    }

IfStatement
  = IfToken _nbws_ test:Expression __
    consequent:Block __
    ElseToken __
    alternate: (IfStatement / Block)
    {
      return {
        location: getLocation(),
        $$:       "IF_STATEMENT",
        test:       test,
        consequent: consequent,
        alternate:  alternate
      };
    }
  / IfToken _nbws_ test:Expression __
    consequent:Block {
      return {
        location: getLocation(),
        $$:       "IF_STATEMENT",
        test:       test,
        consequent: consequent,
        alternate:  null
      };
    }

IterationStatement
  = ForToken _nbws_
    lpar:("(" {return getLocation()})? __
    init:(Expression __)? ";" __
    test:(Expression __)? ";" __
    update:(Expression __)?
    rpar:(")" {return getLocation()})? __
    body:Block
    {
      if ((lpar && !rpar) || (!lpar && rpar)) {
        compiler_error("missing_parenthesis", ["FOR statement"], lpar || rpar);
      }

      return {
        location: getLocation(),
        $$:   "FOR_STATEMENT",
        init:   extractOptional(init, 0),
        test:   extractOptional(test, 0),
        update: extractOptional(update, 0),
        body:   body
      };
    }
  / ForToken _nbws_
    lpar:"("? __
    VariableType __ declarations:VariableDeclarationList __ ";" __
    test:(Expression __)? ";" __
    update:(Expression __)?
    rpar:")"? __
    body:Block
    {
      if ((lpar && !rpar) || (!lpar && rpar)) {
        compiler_error("missing_parenthesis", ["FOR statement"]);
      }
      return {
        location: getLocation(),
        $$:   "FOR_STATEMENT",
        init:   {
          location: getLocation(),
          $$:         "VARIABLE_DECLARATION",
          declarations: declarations
        },
        test:   extractOptional(test, 0),
        update: extractOptional(update, 0),
        body:   body
      };
    }
  / ForToken _nbws_
    lpar:"("? _nbws_
    test:Expression _nbws_
    rpar:")"? __
    body:Block
    {
      if ((lpar && !rpar) || (!lpar && rpar)) {
        compiler_error("missing_parenthesis", ["FOR statement"]);
      }

      return {
        location: getLocation(),
        $$:   "FOR_STATEMENT",
        init:   null,
        test:   test,
        update: null,
        body:   body
      };
    }
  / ForToken _nbws_
    lpar:"("? __
    left:LeftHandSideExpression __
    InToken __
    right:Expression __
    rpar:")"? __
    body:Block
    {
      if ((lpar && !rpar) || (!lpar && rpar)) {
        compiler_error("missing_parenthesis", ["FOR statement"]);
      }
      return {
        location: getLocation(),
        $$:  "FOR_IN_STATEMENT",
        left:  left,
        right: right,
        body:  body
      };
    }

ContinueStatement
  = ContinueToken EOS {
      return { location: getLocation(), $$: "CONTINUE_STATEMENT", label: null };
    }
  / ContinueToken _ label:Identifier EOS {
      return { location: getLocation(), $$: "CONTINUE_STATEMENT", label: label };
    }

BreakStatement
  = BreakToken EOS {
      return { location: getLocation(), $$: "BREAK_STATEMENT", label: null };
    }
  / BreakToken _ label:Identifier EOS {
      return { location: getLocation(), $$: "BREAK_STATEMENT", label: label };
    }

ReturnStatement
  = ReturnToken EOS {
      return { location: getLocation(), $$: "RETURN_STATEMENT", argument: null };
    }
  / ReturnToken _ argument:Expression EOS {
      return { location: getLocation(), $$: "RETURN_STATEMENT", argument: argument };
    }

SwitchStatement
  = SwitchToken __ "(" __ discriminant:Expression __ ")" __
    cases:CaseBlock
    {
      return {
        location: getLocation(),
        $$:         "SWITCH",
        discriminant: discriminant,
        cases:        cases
      };
    }

CaseBlock
  = "{" __ clauses:(CaseClauses __)? "}" {
      return optionalList(extractOptional(clauses, 0));
    }
  / "{" __
    before:(CaseClauses __)?
    default_:DefaultClause __
    after:(CaseClauses __)? "}"
    {
      return optionalList(extractOptional(before, 0))
        .concat(default_)
        .concat(optionalList(extractOptional(after, 0)));
    }

CaseClauses
  = head:CaseClause tail:(__ CaseClause)* { return buildList(head, tail, 1); }

CaseClause
  = CaseToken __ test:Expression __ ":" consequent:(__ StatementList)? {
      return {
        location: getLocation(),
        $$:       "CASE",
        test:       test,
        consequent: optionalList(extractOptional(consequent, 1))
      };
    }

DefaultClause
  = DefaultToken __ ":" consequent:(__ StatementList)? {
      return {
        location: getLocation(),
        $$:       "CASE",
        test:       null,
        consequent: optionalList(extractOptional(consequent, 1))
      };
    }

LabelledStatement
  = label:Identifier __ ":" __ body:Statement {
      return { location: getLocation(), $$: "LABELED_STATEMENT", label: label, body: body };
    }

/* ----- A.5 Functions and Programs ----- */

FunctionDeclaration
  = doc:(DocComment __)? type:FunctionType  __ id:Identifier __
    "(" __ params:(FormalParameterDeclarationList __)? ")" __
    "{" __ body:FunctionBody __ "}"
    {
      return {
        location: getLocation(),
        $$:     "FUNCTION_DECLARATION",
        id:     id,
        params: optionalList(extractOptional(params, 0)),
        body:   body,
        doc:    extractOptional(doc, 0),
        type:   type
      };
    }

FormalParameterDeclarationList
  = head:ParameterDeclaration tail:(__ "," __ ParameterDeclaration)* {
      return buildList(head, tail, 3);
    }

ParameterDeclaration
  = head:VariableType _nbws_ tail:Identifier {
    return { $$: "PARAM_DECLARATOR", type: head, id: tail, location: getLocation() };
  }

FormalParameterList
  = head:Identifier tail:(__ "," __ Identifier)* {
      return buildList(head, tail, 3);
    }

FunctionBody
  = body:SourceElements? {
      return {
        location: getLocation(),
        $$: "BLOCK_STATEMENT",
        body: optionalList(body)
      };
    }

Program
  = body:SourceElements? {
      // console.log(body);
      return {
        location: getLocation(),
        $$: "PROGRAM",
        body: optionalList(body)
      };
    }

SourceElements
  = head:SourceElement tail:(__ SourceElement)* {
      return buildList(head, tail, 1);
    }

SourceElement
  = Statement
  / FunctionDeclaration

