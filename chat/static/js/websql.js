function getDb(cb) {
    var db = openDatabase('fasdv', '', 'Messages database', 10 * 1024 * 1024);
    if (db.version == '') {
        db.changeVersion(db.version, '1.0', function(t) {
            t.executeSql('CREATE TABLE message (id, time, content, symbol, deleted, giphy, edited_times, room_id, sender_id)');
            t.executeSql('CREATE TABLE image (id, symbol, img, message_id, type);', [], function(t, s) {
                cb(db);
            });
        }, function(error) {

        });
    } else if (db.version == '1.0') {
        cb(db);
    }
}

getDb(function(db) {
    db.readTransaction(function(t) {
        t.executeSql('insert into message (id, time, content, symbol, deleted, giphy, edited_times, room_id, sender_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [1,2,3,4,5,6,7,8,9], function(t, d) {
            console.log('asd');
        })
    }, function (e) {
        console.log(e);
    })
});
