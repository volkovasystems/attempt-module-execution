/*:
	@module-license:
		The MIT License (MIT)

		Copyright (c) 2014 Richeve Siodina Bebedor

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"packageName": "attempt-module-execution",
			"fileName": "attempt-module-execution.js",
			"moduleName": "attemptModuleExecution",
			"authorName": "Richeve S. Bebedor",
			"authorEMail": "richeve.bebedor@gmail.com",
			"repository": "git@github.com:volkovasystems/attempt-module-execution.git",
			"isGlobal": "true"
		}
	@end-module-configuration

	@module-documentation:

	@end-module-documentation

	@include:
		{
			"transform-json-to-base64.js@github.com/volkovasystems": "transformJSONToBase64"
			"parse-command-argument-list.js@github.com/volkovasystems": "parseCommandArgumentList",
			"extract-parameter-list-from-function.js@github.com/volkovasystems": "extractParameterListFromFunction",
			"camelize-namespace.js@github.com/volkovasystems": "camelizeNamespace",
			"path@nodejs": "path"
		}
	@end-include
*/
var attemptModuleExecution = function attemptModuleExecution( moduleMethod ){

	var commandLineParameterList = process.argv;
	var commandFilePath = commandLineParameterList[ 1 ];

	var commandFileName = commandFilePath.split( path.sep ).reverse( )[ 0 ];
	var commandNamespace = commandFileName.replace( FILE_EXTENSION_PATTERN, "" );
	var commandMethodName = camelizeNamespace( commandNamespace );

	if( moduleMethod.name != commandMethodName ){
		var error = new Error( "fatal:method and command does not match" );
		console.error( error );
		throw error;
	}

	var methodParameterList = extractParameterListFromFunction( moduleMethod );

	var commandArgumentSet = parseCommandArgumentList( );

	var argumentValueList = [ ];
	var parameterName = "";

	var callback = function callback( error, result ){
		if( error ){
			console.error( error );

		}else{
			if( typeof result == "string" ||
				typeof result == "number" ||
				typeof result == "boolean" )
			{
				console.log( result );

			}else if( typeof result == "object" ){
				try{
					result = transformJSONToBase64( result );
					result = "@transform-base64-to-json:" + result;

					console.log( result );

				}catch( error ){
					console.error( error );
				}

			}else{
				var error = new Error( "result cannot be stringify" );
				console.error( error );
			}
		}
	};

	var methodParameterListLength = methodParameterList.length;
	for( var index = 0; index < methodParameterListLength; index++ ){

		parameterName = methodParameterList[ index ];

		if( parameterName in commandArgumentSet ){
			argumentValueList[ index ] = commandArgumentSet[ parameterName ];

		}else if( index in commandArgumentSet ){
			argumentValueList[ index ] = commandArgumentSet[ index ];

		}else if( parameterName === "callback" ){
			argumentValueList[ index ] = callback;

		}else{
			argumentValueList[ index ] = null;
		}
	}

	try{
		var result = moduleMethod.apply( null, argumentValueList );

		if( typeof result != "undefined" ){
			callback( null, result );
		}

	}catch( error ){
		callback( error );
	}
};

const FILE_EXTENSION_PATTERN = /\.[A-Za-z0-9]+$/;

var transformJSONToBase64 = require( "./transform-json-to-base64/transform-json-to-base64.js" );
var parseCommandArgumentList = require( "./parse-command-argument-list/parse-command-argument-list.js" );
var extractParameterListFromFunction = require( "./extract-parameter-list-from-function/extract-parameter-list-from-function.js" );
var camelizeNamespace = require( "./camelize-namespace/camelize-namespace.js" );

var path = require( "path" );

module.exports = attemptModuleExecution;