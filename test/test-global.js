'use strict';

QUnit.module('Simple Compare Trees', function () {

	QUnit.test( 'Test assignment declaration', function( assert ) {
		var source = 'a = 1';
		var syntaxTree = getSyntaxTree(source);
		var abstractTree = getAbstractTree(null, syntaxTree);
		var codeResult = getCode(null, abstractTree);

		var tt1 = {"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":5,"line":1,"column":6}},"$$":"EXPRESSION_STATEMENT","expression":{"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":5,"line":1,"column":6}},"$$":"VARIABLE_STATEMENT","operator":"=","left":{"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":1,"line":1,"column":2}},"$$":"IDENTIFIER","name":"a"},"right":{"location":{"start":{"offset":4,"line":1,"column":5},"end":{"offset":5,"line":1,"column":6}},"$$":"LITERAL","value":1,"type":"byte"},"type":"byte","declarations":[{"$$":"VARIABLE_DECLARATOR","id":{"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":1,"line":1,"column":2}},"$$":"IDENTIFIER","name":"a"},"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":1,"line":1,"column":2}},"init":{"location":{"start":{"offset":4,"line":1,"column":5},"end":{"offset":5,"line":1,"column":6}},"$$":"LITERAL","value":1,"type":"byte"},"type":"byte"}]}};
		var tt2 = {"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":5,"line":1,"column":6}},"$$":"EXPRESSION_STATEMENT","expression":{"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":5,"line":1,"column":6}},"$$":"VARIABLE_STATEMENT","operator":"=","left":{"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":1,"line":1,"column":2}},"$$":"IDENTIFIER","name":"a"},"right":{"location":{"start":{"offset":4,"line":1,"column":5},"end":{"offset":5,"line":1,"column":6}},"$$":"LITERAL","value":1,"type":"byte"},"type":"byte","declarations":[{"$$":"VARIABLE_DECLARATOR","id":{"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":1,"line":1,"column":2}},"$$":"IDENTIFIER","name":"a"},"location":{"start":{"offset":0,"line":1,"column":1},"end":{"offset":1,"line":1,"column":2}},"init":{"location":{"start":{"offset":4,"line":1,"column":5},"end":{"offset":5,"line":1,"column":6}},"$$":"LITERAL","value":1,"type":"byte"},"type":"byte"}]}};
		var cdr = 'char a = 1;';

		assert.deepEqual( getFirstChild(syntaxTree), tt1 );
		assert.deepEqual( getFirstChild(abstractTree), tt2 );
		assert.deepEqual( codeResult, cdr );
	});
});
