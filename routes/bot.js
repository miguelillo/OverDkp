'use strict';
var http = require('http');

const Discord = require('discord.js');
const client = new Discord.Client();
var {
    hunter,
    mage,
    warrior,
    priest,
    rogue,
    warlock,
    druid,
    shaman
} = require('./wowclass.json');

const {
    prefix,
    token
} = require('./auth.json');
var Table = require('easy-table');
const https = require('https');
const xml2js = require('xml2js');

const sort_by = (field, reverse, primer) => {

    const key = primer ?
        function (x) {
            return primer(x[field])
        } :
        function (x) {
            return x[field]
        };

    reverse = !reverse ? 1 : -1;

    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
}

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
                resetWowClass();
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
                    dkpsAll.forEach(function (dkpCharacter) {
                        savePlayerByClass(dkpCharacter["ATTR"]);
                    });
                    sendEmbed(message);
                }
                break;
        }
    }
});

client.login(token);

function resetWowClass() {
    hunter.players = [];
    mage.players = [];
    warrior.players = [];
    priest.players = [];
    rogue.players = [];
    warlock.players = [];
    druid.players = [];
    shaman.players = [];
}

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

function getList(list) {
    var result = '';
    var index = 1;
    list = list.sort(sort_by('net', true, parseInt));

    list.forEach((player) => {
        var playerName = player.name.split('-')[0];
        if (player.rank != "Alter" && parseInt(player.net) != 0) {
            result += `${index}. ${playerName} | ${player.net}\n`;
            index++;
        }
    })
    return result;
}

function sendEmbed(message) {
    message.channel.send({
        embed: {
            color: 3447003,
            title: "Over DKP List:",
            fields: [{
                    name: `${hunter.icon} ${hunter.displayName} ${hunter.icon}`,
                    value: getList(hunter.players),
                    inline: true
                },
                {
                    name: `${mage.icon} ${mage.displayName} ${mage.icon}`,
                    value: getList(mage.players),
                    inline: true
                },
                {
                    name: `${warrior.icon} ${warrior.displayName} ${warrior.icon}`,
                    value: getList(warrior.players),
                    inline: true
                },
                {
                    name: `${priest.icon} ${priest.displayName} ${priest.icon}`,
                    value: getList(priest.players),
                    inline: true
                },
                {
                    name: `${rogue.icon} ${rogue.displayName} ${rogue.icon}`,
                    value: getList(rogue.players),
                    inline: true
                },
                {
                    name: `${warlock.icon} ${warlock.displayName} ${warlock.icon}`,
                    value: getList(warlock.players),
                    inline: true
                },
                {
                    name: `${druid.icon} ${druid.displayName} ${druid.icon}`,
                    value: getList(druid.players),
                    inline: true
                },
                {
                    name: `${shaman.icon} ${shaman.displayName} ${shaman.icon}`,
                    value: getList(shaman.players),
                    inline: true
                },
            ],
            timestamp: new Date()
        }
    });
}

function savePlayerByClass(player) {
    switch (player.class.toLowerCase()) {
        case 'hunter':
            hunter.players.push({
                "name": player.playername,
                "net": player.net,
                "rank": player.rank
            })
            break;
        case 'mage':
            mage.players.push({
                "name": player.playername,
                "net": player.net,
                "rank": player.rank
            })
            break;
        case 'warrior':
            warrior.players.push({
                "name": player.playername,
                "net": player.net,
                "rank": player.rank
            })
            break;
        case 'priest':
            priest.players.push({
                "name": player.playername,
                "net": player.net,
                "rank": player.rank
            })
            break;
        case 'rogue':
            rogue.players.push({
                "name": player.playername,
                "net": player.net,
                "rank": player.rank
            })
            break;
        case 'warlock':
            warlock.players.push({
                "name": player.playername,
                "net": player.net,
                "rank": player.rank
            })
            break;
        case 'druid':
            druid.players.push({
                "name": player.playername,
                "net": player.net,
                "rank": player.rank
            })
            break;
        case 'shaman':
            shaman.players.push({
                "name": player.playername,
                "net": player.net,
                "rank": player.rank
            })
            break;
    }
}