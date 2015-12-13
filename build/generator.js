!function n(r,t,e){function o(i,a){if(!t[i]){if(!r[i]){var f="function"==typeof require&&require;if(!a&&f)return f(i,!0);if(u)return u(i,!0);var c=new Error("Cannot find module '"+i+"'");throw c.code="MODULE_NOT_FOUND",c}var E=t[i]={exports:{}};r[i][0].call(E.exports,function(n){var t=r[i][1][n];return o(t?t:n)},E,E.exports,n,r,t,e)}return t[i].exports}for(var u="function"==typeof require&&require,i=0;i<e.length;i++)o(e[i]);return o}({1:[function(n,r,t){(function(t){r.exports=function(){"use strict";var r=n("./modules/IndentManager"),e=n("./modules/GeneratorUtil"),o=function(n,r){var t=r||n.$$,e=u[t](n);if(e.error)throw new CompilerError("SemanticError",e.error.message,e.error.location);return e},u={DOCSTRING:function(n){return"// "+n.body.join("\n// ")+"\n"},VARIABLE_STATEMENT:function(n){for(var r=e.generateType(n.type)+" ",t=0,u=n.declarations.length;u>t;t++){var i=n.declarations[t],a="";r+=o(i.id)+a,i.init&&("str"===i.init.type&&(a="[]"),r+=" = "+o(i.init))}return r},VARIABLE_DECLARATOR:function(n){return n},FUNCTION_DECLARATION:function(n){var r="";n.doc&&(r+=o(n.doc)),r+=n.type+" "+n.id.name+" ( ";for(var t=[],e=0,u=n.params.length;u>e;e++){var i=o(n.params[e]);t.push(i)}return r+=t.join(", "),r+=" ) ",r+=o(n.body)},PARAM_DECLARATOR:function(n){var r=e.generateType(n.type)+" "+n.id.name;return r},RETURN_STATEMENT:function(n){var r="return "+o(n.argument);return r},CALL_STATEMENT:function(n){var r=n.name;return r},FOR_STATEMENT:function(n){var r="for ()";return r},FOR_STATEMENT_DECLARATION:function(n){return n},BREAK_STATEMENT:function(n){return n},CONTINUE_STATEMENT:function(n){return n},EXPRESSION_STATEMENT:function(n){var r=o(n.expression);return r},IDENTIFIER:function(n){return n.name},LITERAL:function(n){var r=n.value;return"str"===n.type&&(r='"'+r+'"'),r},BINARY_EXPRESSION:function(n){var r="";return r+=o(n.left),r+=" "+n.operator+" ",r+=o(n.right)},ASSIGNMENT_STATEMENT:function(n){var r=o(n.left);return r+=" = "+o(n.right)},BLOCK_STATEMENT:function(n){var t=" {\n";return r.increase(),n.body.forEach(function(n){t+=r.getCurrentIndent()+o(n)+";\n"}),r.decrease(),t+="}\n"},PROGRAM:function(n){var t="";return n.body.forEach(function(n){t+=r.getCurrentIndent()+o(n),t.match(/\}\n$/)||(t+=";"),t+="\n"}),t},IF_STATEMENT:function(n){var r=" if ( ";return r+=o(n.test),r+=" ) ",r+=o(n.consequent),n.alternate&&(r+=" else ",r+=o(n.alternate)),r},LOGICAL_EXPRESSION:function(n){n.left=o(n.left),n.right=o(n.right);var r=n.left+" "+n.operator+" "+n.right;return r},UPDATE_EXPRESSION:function(n){var r=n.operator+"";return r+=o(n.argument)},UNARY_EXPRESSION:function(n){var r=n.operator+"";return r+=o(n.argument)}},i={parse:function(n){var r=o(n);return r.trim()}};return t.SparkGenerator=i,i}()}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./modules/GeneratorUtil":2,"./modules/IndentManager":3}],2:[function(n,r,t){r.exports=function(){"use strict";var n={"byte":"char",ubyte:"unsigned char","int":"int",uint:"unsigned int","long":"long",ulong:"unsigned long","float":"float",str:"char","void":"void"},r={generateType:function(r){return n[r]||r}};return r}()},{}],3:[function(n,r,t){r.exports=function(){"use strict";var n=0,r="  ",t="",e={getCurrentIndent:function(){return t},increase:function(){n+=1,t=Array(n+1).join(r)},decrease:function(){n-=1,t=Array(n+1).join(r)}};return e}()},{}]},{},[1]);
//# sourceMappingURL=maps/generator.js.map
