!function r(n,e,t){function o(i,a){if(!e[i]){if(!n[i]){var f="function"==typeof require&&require;if(!a&&f)return f(i,!0);if(u)return u(i,!0);var c=new Error("Cannot find module '"+i+"'");throw c.code="MODULE_NOT_FOUND",c}var s=e[i]={exports:{}};n[i][0].call(s.exports,function(r){var e=n[i][1][r];return o(e?e:r)},s,s.exports,r,n,e,t)}return e[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}({1:[function(r,n,e){(function(e){n.exports=function(){"use strict";var n=r("./modules/IndentManager"),t=r("./modules/GeneratorUtil"),o=function(r,n){if(null===r)return"";var e=n||r.$$,t=u[e](r);if(t.error)throw new CompilerError("SemanticError",t.error.message,t.error.location);return t},u={DOCSTRING:function(r){return"// "+r.body.join("\n// ")+"\n"},VARIABLE_STATEMENT:function(r){for(var n=t.generateType(r.type)+" ",e=[],u=0,i=r.declarations.length;i>u;u++){var a=r.declarations[u],f="",c="";"str"===a.type&&(c="[]"),f+=o(a.id)+c,a.init&&(f+=" = "+o(a.init)),e.push(f)}return n+=e.join(", ")},VARIABLE_DECLARATOR:function(r){return r},FUNCTION_DECLARATION:function(r){var n="";r.doc&&(n+=o(r.doc)),n+=r.type+" "+r.id.name+" ( ";for(var e=[],t=0,u=r.params.length;u>t;t++){var i=o(r.params[t]);e.push(i)}return n+=e.join(", "),n+=" ) ",n+=o(r.body)},PARAM_DECLARATOR:function(r){var n=t.generateVarDecalaration(r);return n},RETURN_STATEMENT:function(r){var n="return "+o(r.argument);return n},CALL_STATEMENT:function(r){var n=r.name;return n},FOR_STATEMENT:function(r){var n="for (";return n+=o(r.init)+" ; ",n+=o(r.test)+" ; ",n+=o(r.update)+" )",n+=o(r.body)},BREAK_STATEMENT:function(r){return r},CONTINUE_STATEMENT:function(r){return r},EXPRESSION_STATEMENT:function(r){var n=o(r.expression);return n},IDENTIFIER:function(r){return r.name},LITERAL:function(r){var n=r.value;return"str"===r.type&&(n='"'+n+'"'),n},BINARY_EXPRESSION:function(r){var n="";return n+=o(r.left),n+=" "+r.operator+" ",n+=o(r.right)},ASSIGNMENT_STATEMENT:function(r){var n=o(r.left);return n+=" = "+o(r.right)},BLOCK_STATEMENT:function(r){var e=" {\n";return n.increase(),r.body.forEach(function(r){e+=n.getCurrentIndent()+o(r)+";\n"}),n.decrease(),e+="}\n"},PROGRAM:function(r){var e="";return r.body.forEach(function(r){e+=n.getCurrentIndent()+o(r),e.match(/\}[\s]*$/)||(e+=";"),e+="\n"}),e},IF_STATEMENT:function(r){var n="if ( ";return n+=o(r.test),n+=" )",n+=o(r.consequent),r.alternate&&(n+="else ",n+=o(r.alternate)),n},LOGICAL_EXPRESSION:function(r){var n=o(r.left)+" "+r.operator+" "+o(r.right);return n},UPDATE_EXPRESSION:function(r){var n="";return n+=r.prefix?r.operator+o(r.argument):o(r.argument)+r.operator},UNARY_EXPRESSION:function(r){var n=r.operator+"";return n+=o(r.argument)}},i={parse:function(r){var n=o(r);return n.trim()}};return e.SparkGenerator=i,i}()}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./modules/GeneratorUtil":2,"./modules/IndentManager":3}],2:[function(r,n,e){n.exports=function(){"use strict";var r={"byte":"char",ubyte:"unsigned char","int":"int",uint:"unsigned int","long":"long",ulong:"unsigned long","float":"float",str:"char","void":"void"},n={str:{isArray:!0,isString:!0}},e={generateType:function(n){return r[n]||n},generateVarDeclaration:function(r){var t=e.generateType(r.type),o=r.id.name;if(n.hasOwnProperty(r.type)){var u=n[r.type];if(u.isArray)return t+" "+o+"[]"}return t+" "+o}};return e}()},{}],3:[function(r,n,e){n.exports=function(){"use strict";var r=0,n="  ",e="",t={getCurrentIndent:function(){return e},increase:function(){r+=1,e=Array(r+1).join(n)},decrease:function(){r-=1,e=Array(r+1).join(n)}};return t}()},{}]},{},[1]);
//# sourceMappingURL=maps/generator.js.map
