// editor administration module
// (c)copyright 2017, 2020 by Gerald Wodni <gerald.wodni@gmail.com>

var fs          = require("fs");
var path        = require("path");
var rmrf        = require("rmrf");
var _           = require("underscore");

module.exports = {
    setup: function( k ) {
        const dirFilter = process.env.KERN_EDITOR_DIR_FILTER;
        const prefixPath = process.env.KERN_EDITOR_PREFIX;

        function root( req ) {
            if( process.env.KERN_EDITOR_ROOT ) {
                console.log( "ROOT:", process.env.KERN_EDITOR_ROOT )
                return process.env.KERN_EDITOR_ROOT;
            }
            return req.kern.website;
        }

        function vals( req, obj ) {
            return _.extend( {
                prefixPath: prefixPath
            }, obj );
        }

        /* protection filters, TODO: allow overwrite per user-permission */
        var hierarchyFilters = {
            dirHideFilters: [ /(^|\/)\..*/g ],
            dirShowFilters: [ new RegExp( '^' + prefixPath + 'edit' + dirFilter, "g" ) ],
            lockWebsite: false,
            unlockRoot: true
        };

        /* prevent unauthorized access */
        function guardFile( req, res, callback ) {
            var filename = req.params[0];
            var filepath = k.hierarchy.checkFilters( root(req), filename, hierarchyFilters );
            if( filepath == null )
                k.httpStatus( req, res, 403 );
            else
                callback( filename, filepath );
        }

        /* render directory tree & editor */
        function renderAll( req, res, next, values ) {
            k.hierarchy.readHierarchyTree( root(req), root(req), _.extend( {}, hierarchyFilters, {
                prefix: prefixPath + "edit"
            }),
            function( err, tree ) {
                if( err ) return next( err );
                k.jade.render( req, res, "editor", vals( req, _.extend( { tree: tree }, values ) ) );
            });
        }

        /* create, save and delete files & folders */
        k.router.post("/edit/*", function( req, res, next ) {
            k.postman( req, res, function() {
                var filename = req.params[0];
                var name     = req.postman.text("name");
                var filepath = path.join( filename, name );

                if( req.postman.exists( "create-file" ) ) {
                    /* avoid unauthorized filenames */
                    filepath = k.hierarchy.checkFilename( root(req), filepath, hierarchyFilters );
                    console.log( "Create file:", filepath );
                    if( filepath == null )
                        return k.httpStatus( req, res, 403 );
                    /* write empty file */
                    fs.writeFile( filepath, "", function( err ) {
                        if( err ) return next( err );
                        renderAll( req, res, next );
                    });
                }
                else if( req.postman.exists( "create-dir" ) ) {
                    /* avoid unauthorized filenames */
                    filepath = k.hierarchy.checkDirname( root(req), filepath, hierarchyFilters );
                    console.log( "Create dir:", filepath );
                    if( filepath == null )
                        return k.httpStatus( req, res, 403 );
                    /* create directory: TODO: make mode configurable */
                    fs.mkdir( filepath, function( err ) {
                        renderAll( req, res, next );
                    });
                }
                else if( req.postman.exists( "delete-dir" ) ) {
                    filepath = k.hierarchy.checkDirname( root(req), filepath, hierarchyFilters );
                    rmrf( filepath );
                    renderAll( req, res, next );
                }
                else
                    guardFile( req, res, function( filename, filepath ) {
                        if( req.postman.exists("save") ) {
                            var content = req.postman.raw("content").replace(/\r\n/g, "\n");

                            k.hierarchy.createWriteStream( root(req), filename, { unlockRoot: true } ).end( content );
                            var contentType = path.parse(filename).ext.replace( /^\./, "" );
                            renderAll( req, res, next, { showEditor: true, filename: filename, contentType: contentType, content: content } );
                        }
                        else if( req.postman.exists("delete-file") )
                            fs.unlink( filepath, function( err ) {
                                if( err ) return next( err );
                                renderAll( req, res, next, { messages: [ { type: "success", title: req.locales.__("File deleted"), text: filename } ] } );
                            });
                        else
                            return next( new Error( "Unknown editor-edit method" ) );
                    });
            });

        });

        /* edit file */
        k.router.get("/edit/*", function( req, res, next ) {
            guardFile( req, res, function( filename, filepath ) {
                fs.readFile( filepath, function( err, content ) {
                    var contentType = path.parse(filename).ext.replace( /^\./, "" );
                    renderAll( req, res, next, { showEditor: true, filename: filename, contentType: contentType, content: content.toString() } );
                });
            });
        });

        /* no file selected, just render tree */
        k.router.get( "/", function( req, res, next ) {
            renderAll( req, res, next );
        });
    }
};
