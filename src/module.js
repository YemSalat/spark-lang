(function (module) {
	// const
	var NAMESPACE = 'SPARK_modules';
	
	if ( module[NAMESPACE] ) {
		return;
	}
	// create namespace
	module[NAMESPACE] = {};

	// create import/export functions
	if ( !module.exportModule || !module.importModule ) {
		// export module
		module.exportModule = function (name, obj) {
			if (module[NAMESPACE][name]) {
				throw new Error('Module '+ name +' already exists');
			}
			else {
				module[NAMESPACE][name] = obj;
			}
		};
		// import module
		module.importModule = function (name) {
			return module[NAMESPACE][name];
		};
		// check module
		module.checkModule = function (name) {
			return module[NAMESPACE].hasOwnProperty(name);
		};
	}


})(this);