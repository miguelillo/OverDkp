'use strict';
var port = process.env.PORT || 666;

const Discord = require('discord.js');
const client = new Discord.Client();
const rich = new Discord.RichEmbed();
var Table = require('easy-table');
const https = require('https');
const xml2js = require('xml2js');
const {
    prefix,
    token
} = require('./auth.json');

const parser = new xml2js.Parser({
    attrkey: "ATTR"
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {

    if (message.content.substring(0, 1) === prefix) {
        var args = message.content.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);

        switch (cmd) {
            case 'dkp':
                if (args[0] === undefined) {
                    message.reply("Introduce un comando valido");
                }

                console.log(message.member.user.username, message.member.user.discriminator);

                if (message.member.user.username.toLocaleLowerCase() === 'moxo' && parseInt(message.member.user.discriminator) === 5478) {
                    message.reply("panete", {
                        files: ['https://thumb-p3.xhcdn.com/a/XQrKgHT7b2ZMrSS1i7dIhw/000/331/794/313_1000.gif']
                    })
                } else {
                    if (args[0] !== "all") {
                        var dkps = await GetDkp(args[0]);
                        var name = dkps.playername;
                        var wowClass = dkps.class;
                        var rank = dkps.rank;
                        var total = dkps.total;
                        var hours = dkps.hours;
                        var spent = dkps.spent;
                        var net = dkps.net;
                        message.reply(`${name}: Class:${wowClass} Dkps Actuales: ${net} Total Dkps: ${total} Dkps Gastados: ${spent} Horas:${hours}`);
                    } else {
                        var t = new Table;
                        var dkpsAll = await GetDkp(args[0]);

                        var playerList = '';
                        var dkpList = '';
                        var dkpTotalList = '';
                        var classList = '';

                        dkpsAll.forEach(function (dkpCharacter) {

                            var parsedResult = dkpCharacter["ATTR"];
                            var name = parsedResult.playername;
                            var wowClass = parsedResult.class;
                            var rank = parsedResult.rank;
                            var total = parsedResult.total;
                            var hours = parsedResult.hours;
                            var spent = parsedResult.spent;
                            var net = parsedResult.net;

                            if (parseInt(net) != 0) {
                                playerList += `${name}\n`;
                                dkpList += `${net}\n`;
                                dkpTotalList += `${total}\n`;
                                classList += `${wowClass}\n`;
                            }

                        });

                        sendEmbed(message, playerList, dkpList, dkpTotalList, classList);
                    }
                }
                break;
        }


    }
});

client.login(token);

function GetDataFromDkpAzure(character) {
    return new Promise((resolve, reject) => {
        var data = '';
        https.get('https://overdkp.azurewebsites.net/data/data.xml', function (res) {
            if (res.statusCode >= 200 && res.statusCode < 400) {

                res.on('data', function (data_) {
                    data += data_.toString();
                });

                res.on('end', function () {
                    parser.parseString(data, function (err, result) {
                        var roster = result['QDKP2EXPORT-DKP']['PLAYER'];
                        roster.sort((a, b) => a['ATTR'].playername.localeCompare(b['ATTR'].playername));
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

function sendEmbed(message, playerList, dkpList, dkpTotalList, classList) {
    message.channel.send({
        embed: {
            color: 3447003,
            title: "Over DKP List:",
            fields: [{
                    name: "Player",
                    value: playerList,
                    inline: true
                },
                {
                    name: "Class",
                    value: classList,
                    inline: true
                },
                {
                    name: "Dkp (Net)",
                    value: dkpList,
                    inline: true
                }
            ],
            timestamp: new Date()
        }
    });

}