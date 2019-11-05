'use strict';
var http = require('http');
var port = process.env.PORT || 666;

const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
var Table = require('easy-table');
const https = require('https');
const xml2js = require('xml2js');


http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('Hello World\n');
}).listen(port);


const parser = new xml2js.Parser({
    attrkey: "ATTR"
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {

    if (message.content.substring(0, 1) === '!') {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);

        switch (cmd) {
            case 'dkp':
                if (args[0] === undefined) {
                    message.reply("Introduce un comando valido");
                }

                var dkps = await GetDkp(args[0]);
                var name = dkps.playername;
                var wowClass = dkps.class;
                var total = dkps.total;
                var hours = dkps.hours;
                var spent = dkps.spent;
                var net = dkps.net;
                message.reply(`${name}: Class:${wowClass} Dkps Actuales: ${net} Total Dkps: ${total} Dkps Gastados: ${spent} Horas:${hours}`);
                break;
        }
    }
});

client.login(auth.token);

function GetDataFromDkpAzure(character) {
    return new Promise((resolve, reject) => {
        var data = '';
        https.get('https://overdkp.azurewebsites.net/data.xml', function (res) {
            if (res.statusCode >= 200 && res.statusCode < 400) {

                res.on('data', function (data_) {
                    data += data_.toString();
                });

                res.on('end', function () {
                    console.log('data', data);
                    parser.parseString(data, function (err, result) {

                        console.log('FINISHED', err, result);

                        var roster = result['QDKP2EXPORT-DKP']['PLAYER'];

                        if (character !== "all") {
                            var playerResult = roster.forEach((item) => {
                                if (item['ATTR'].playername.toLowerCase() === `${character}-Mandokir`.toLowerCase()) {
                                    console.log(item["ATTR"]);
                                    resolve(item["ATTR"]);
                                }
                            });
                        }
                        resolve(roster);
                    });
                });
            }
        });
    });
}

async function GetDkp(character) {
    try {
        const msg = GetDataFromDkpAzure(character);
        console.log(msg);
        return msg;
    } catch (err) {
        console.log(err);
    }
}