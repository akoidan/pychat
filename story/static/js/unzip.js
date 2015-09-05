// In my demo, this gets attached to a click event.
// it instantiates a ZipFile, and provides a callback that is
// invoked when the zip is read.  This can take a few seconds on a
// large zip file, so it's asynchronous.
var readFile = function(){
    $("#status").html("<br/>");
    var url= $("#urlToLoad").val();
    var doneReading = function(zip){
        extractEntries(zip);
    };

    var zipFile = new ZipFile(url, doneReading);
};


// this function extracts the entries from an instantiated zip
function extractEntries(zip){
    $('report').accordion('destroy');

    // clear
    $("report").html('');

    var extractCb = function(id) {
        // this callback is invoked with the entry name, and entry text
        // in my demo, the text is just injected into an accordion panel.
        return (function(entryName, entryText){
            var content = entryText.replace(new RegExp( "\\n", "g" ), "<br/>");
            $("#"+id).html(content);
            $("#status").append("extract cb, entry(" + entryName + ")  id(" + id + ")<br/>");
            $('report').accordion('destroy');
            $('report').accordion({collapsible:true, active:false});
        });
    }

    // for each entry in the zip, extract it.
    for (var i=0; i<zip.entries.length;  i++) {
        var entry = zip.entries[i];

        var entryInfo = "<h4><a>" + entry.name + "</a></h4>\n<div>";

        // contrive an id for the entry, make it unique
        var randomId = "id-"+ Math.floor((Math.random() * 1000000000));

        entryInfo += "<span class='inputDiv'><h4>Content:</h4><span id='" + randomId +
            "'></span></span></div>\n";

        // insert the info for one entry as the last child within the report div
        $("#report").append(entryInfo);

        // extract asynchronously
        entry.extract(extractCb(randomId));
    }
}