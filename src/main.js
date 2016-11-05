var inquirer = require('inquirer');
var entity = require('./core/Entity');
var formatter = require('./core/OutputFormatter');
var userInput = require('./core/UserInputParser');


function fetchTorrents(name) {
    var torrents = []
    for (var i = 0; i < 5; i++) {
        torrents.push(new entity.Torrent({
            name: 'torrent [YIFI]' + i,
            size: '10 Mib',
            seeders: 123,
            leechers: 123,
            magnetLink: 'magnet-' + i
        }))
    }
    return Promise.resolve(torrents)
}


function fetchSubtitles(name, language) {
    var subtitles = []
    for (var i = 0; i < 5; i++) {
        subtitles.push({
            movieName: 'subtitle ' + i,
            subtitleName: 'subtitle_' + i + '.srt',
        })
    }
    return Promise.resolve(subtitles)
}

function downloadSubtitle(subtitle, destination) {
    //new HttpDownloadGateway().download(choosedSubtitle.downloadLink, '.')
    //    .then(downloadedFile => {
    //        return new UncompressionGatewayNode().uncompress(downloadedFile, './' + choosedSubtitle.subtitleName)
    //    })
    //    .then(uncompressedSubtitle => {
    //
    //    })
    return Promise.resolve('/tmp/subtitle.srt')
}

function askForChoice(torrents, subtitles) {
    return Promise.all([inquirer.prompt([
        {
            type: 'input',
            name: 'choice',
            message: 'Which one to stream?',
            default: '0.0',
            validate: answer => {
                return userInput.validateChoice(answer, torrents.length, subtitles.length) || "Invalid choice."
            },
        }
    ]), torrents, subtitles]);
}

function startStreaming(torrent, subtitle) {
    console.log(`peerflix "${torrent.magnetLink}" --vlc --subtitles ${subtitle}"`)
}

formatter.clearTerminal()
inquirer.prompt([
        {
            type: 'input',
            name: 'query',
            message: 'Which torrent are you looking for?',
            default: '',
            validate: (answer) => {
                return true
            }
        },
        {
            type: 'input',
            name: 'language',
            default: 'pob',
            message: 'Which language for the subtitle?',
            validate: (answer) => {
                return true
            }
        }
    ])
    .then(answers => {
        return Promise.all([
            fetchTorrents(answers.query),
            fetchSubtitles(answers.query, answers.language)
        ])
    })
    .then(([torrents, subtitles]) => {
        formatter.displayOptions(torrents, subtitles)
        return askForChoice(torrents, subtitles)
    })
    .then(function ([answer, torrents, subtitles]) {
        let [choosedTorrentIndex, choosedSubtitleIndex] = answer.choice.split('.')
        let choosedTorrent = torrents[choosedTorrentIndex]
        let choosedSubtitle = subtitles[choosedSubtitleIndex]
        return Promise.all([choosedTorrent, downloadSubtitle(choosedSubtitle, '.')])
    })
    .then(function ([torrent, subtitle]) {
        startStreaming(torrent, subtitle)
    })
    .catch(error => console.log(error))
