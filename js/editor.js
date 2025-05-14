/* Edit a real file on the webserver */
/* (c)copyright 2017, 2020 by Gerald Wodni<gerald.wodni@gmail.com> */
document.addEventListener("DOMContentLoaded", function(){
    var $sourceTextarea = document.getElementById('editor-textarea');
    var $saveButton = document.querySelector(".editorWrapper form button[name='save']");
    //var height = $(window).height() - 200;
    var height = 100;
    //$sourceTextarea.insertAdjacentHTML('afterend', `<div id="editor" class="form-control" style="width: 300px;height:' + height + 'px"> </div>'`);
    $sourceTextarea.insertAdjacentHTML('afterend', `<div id="editor" style=""> </div>`);
    $sourceTextarea.style.display = "none";
    //document.getElementById("editor").style.display="none";

    var modes = {
        jade:   "jade",
        html:   "html",
        js:     "javascript",
        json:   "json",
        less:   "less",
        css:    "css",
        md:     "markdown",
        "4th":  "forth",
        fth:    "forth",
        fs:     "forth"
    };
    var mode = $sourceTextarea.getAttribute("data-type");
    console.log("MODE:", mode );

    var editor = ace.edit("editor");
    if( mode in modes )
        editor.getSession().setMode("ace/mode/" + modes[mode]);
    else
        editor.getSession().setMode("ace/mode/plain_text");
    editor.getSession().setTabSize(4);
    editor.getSession().setUseSoftTabs(true);
    editor.getSession().setUseWrapMode(true);
    editor.setTheme("ace/theme/github");

    editor.getSession().setValue($sourceTextarea.value);
    editor.getSession().on("change", function() {
        $sourceTextarea.value = editor.getSession().getValue();
    });

    editor.commands.addCommand({
        name: "save",
        bindKey: { win: "Ctrl-S", mac: "Command-S" },
        exec: async function( editor ) {
            post( location.pathname, {
                save: "yes",
                content: $sourceTextarea.value,
            }, {
                headers: {
                    "Accept": "application/json",
                }
            })
            .then( res => res.json() )
            .then( res => {
                if( res.success ) {
                    $saveButton.classList.add("success");
                    window.setTimeout( () => $saveButton.classList.remove("success"), 400 );
                }
            });

        },
    });
});

function post( url, data, opts = {} ) {
    var body = ""; var separator = "";
    Object.keys( data ).forEach( key => {
        body += separator + encodeURIComponent(key) + "=" + encodeURIComponent( data[key] );
        separator = "&";
    });

    return fetch( url, {
        method: "POST",
        headers: Object.assign( {
            "Content-Type": "application/x-www-form-urlencoded",
        }, opts.headers || {} ),
        body
    })
}
