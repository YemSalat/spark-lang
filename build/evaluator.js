!function t(e,n,r){function o(i,u){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!u&&c)return c(i,!0);if(a)return a(i,!0);var l=new Error("Cannot find module '"+i+"'");throw l.code="MODULE_NOT_FOUND",l}var s=n[i]={exports:{}};e[i][0].call(s.exports,function(t){var n=e[i][1][t];return o(n?n:t)},s,s.exports,t,e,n,r)}return n[i].exports}for(var a="function"==typeof require&&require,i=0;i<r.length;i++)o(r[i]);return o}({1:[function(t,e,n){e.exports=function(){"use strict";var t={LOW:{name:"LOW",type:"int",value:0},HIGH:{name:"HIGH",type:"int",value:1},READ:{name:"READ",type:"int",value:0},WRITE:{name:"WRITE",type:"int",value:1}};return t}()},{}],2:[function(t,e,n){(function(n){e.exports=function(){"use strict";function e(t,e,n){this.name=t,this.message=e,this.location=n}var r=t("./modules/SymbolTable"),o=t("./modules/FuncTable"),a=t("./modules/ErrorManager"),i=t("./modules/EvaluatorUtil"),u=(t("./../common/DEFAULT_CONSTANTS"),function(t,n){var r=n||null!==t?t.$$:null,o=null;if(r){if(o=l[r](t),o.error)throw new e("SemanticError",o.error.message,o.error.location)}else console.log("Node evaluation method is not defined for:"),console.log(t);return o}),c={parse:function(t,e){r.reset(),o.reset();var n=u(t);return{tree:n,symbolScope:r.getTable(),funcScope:o.getTable()}}},l={DOCSTRING:function(t){return t},VARIABLE_STATEMENT:function(t){for(var e=t.type,n=0,o=t.declarations.length;o>n;n++){var c=t.declarations[n],l=null;if(null!==c.init){c.init=u(c.init);var s=i.typeCheck(t.type,c.init.type);if(!s)return a.logError(t,t.location,"type_mismatch",[c.id.name,e]);t.type=s,l=s}c.type=l;var f=c.id.name,p=r.checkScope(f);if(p)return a.logError(t,t.location,"already_exists",[c.id.name,p.value,p.initLine]);r.addSymbol(c,{value:null,type:t.type})}return t},VARIABLE_DECLARATOR:function(t){return t},FUNCTION_DECLARATION:function(t){var e=o.findFunc(t);if(e)return a.logError(t,t.location,"already_exists",[e.name,e.initLine]);var n=i.checkParamDuplicates(t.params);return n?a.logError(n,n.location,"duplicate_param",[n.id.name]):(o.addFunc(t),r.enterScope(),o.enterFunc(t),t.body=u(t.body),o.exitFunc(),r.exitScope(),t)},PARAM_DECLARATOR:function(t){return t},RETURN_STATEMENT:function(t){t.argument=u(t.argument),t.type=t.argument.type;var e=getCurrentFunc();if(!e.node)return a.logError(t,t.location,"return_outside");var n=i.typeCheck(t.type,e.type);return n?t:a.logError(t,t.location,"type_mismatch",[e.node.id.name])},CALL_STATEMENT:function(t){return t.type="int",t},FOR_STATEMENT:function(t){return t.init=u(t.init),t.test=u(t.test),t.update=u(t.update),t.body=u(t.body),t},BREAK_STATEMENT:function(t){return t},CONTINUE_STATEMENT:function(t){return t},EXPRESSION_STATEMENT:function(t){var e=u(t.expression);return e},IDENTIFIER:function(t){var e=t.name,n=r.findSymbol(e);return n?(t.type=n.type,t):a.logError(t,t.location,"does_not_exist",[e])},LITERAL:function(t){return"int"===t.type&&(t.type=i.getIntegerType(t.value)),t},BINARY_EXPRESSION:function(t){return t.left=u(t.left),t.right=u(t.right),t.type=i.typeCheck(t.left.type,t.right.type),t.type?t:a.logError(t,t.location,"type_mismatch",[t.operator,t.left.type,t.right.type])},ASSIGNMENT_STATEMENT:function(t){t.right=u(t.right);var e=t.left.name,n=r.findSymbol(e);if(!n)return u(i.constructVarDeclarator(t));t.left=u(t.left);var o=i.typeCheck(t.left.type,t.right.type);return o?t:a.logError(t,t.location,"type_mismatch",[t.right.type,t.left.type])},ASSIGNMENT_ACTION:function(t){return t},BLOCK_STATEMENT:function(t){return r.enterScope(),t.body.forEach(function(t){t=u(t)}),r.exitScope(),t},PROGRAM:function(t){return t.body.forEach(function(t){t=u(t)}),t},IF_STATEMENT:function(t){return t.test=u(t.test),"bool"!==t.test.type?a.logError(t,t.test.location,"not_a_bool"):(t.consequent=u(t.consequent),t.alternate&&(t.alternate=u(t.alternate)),t)},LOGICAL_EXPRESSION:function(t){t.left=u(t.left),t.right=u(t.right);var e=i.typeCheck(t.left.type,t.right.type);return e?i.isEqualityOperator(t.operator)||i.isNumber(e)?t:a.logError(t,t.location,"not_a_number",[t.operator]):a.logError(t,t.location,"type_mismatch",[t.left.type,t.right.type])},UPDATE_EXPRESSION:function(t){return t.argument=u(t.argument),i.isNumber(t.argument.type)?(t.type=t.argument.type,t):a.logError(t,t.location,"not_a_number")},UNARY_EXPRESSION:function(t){return t.argument=u(t.argument),"!"===t.operator&&"bool"!==t.argument.type?a.logError(t,t.location,"not_a_bool"):(t.type=t.argument.type,t)}};return n.SparkEvaluator=c,c}()}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./../common/DEFAULT_CONSTANTS":1,"./modules/ErrorManager":3,"./modules/EvaluatorUtil":4,"./modules/FuncTable":5,"./modules/SymbolTable":6}],3:[function(t,e,n){e.exports=function(){"use strict";var t={operator:{"+":"add","-":"subtract","*":"multiply","/":"divide"}},e={VARIABLE_STATEMENT:{type_mismatch:'variable "{0}" does not match type "{1}"',already_exists:'variable "{0}" was already initialized as {1} on line {2}',does_not_exist:'variable "{0}" is not defined'},VARIABLE_DECLARATOR:{already_initialized:'variable "{0}" was already initialized as {1} on line {2}',already_declared:'variable "{0}" was already declared on line {1}'},FUNCTION_DECLARATION:{already_exists:'function "{0}" was already declared on line {1}'},PARAM_DECLARATOR:{duplicate_param:'duplicate parameter "{0}"'},RETURN_STATEMENT:{return_outside:"return statement outside function declaration",type_mismatch:'return statement type does not match function "{0}"'},IDENTIFIER:{does_not_exist:'variable "{0}" does not exist'},BINARY_EXPRESSION:{type_mismatch:'"{0}" operation types do not match, can\'t {operator: 0} "{1}" and "{2}"'},LOGICAL_EXPRESSION:{type_mismatch:'can\'t compare "{0}" and "{1}"',cant_compare:'can\'t compare "{0}" and "{1}"',not_a_number:'can use "{0}" operator only on numbers'},ASSIGNMENT_STATEMENT:{type_mismatch:'assignment types mismatch, can\'t assign "{0}" to "{1}"'},UPDATE_EXPRESSION:{not_a_number:"expression is not a number"},UNARY_EXPRESSION:{not_a_bool:"unary expression must be a boolean"},IF_STATEMENT:{not_a_bool:"IF condition must be a boolean"}},n=function(n,r,o,a){var i="string"==typeof n?n:n.$$,u=e[i][o];if(a)for(var c=0,l=a.length;l>c;c++){var s=(a[c],new RegExp("\\{[ ]*([a-z]+)[ ]*\\:[ ]*"+c+"[ ]*\\}","gi")),f=new RegExp("\\{[ ]*"+c+"[ ]*\\}","gi");u=u.replace(s,function(e,n){var r=t[n];return r[a[c]]}),u=u.replace(f,a[c])}var p={error:{location:r,message:u,node:n}};return p},r={logError:n};return r}()},{}],4:[function(t,e,n){e.exports=function(){"use strict";var t=["byte","int","long","float"],e=["==","!=","is","is not"],n={"byte":128,"int":32767,"long":2147483647},r={constructVarDeclarator:function(t){return t.$$="VARIABLE_STATEMENT",t.type=t.right.type,t.declarations=[{$$:"VARIABLE_DECLARATOR",id:{location:t.left.location,$$:"IDENTIFIER",name:t.left.name},location:t.left.location,init:t.right}],t},typeCheck:function(e,n){if(!e||!n)return!1;if(e===n)return e;var r=t.indexOf(e);if(r>-1){var o=t.indexOf(n);return o>-1?(o>r&&(e=n),e):!1}return!1},getParameters:function(t){},checkParamDuplicates:function(t){for(var e=1,n=t.length;n>e;e++)for(var r=t[e],o=0;e>o;o++){var a=t[o];if(a.id.name===r.id.name)return r}return!1},isNumber:function(e){return t.indexOf(e)>-1},isEqualityOperator:function(t){return e.indexOf(t)>-1},getIntegerType:function(t){var e=parseInt(t,10),r=Math.abs(e),o="int",a=n["long"];for(var i in n)if(n.hasOwnProperty(i)){var u=n[i];u>=r&&a>=u&&(o=i,a=u)}return o}};return r}()},{}],5:[function(t,e,n){e.exports=function(){"use strict";var t={},e={node:null,returns:[]},n={getTable:function(){return t},reset:function(){t={},e={node:null,returns:[]}},getCurrentFunc:function(){return e},enterFunc:function(t){e.node=t},exitFunc:function(){e={node:null,returns:[]}},funcAddReturn:function(t){current.returns.push(t)},getSignature:function(t){for(var e=t.type+"__"+t.id.name+"__",n=0,r=t.params.length;r>n;n++)e+=t.params[n].type+"_";return e+="fn"},getParams:function(t){for(var e=[],n=0,r=t.length;r>n;n++){var o=t[n];e.push({type:o.type,name:o.id.name})}return e},findFunc:function(e){var r=n.getSignature(e);return t.hasOwnProperty(r)?t[r]:null},addFunc:function(e){var r=n.getSignature(e),o=e.id.name,a=e.type,i=n.getParams(e.params),u=e.location.start.line,c=e.doc?e.doc.body:"";t[r]={name:o,type:a,params:i,initLine:u,doc:c}}};return n}()},{}],6:[function(t,e,n){e.exports=function(){"use strict";var e=t("../../common/DEFAULT_CONSTANTS"),n=1,r={sc0:e,sc1:{}},o=r["sc"+n],a={setInitialScope:function(t){e=t,a.reset()},getTable:function(){return r},reset:function(){n=1,r={sc0:e,sc1:{}},o=r["sc"+n]},enterScope:function(){n+=1,r["sc"+n]={},o=r["sc"+n]},exitScope:function(){n>1&&(r["sc"+n]=null),n-=1,o=r["sc"+n]},getScope:function(t){var e="udefined"!=typeof t?t:n;return r["sc"+e]},findSymbol:function(t){for(var e=n;e>=0;e--){var r=a.getScope(e);if(r.hasOwnProperty(t))return r[t]}return null},addSymbol:function(t,e){var n=e||t.init,r=t.id.name,a=n.value,i=n.type,u=t.location.start.line;o[r]={name:r,value:a,type:i,initLine:u}},checkScope:function(t){return o.hasOwnProperty(t)?o[t]:!1}};return a}()},{"../../common/DEFAULT_CONSTANTS":1}]},{},[2]);
//# sourceMappingURL=maps/evaluator.js.map
