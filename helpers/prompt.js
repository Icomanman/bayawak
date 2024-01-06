
function prompt(question, callback) {

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let response = null;

    rl.setPrompt(question);
    rl.prompt();

    rl.on('line', input => {
        response = input;
        rl.close();
    });

    rl.on('close', () => {
        if (response.match(/\s/)) return callback(response.split(' '));
        else return callback(response);
    });
}

module.exports = prompt;