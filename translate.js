// https://github.com/marak/translate.js/

// var sys = require('sys');
var translate = require('./lib/translate');

let text = "鋼の錬金術師"

// var input = 'Japanese', output = "English";
// // sys.puts(text.yellow + ' => '.cyan + text2.blue);
// translate.text({input:input,output:output}, text, function(err, text){

// });

translate.text('I want tacos please.', function(err, text){});