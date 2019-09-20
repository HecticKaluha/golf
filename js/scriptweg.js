//"use strict";
const colors = ['red', 'blue', 'yellow', 'white'];
const klassementColors = {
    'red': 'fireBrick',
    'blue': 'royalBlue',
    'yellow': 'gold',
    'white': 'white',
    'red_ned': 'rode',
    'blue_ned': 'blauwe',
    'yellow_ned': 'gele',
    'white_ned': 'witte'
}

const amountOfScoreButtons = ['1', '2', '3', '4', '5', '6', '7', '8'];
const par = [0, 4, 4, 5, 3, 5, 4, 3, 3, 4, 3, 4, 3, 5, 4, 4, 4, 4, 4];
const holes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const wedstrijd = 2;
var styleId = '';
var txt = "";
var askNoLocc = 0;
var scoreNormal = {
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
    7: {},
    8: {},
    9: {},
    10: {},
    11: {},
    12: {},
    13: {},
    14: {},
    15: {},
    16: {},
    17: {},
    18: {}
};



$(document).ready(function() {
    // $('.birdies').hide();
    // J.log(window.location.href);
    if (J.get('reStart') === 'yes') {
        var delay = 500;
    } else {
        var delay = 3000;
    }
    if (J.get('team')) {
        $("#splash").hide();
    } else {
        $('#app').hide();
        $("#splash").show();
        $("#splash").delay(delay + 500).fadeOut(500);
        setTimeout(function() {
            $('#app').fadeIn(2000);
        }, delay);
    }
    var nu = Date.now();
    if (!J.get(`cookie`) || J.get('cookie') < nu) {
        localStorage.clear();
        //restart();
        J.set('cookie', Date.now() + (6 * 60 * 60 * 1000)); //5*60*60*1000
        J.log('cookie gezet, geldt voor 6 uren');
        // mail sutren
        //}

        txt += "\r\nTotal width/height: " + screen.width + "*" + screen.height + "\r\n";
        txt += "\r\nAvailable width/height: " + screen.availWidth + "*" + screen.availHeight + "\r\n";
        txt += "\r\nColor depth: " + screen.colorDepth + "\r\n";
        txt += "\r\nColor resolution: " + screen.pixelDepth + "\r\n";
        //J.set('txt', txt);
        getLocation();
    }


    if (J.get('team')) {
        generatePage();
    }

    //getLocation();
}); //van onLoad


function prepareSaveHole() {
    Swal.fire({
        title: 'Alles correct?',
        html: 'Afslag van <b>' + J.get('member') + '</b> vanaf de <b>' + klassementColors[J.get('tee')+'_ned'] + '</b> Tee.<br>Score: <b>' + J.get('score') + '</b>',
        showCancelButton: true,
        // confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#3085d6',
        cancelButtonText: 'Herstellen',
        confirmButtonText: 'Opslaan'
    }).then((result) => {
        if (result.value) {
               return true;
         
        } else {
            return false;

        }
    });
} 
}



function loop(obj) {
    for (var key in obj) {
        // skip loop if the property is from prototype
        if (!obj.hasOwnProperty(key)) continue;

        var obj = obj[key];
        for (var prop in obj) {
            // skip loop if the property is from prototype
            if (!obj.hasOwnProperty(prop)) continue;

            // your code
            J.log(prop + " = " + obj[prop]);
        }
    }
}


function noLocc() {
    if (!J.get('noLocc')) {
        J.set('noLocc', 'noLocc');
    }
    if (!J.get('scoreNormal')) {
        J.set('scoreNormal', scoreNormal);
        executeQuery(`insert into nolocc (game,obj) values ( ${J.get('game')}, '')`);
    }
    noLoccVieuw();
    generatePage();
}


function noLoccVieuw() {
    $('.locc').hide();
    $('.strokePlay').show();
}


function backToNormal() {

    $('body').removeClass('yellow');
    //    $('#footer').show();
    $('#birdies').hide();
    $('#app').show();
    //    $('.bh').show();
}

function toBirdies() {
    $('body').addClass('yellow');
    $('#app').hide();
    $('#birdies').show();
}

function validate(val) {
    if (val) {
        J.log(val);
    } else {
        return;
    }
}


function birdies() {
    toBirdies();
    $('#birdieInfo').html('<div class="h5 text-center">Selecteer je team</div>');
    var result = executeQuery(`select * from teams t where t.id IN (select teamId from game where game.game = ${wedstrijd})`);
    //generate buttons voor elk bestaand team in database
    $('#birdieTeams').html('');
    var div = document.createElement('div');
    div.className = `p-0 row`;
    result.forEach(function(team) {

        var div = document.createElement('div');
        div.className = `col-6 p-1`;

        var button = document.createElement('BUTTON');
        button.className = 'btn-large btn-danger col-12 p-1 bigger-text rounded text-wrap text-break';
        // de initialen ophalen van de spelers en in de knop laten zien
        // var result = executeQuery(`select * from teamleden where teamId= ${team.id}`);
        // var initialen = '';
        // result.forEach(function(names) {
        //     initialen += ' ' + names.name;
        // });
        button.innerHTML = team.team; // + '<br>' + initialen
        button.onclick = function() {
            J.set('birdieTeam', team.id);
            birdieMembers();
        }
        div.appendChild(button);
        $('#birdieTeams').append(div);
    });
    restructureBirdies();
}


function birdieMembers() {
    var result = executeQuery(`select * from teamleden where teamId= ${J.get('birdieTeam')}`);
    $('#birdieInfo').html('<div class="h5 text-center">Selecteer jezelf</div>');
    $('#birdieTeams').html('');
    var div = document.createElement('div');
    div.className = `p-0 row`;

    result.forEach(function(team) {
        var div = document.createElement('div');
        div.className = `col-3 p-1`;

        var button = document.createElement('BUTTON');
        button.className = 'btn-large btn-danger col-12 p-1 bigger-text rounded text-wrap text-break';
        button.innerHTML = team.name + '<br>';
        button.onclick = function() {
            J.set('birdieMember', team.id);
            holeKeuze();
        }
        div.appendChild(button);
        $('#birdieTeams').append(div);
    });
}




function holeKeuze() {
    $('#birdieTeams').html('');
    $('#birdieInfo').html('<div class="h5 text-center">Selecteer je birdiehole</div>');
    var div = document.createElement('div');
    div.className = `p-0 row`;

    holes.forEach(function(x) {
        var div = document.createElement('div');
        div.className = `col-3 p-1`;
        var button = document.createElement('BUTTON');
        button.className = 'btn-large btn-danger col-12 p-1 bigger-text rounded';
        button.innerHTML = `H` + x;
        button.onclick = function() {
            localStorage.setItem('birdieHole', x);
            //waarom is x hier steeds 19???
            addBirdie();

        }
        $('#birdieTeams').append(button);
        div.appendChild(button);
        $('#birdieTeams').append(div);


    });
}

function birdieKlassement(member) {
    toBirdies();
    $('#birdieInfo').html('');

    renderTable(executeQuery('SELECT count(hole)  as birdies, teamleden.name as speler, teamleden.id as link FROM `birdies` left join teamleden on birdies.member = teamleden.id group by member'), 'birdieTeams');

    if (member) {
        renderTable(executeQuery(`SELECT hole as H, teamleden.name as Naam, teams.team as Team, birdies.marker as Marker FROM birdies left join teamleden on birdies.member = teamleden.id left join teams on teamleden.teamId = teams.id where birdies.member = ${member} order by hole`), 'birdieTeams'); //, DATE_FORMAT(date, " %d %m %Y") as datum
        $('#birdieTeams').append('<button onClick="birdieKlassement()" class="mb-5 rounded col-12 btn btn-info">Terug</button>');
    }
    //   else {

    //         renderTable(executeQuery('SELECT hole as H, teamleden.name as Naam, teams.team as Team, link as link FROM `birdies` left join teamleden on birdies.member = teamleden.id left join teams on teamleden.teamId = teams.id order by hole'), 'birdieTeams');
    //         // $('#birdieKlassement').delay(10000).toggle(500);
    //     }
}


async function addBirdie() {


    const {
        value: marker
    } = await Swal.fire({
        input: 'textarea',
        type: 'question',
        inputPlaceholder: 'Wie is je marker',
        inputAttributes: {
            'aria-label': 'Wie is je marker?'
        },
        showCancelButton: true
    });


    if (marker) {
        var query = `INSERT INTO birdies (  member , hole, marker, link) VALUES ( ${J.get('birdieMember')},  ${J.get('birdieHole')} , "${marker}", ${J.get('birdieMember')} )`;
        // var query = `INSERT INTO birdies (  member , hole, marker) VALUES ( ${J.get('birdieMember')},  ${J.get('birdieHole')} , "${marker}"  )`;

        J.log(query);
        executeQuery(query);
        Swal.fire({
            title: 'Birdie Opgeslagen!',
            type: 'success',
            showConfirmButton: false,
            timer: 1500,
        });


    }
    $('#birdies').fadeOut(500);
    $('body').removeClass('yellow');

    $('#app').fadeIn(500);
}


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    //txt = J.get('txt');
    txt += "Latitude: " + position.coords.latitude +
        "\nLongitude: " + position.coords.longitude +
        "\nPrecisie: " + position.coords.accuracy + " meter.";
    txt += `\nhttps://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}\n`;
    var url = `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=5d55dc0ff722451b8be8cd19f635c287`;
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            txt += myJson.results[0].components.suburb;
            return txt;
        })
        .then(function(txt) {
            //  alert(txt);
            $.ajax({
                url: 'mail.php',
                type: "post",
                data: {
                    'txt': txt
                },

                success: function(data) {
                    J.log(data);
                }
            });
        });
}


function admin() {
    $('.jeroen').toggle();
}


function firstChoice(play) {

    if (play == 'strokePlay') {
        noLocc();
    }
    if (J.get('firstChoice')) {

    } else {
        J.set('firstChoice', 'made');

    }
    $('.playButton').hide();
    $('.app').show();
    $('.birdies').hide();
    generatePage();
    restructure();

}






function restructure() {
    return;
    $(document).imagesLoaded().done(function() {
        //alert("loaded");
        $('#teams').masonry({
            itemSelector: '.grid-item'
        });
    })
}

function restructureBirdies() {
    //return;
    $(document).imagesLoaded().done(function() {
        //alert("loaded");
        $('.birdieTeams').masonry({
            itemSelector: '.grid-item'
        });
    })
}

function chooseStartHole() {
    Swal.fire({
        title: 'Starthole',
        text: "Op welke hole gaan jullie starten?",
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#3085d6',
        cancelButtonText: 'HOLE 10',
        confirmButtonText: 'HOLE 1'
    }).then((result) => {
        if (result.value) {
            Swal.fire({
                title: "Veel succes, StartHole 1!",
                showConfirmButton: false,
                timer: 1550
            });
            J.set('startHole', 1);
            J.set('stopHole', parseFloat(18));
            renderHole(1);
        } else {
            Swal.fire({
                title: "Veel plezier, StartHole 10!",
                showConfirmButton: false,
                timer: 1550
            });
            J.set('startHole', 10);
            J.set('stopHole', parseFloat(9));
            renderHole(10);
        }
    });
}

async function prepareScore() {


    const {
        value: pw
    } = await Swal.fire({
        title: 'Geef wachtwoord',
        input: 'password',
        inputPlaceholder: 'Geef wachtwoord',
        inputAttributes: {
            maxlength: 10,
            autocapitalize: 'off',
            autocorrect: 'off'
        },
        showCancelButton: true
    });

    if (pw == 'j') {

        executeQuery(`TRUNCATE TABLE scores`);
        var wel = executeQuery(`select teamId from game where game = "2"`);
        //J.log(wel);
        //var wel = Object.keys(wel);
        wel.forEach(function(result) {
            //J.log(result.teamId);
            executeQuery("INSERT INTO scores(`id`, `team`, `hole`, `kleur`, `score`, `datum`, `game`, `startHole`) VALUES (null," + result.teamId + ",0,0,0,0," + result.teamId + ",1)");
        });
    }
}


var J = {
    print: function(data) {
        $('#result').html(data);
    },

    set: function(key, value) {
        if (!key || !value) {
            return;
        }
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        localStorage.setItem(key, value);
    },
    get: function(key) {
        var value = localStorage.getItem(key);
        if (!value) {
            return;
        }
        if (value == null) {
            return false
        }
        // assume it is an object that has been stringified
        if (value[0] === "{") {
            value = JSON.parse(value);
        }
        return value;
    },
    log: function(val) {
        console.log(val);
    },

    objectIterator(obj) {
        var result = [],
            indent = '';

        function getProps(obj, doIndent) {
            var level = 0;
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (obj[property].constructor === Object) {
                        result.push(indent + '#' + property + ': ');
                        // result.push(indent+'+['+property+']: Object'+' (level '
                        //     +((indent.length/12)+1)+')');
                        indent += '&nbsp;&nbsp;'
                        getProps(obj[property], true);
                        indent = '';
                    } else {
                        result.push((doIndent ? (indent || '') : '') + property + ": " +
                            obj[property]);
                    }
                }
            }
        }
        getProps(obj); //tail optimizing
        return result;
    },

}




function plussen(wie) {
    var obj = J.get('obj');
    wie.forEach(function(wie) {
        if (colors.indexOf(wie) > -1) {
            var sectie = 'colors';
            var max = 'colorMax'
        } else {
            sectie = 'members';
            max = 'strokeMax';
        }


        obj[sectie][wie].strokes++;
        if (obj[sectie][wie].strokes == obj[max]) {
            if (colors.indexOf(wie) > -1) {
                obj.cMax++;
            } else {
                obj.sMax++;
            }
        }

        if (obj.sMax == 2) {
            obj.strokeMax = 4;
        }
        if (obj.cMax == 2) {
            obj.colorMax = 4;
        }
    });
    J.log(obj);
    J.set('obj', obj);
} // van functie




function showRules() {
    backToNormal();
    $('#verschil').html('');

    var rules = `<h1>Regelement</h1>
    <ul><li>Speel met een team van 4 personen.</li>
    <li>Van elke speler dient 4x de afslag worden gebruikt.</li>
    <li>Kies voor elke hole de kleur Tee waarmee je het best denkt te scoren, wit, geel, blauw of rood. </li><li>Elke kleur dient minstens 4 keer te worden gebruikt. </li>  <li>Sla alle 4 vanaf af en kies de beste ligging.</li><li>Sla alle 4 vanaf die plaats.</li><li>Ook op de green krijgt iedereen de gelegenheid uit te holen.</li><li>De laatste holed uit.</li> <li>Noteer de TeeKleur, wiens afslag, en de score in de app en sla op.</li><li>Succes!</li> </ul>`;
    $('#results').html(rules);
    setTimeout(function() {
        $('#results').html('');
    }, 20000);
    focus();

}

function showInfo() {
    backToNormal();
    $('#verschil').html('');

    var info = `<h1>Over ons.</h1>
    <p>Wij zijn een groep van 4 golfers op Golfpark De Haenen en namen in 2018 het initiatief tot deze cup.<br>Veel plezier!</p>`;
    $('#results').html(info);
    setTimeout(function() {
        $('#results').html('');
    }, 20000);
    focus();

}

function showNews() {

    backToNormal();
    $('#verschil').html('');

    var news = '<h1>Nieuws</h1>';
    var newsObj = executeQuery(`select * from news order by id desc`);
    newsObj.forEach(function(content) {
        news += `<h4>${content.Titel}</h4>${content.Bericht}<hr>`;
    })
    $('#results').html(news);
    setTimeout(function() {
        $('#results').html('');
    }, 20000);
    focus();

}

function focus() {
    $([document.documentElement, document.body]).animate({
        scrollTop: $(`.focus`).offset().top
    }, 500);
}



function klassement(jaar) {
    $('#loader').show();
    //$('.container').addClass('noScroll');
    setTimeout(function() {
        klassementt(jaar);
    }, 500);
}

function klassementt(jaar) {
    backToNormal();
    //$('.splash').show();

    var datumKeuze = '',
        scoreTabel = '',
        gameSearch = '';
    J.set('jaar', jaar);
    // J.log(jaar);
    switch (jaar) {
        case `2018`:
            scoreTabel = 'scoresCup2018';
            break;
        case `2019`:
            scoreTabel = 'scores';
            break;
        case `datum`:
            scoreTabel = 'scores';
            datumKeuze = `having ( date_format(s.datum,'%Y-%m-%d') between CURDATE() - INTERVAL 7 DAY AND curdate())`;
            break;
        case `today`:
            scoreTabel = 'scores';
            datumKeuze = `having ( date_format(s.datum,'%Y-%m-%d') = CURDATE())`;
            break;
        default:
            scoreTabel = 'scores';
            gameSearch = `where s.game = ${jaar}`;


            // code block
    }
    console.time();
    var trArray = [];
    var team, teamNaam, totaal, score, totaal, bgColor, member, scoreBorder, parKleur, teamRow, objHole;
    executeQuery(`select distinct s.game, s.datum from ${scoreTabel} as s ${gameSearch} group by s.game ${datumKeuze}`).forEach(function(gameResult) {
        //J.log(gameResult);
        objHole = {};
        totaal = 0;
        executeQuery(`select * from ${scoreTabel} as s  left join teams as t on s.team = t.id  where s.game = ${gameResult.game} group by s.hole ${datumKeuze} order by s.hole`) // ${datumKeuze}
            .forEach(function(result) {
                //J.log(result);
                objHole[result.hole] = result;
                teamNaam = result.team;
                team = result.id;
                teamRow = `<tr><td colspan=22 class="text-left teamName ">${teamNaam}</td></tr><tr class="rowHight"><td></td>`;
            });
        for (var H = 1; H < 19; H++) {
            member = '';
            scoreBorder = '';
            //J.log(objHole[H] );
            if (objHole[H] && objHole[H].hole == H) {
                bgColor = klassementColors[objHole[H].kleur];
                score = parseFloat(objHole[H].score);
                totaal += score;
                member = objHole[H].member;
                if (score < par[H]) {
                    scoreBorder = ` class=\"birdie\" `;
                }
                if (score < (par[H] - 1)) {
                    scoreBorder = ` class=\"eagle\" `;
                }
                if (score > par[H]) {
                    scoreBorder = ` class=\"bogey\" `;
                }
                if (score > (par[H] + 1)) {
                    scoreBorder = ` class=\"double\" `;
                }
            } else {
                score = parseFloat(par[H]);
                totaal += score;
                bgColor = 'grey';
            }
            teamRow += `<td  width=4% class="cel" bgcolor=${bgColor}>
            <div ${scoreBorder}> ${score}
            <div class="memberName m-0">${member}</div>
            </div>
            </td>`;
        } // van 1 tot 18   class="cel" bgcolor=${bgColor}
        parKleur = 'marineblue';
        if ((totaal - 70) < 0) {
            parKleur = 'red';
        } else if ((totaal - 70) == 0) {
            parKleur = 'silver';
        }
        teamRow += `<td>${totaal}</td><td bgcolor=${parKleur}>` + (totaal - 70) + `</td></tr>`;
        trArray.push([totaal, teamRow]);
        teamRow = 'resetten die shit';
    });
    renderKlassement(trArray);
    console.timeEnd();
}


function renderKlassement(trArray) {
    trArray.sort(function(a, b) {
        return a[0] - b[0];
    });
    var table = `<h1>klassement</h1>
        <table class="table text-center table-sm  table-responsive-md ">
<tr><th>Pos.</th>`; //class='klassement'
    for (var h = 1; h < 19; h++) {
        table += `<th>H` + h + `<br>${par[h]}</th>`
    }
    table += `<th>2B</th><th>#</th></tr>`;
    var pos = 0;
    var prevTotal = '';
    var posT
    trArray.forEach(function(row) {
        var posT = '';
        //pos++;
        if (row[0] != prevTotal) {
            pos++;
            prevTotal = row[0];
        } else {
            posT = "*";
        }
        var tableRow = row[1];
        tableRow = tableRow.replace("<tr>", "<tr><td>" + pos + posT + "</td>");
        table += tableRow;
    });
    table += "</table>";
    $("#results").html(table);
    $('#loader').hide();

    focus();

    var pad = window.location.pathname;
// alert(pad.substr(pad.length - 9));
    if (pad.substr(pad.length - 9) == "locc.html") {
        J.log('reload!!');
        setTimeout(function() {

            klassement(J.get('jaar'));
        }, 3000); //6000
    }
}



function generatePage() {



    //teamSet zoekt automatisch in de DOM naar een element met id="teamSet"
    teamSet.style.display = noTeamSet.style.display = 'none';
    $('.teamSet').hide();
    $('.noTeamSet').hide();

    if (J.get('team')) {
        showTeamSet();
    } else {
        showNoTeamSet();
    }
    J.set('member', `-`);
    var hole = J.get('hole');
    showHole(hole);

    if (J.get('noLocc')) {
        noLoccVieuw();
    }
}

function getNextTeamGame(team) {
 //   var teamGame = executeQuery(`SELECT max(game) as maxGame FROM games `); //WHERE team = ` + team
 //   var nextTeamGame = parseFloat(teamGame[0]['maxGame']) + 1;
 var now = Date.now();
 J.log(now);
    executeQuery(`insert into games (game) values ( ${now} )`);
    J.set('game', `${now}`);
}

function deleteEmptyGame(team) {
    executeQuery(`delete from scores where team = ${team} and datum = "0000-00-00 00:00:00"`);
}

function getNextTeamGame_nietgoed(team) {
    var teamGame = executeQuery(`SELECT max(game) as maxGame, COUNT(id) as countHoles FROM scores where team = ${team} and scores.game IN (select max(game) from scores where team = ${team})`);
    //J.log(teamGame);
    if (parseFloat(teamGame[0].countHoles) === 1) {
        var nextTeamGame = parseFloat(teamGame[0]['maxGame']);
    } else {

        var nextTeamGame = parseFloat(teamGame[0]['maxGame']) + 1;
    }
    J.set('game', nextTeamGame);
}

function showNoTeamSet() {
    backToNormal();
    $('#results').html('');
    $('body').removeClass('yellow');

    noTeamSet.style.display = 'block';
    teamSet.style.display = 'none';
    var result = executeQuery(`select * from teams t where t.id IN (select teamId from game where game.game = ${wedstrijd})`);
    //generate buttons voor elk bestaand team in database
    teams.innerHTML = '';
    result.forEach(function(team) {
        var div = document.createElement('div');
        div.className = `col-6 col-md-4 col-lg-3 p-1 grid-item`;
        var button = document.createElement('BUTTON');
        button.className = 'btn-large btn-light col-12 p-2 bigger-text rounded text-wrap text-break';
        // de initialen ophalen van de spelers en in de knop laten zien
        // var result = executeQuery(`select * from teamleden where teamId= ${team.id}`);
        var initialen = '';
        //  result.forEach(function(names) {
        //     initialen += ' ' + names.name;
        // });
        button.innerHTML = team.team + '<br>' + initialen;
        // JSON.parse(J.get('team-' + team.id)).forEach(function(names) {
        //     button.innerHTML += names['name'] + '.';
        // });
        button.onclick = function() {
            J.set('team', team.id);
            var teamObj = {};
            var obj = {};
            obj.members = {};
            obj.colors = {};
            var result = (executeQuery(`select name from teamleden where teamId = ${team['id']}`));
            //J.log(result);
            result.forEach(function(result) {
                obj.members[result.name] = {
                    "strokes": 0
                };
            });
            colors.forEach(function(color) {
                obj.colors[color] = {
                    "strokes": 0
                };
            });
            obj.colorMax = 5; // was 5
            obj.strokeMax = 5;
            obj.sMax = 0;
            obj.cMax = 0;

            //J.log(obj);
            J.set('obj', obj);
            showTeamSet();

        }
        div.appendChild(button);
        teams.appendChild(div);
    });
    restructure();
}

function showTeamSet() {

    backToNormal();
    //$('#results').html('');

    $('.playButton').hide();
    var obj = J.get('obj');
    if (!J.get('startHole')) {
        chooseStartHole();
    }
    if (!J.get('game')) {
        getNextTeamGame();
    }

    if (askNoLocc === 1) {


        if (!J.get('noLocc')) {
            Swal.fire({
                title: 'Spelvorm',
                text: "Welke spelvorm?",
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#3085d6',
                cancelButtonText: 'StrokePlay',
                confirmButtonText: 'LOCC'
            }).then((result) => {
                if (result.value) {
                    J.set('noLocc', 'noLocc');
                } else {

                    J.set('noLocc', 'strokePlay');
                    if (!J.get('scoreNormal')) {
                        J.set('scoreNormal', scoreNormal);
                        executeQuery(`insert into nolocc (game,obj) values ( ${J.get('game')}, '')`);
                    }
                    noLoccVieuw();
                }

            });
        }
    }

    //$('.navbar').hide();
    noTeamSet.style.display = 'none';
    teamSet.style.display = 'block';
    //playing.style.display = 'block';
    teeButtons.innerHTML = '';
    colors.forEach(function(color) {
        var div = document.createElement('div');
        div.className = 'p-1 col-3';
        var button = document.createElement('BUTTON');
        button.className = 'btn-large col-12 border text-secondary big-text p-1 rounded shadow';
        button.innerHTML = obj.colors[color].strokes + 'x';
        button.style.backgroundColor = klassementColors[color];
        button.onclick = function() {
            $('#teeButtons').removeClass('red');

            setTee(color);
            if (obj.colors[color].strokes >= obj.colorMax) {
                Swal.fire({
                    title: 'Helaas!',
                    text: "Je hebt het maximale aantal afslagen voor deze tee bereikt, kies een andere tee",
                    type: 'warning',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Ik snap het...'
                })
            }
        };
        div.appendChild(button);
        teeButtons.appendChild(div);
    });
    scoreButtons.innerHTML = '';
    amountOfScoreButtons.forEach(function(score) {
        var div = document.createElement('div');
        div.className = 'p-1 m-0 col-3 grid-item';
        var button = document.createElement('BUTTON');
        button.className = 'btn-large btn-light col-12 border p-3 p-sm-4 p-lg-5 bigger-text rounded';
        button.innerHTML = score;
        button.onclick = function() {
            $('#scoreButtons').removeClass('red');

            setScore(score);
        };
        div.appendChild(button);
        scoreButtons.appendChild(div);
    });
    nameButtons.innerHTML = '';
    obj = J.get('obj');
    for (let [key, value] of Object.entries(obj.members)) {
        var div = document.createElement('div');
        div.className = `p-1 m-0 col-3 grid-item`;
        var button = document.createElement('BUTTON');
        button.className = `btn-large btn-dark col-12 border p-2 p-sm-2 p-lg-2 big-text rounded  ${key}`;
        button.innerHTML = key + ` `;
        if (!J.get('noLocc')) {
            button.innerHTML += value.strokes + 'x';

        }
        button.onclick = function() {
            $('#nameButtons').removeClass('red');

            if (!J.get('noLocc') && value.strokes >= obj.strokeMax) {
                Swal.fire({
                    title: 'Helaas!',
                    text: "Deze speler heeft geen afslagen meer, kies een ander",
                    type: 'warning',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Ik snap het...'
                })
            } else {
                J.set('member', key);
                colorCheck.innerText = key;
            }
            if (J.get('noLocc')) {
                (async function score() {
                    const {
                        value: score
                    } = await Swal.fire({
                        title: 'aantal slagen',
                        input: 'range',
                        inputAttributes: {
                            min: 1,
                            max: 8,
                            step: 1
                        },
                        inputValue: 4
                    });
                    $(`.${key}`).append(' ' + score);
                    scoreNormal = J.get('scoreNormal');

                    scoreNormal[J.get('hole')][`${key}`] = score;
                    J.set('scoreNormal', scoreNormal);
                })();
            }
        };
        div.appendChild(button);
        nameButtons.appendChild(div);
    };
    checkContainer.style.backgroundImage = "linear-gradient(#A0CABB,#A0CABB)";
}


function setTee(color) {
    J.set('tee', color);
    checkContainer.style.backgroundImage = "linear-gradient(#A0CABB," + klassementColors[color] + ")";
}


function setScore(score) {
    J.set('score', score);
    scoreCheck.innerText = score;
}

function saveHole() {
    var warnText = 'Je hebt ';
    if (!J.get('tee')) {
        $('#teeButtons').addClass('red');
        warnText += 'Teekleur, ';
    } else {
        $('#teeButtons').removeClass('red');
    }

    if (!J.get('score')) {
        $('#scoreButtons').addClass('red');
        warnText += 'Score, ';
    } else {
        $('#scoreButtons').removeClass('red');
    }

    if (J.get('member') == '-') {
        $('#nameButtons').addClass('red');
        warnText += 'Afslag, ';
    } else {
        $('#nameButtons').removeClass('red');
    }





    //if (J.get('tee') && J.get('score') && J.get('member') !== `-`) {
    if (warnText.length < 9) {
if (prepareSaveHole()){

        $.ajax({
            url: "db_write.php?method=saveScore",
            data: {
                team: J.get('team'),
                hole: J.get('hole'),
                tee: J.get('tee'),
                score: J.get('score'),
                game: J.get('game'),
                startHole: J.get('startHole'),
                member: J.get('member')
            },
            type: "post",
            success: function(res) {
                var response = JSON.parse(res);
                if (response.success) {
                    //je response message is beschikbaar vie response.message
                    //J.log(response.message);
                    Swal.fire({
                        title: 'Opgeslagen!',
                        type: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    plussen([J.get('member'), J.get('tee')]);
                    J.set('member', `-`);
                    if (J.get('holePlayed') !== "yes") {
                        deleteEmptyGame(J.get('team'));
                    }
                    J.set('holePlayed', 'yes');
                    renderTable(getTeamScore(), 'results');
                    //getTeamScoreNew();
                    nextHole();
                } else {
                    //show error
                    Swal.fire({
                        type: 'error',
                        title: 'Oops...',
                        text: response.message,
                    });
                }
            },
            fail: function() {
                J.log('dat is niet gelukt!')
            }
        });
}
    } else {
        Swal.fire({
            title: 'OOPS',
            text: warnText + ' niet ingevuld!',
            type: 'warning',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ik begrijp het, sorry...'
        })
    }

}

function nextHole() {
    var hole = parseFloat(J.get('hole'));

    if (J.get('noLocc')) {
        //J.loop(J.get('scoreNormal'), 'results');
        $('#results').html(J.objectIterator(J.get('scoreNormal')).join('<br />'));
        $('#results').append(J.objectIterator(J.get('obj').members).join('<br />'));


        // var query = `update nolocc set  obj = '${JSON.stringify(J.get('scoreNormal'))}'   where game = ${J.get('game')}`;
        // J.log(query);
        //  executeQuery(query);
        //  var filtered = J.filter(J.get('scoreNormal'), member => member == 'JV');
        //  J.log(filtered);
        var obj = J.get('obj');
        //J.log(obj);
        var holeScore = J.get('scoreNormal')[hole];
        J.log(holeScore);
        for (let [key, value] of Object.entries(holeScore)) {
            obj.members[key].strokes += parseFloat(value);

        }
        J.set('obj', obj);
    }

    hole++;
    J.set('hole', hole);
    showTeamSet();
    showHole(hole);

}




function showHole(hole) {
    //if not set set to 0
    //J.log(hole);
    if (!hole) {
        hole = 1;
    }
    var stopHole = parseFloat(J.get('stopHole'));
    J.log(hole);
    if (J.get('startHole') == 10 && hole == parseFloat(stopHole) + 1 && J.get('holePlayed')) {
        finishGame();
    }
    if (J.get('startHole') == 1 && hole == parseFloat(stopHole) + 1) {
        finishGame();
    }
    if (J.get('startHole') == 10 && hole == 19) {
        hole = 1;
    }
    renderHole(hole);
}

function renderHole(hole) {
    localStorage.removeItem('score');
    localStorage.removeItem('tee');
    J.set('hole', hole);
    colorCheck.innerText = "XX";
    scoreCheck.innerText = "XX";
    holeCheck.innerText = hole;
    var saldo = J.get('saldo');
    if (saldo == 0 || saldo == null) {
        saldo = 'par';
    }
    $('#saldo').html(saldo);
}

function executeQuery(query) {
    //J.log(query);
    var result = [];
    $.ajax({
        url: "db_write.php?method=executeQuery",
        type: "post",
        async: false,
        data: {
            query: query,
        },
        success: function(res) {
            var response = JSON.parse(res);
            J.log(response);

            if (response.success) {
                //je response message (result van de query) is beschikbaar via response.message
                result = response.message;
            } else {
                //show error
                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: response.message,
                });
            }
        },
        fail: function() {
            J.log('dat is niet gelukt!')
        }
    });
    //J.log(result);
    return result;
}



function renderTable(jsonResult, renderName) {
    var keyNot = ['id', 'game', 'team'];
    var divToRenderIn = null;
    if (!renderName) {
        divToRenderIn = results;
    } else {
        if (document.getElementById(renderName)) {
            divToRenderIn = document.getElementById(renderName);
        } else {
            divToRenderIn = document.createElement('div');
            divToRenderIn.id = renderName;
            results.append(divToRenderIn);
        }
    }
    divToRenderIn.innerHTML = `<table class="table table-bordered table-striped">
    <thead>
    <tr role="row" id="${renderName}-thead">
    </tr>
    </thead>
    <tbody id="${renderName}-tbody">
    <tbody/>
    </table>`;
    //loop over alle rows
    jsonResult.forEach(function(row, index) {
        var tableRow = document.createElement('tr');
        tableRow.className = 'text-wrap';
        //loop over alle columns van de row
        for (let [key, value] of Object.entries(row)) {
            if (keyNot.indexOf(key) > -1) continue;
            //genereren van alle headers (alleen eerste iteratie)
            if (index === 0) {
                var theader = document.createElement('td');
                theader.innerText = key;
                theader.className = 'text-wrap';
                document.getElementById(`${renderName}-thead`).appendChild(theader);
            }
            //genereren van alle data die per rij beschikbaar is
            var scoreRowData = document.createElement('td');
            scoreRowData.className = 'text-wrap';
            scoreRowData.innerText = value;
            if (key === 'kleur') {
                scoreRowData.style.backgroundColor = value;
            }
            if (key === 'link') {
                scoreRowData.innerHTML = `<button class='btn btn-light' onClick='birdieKlassement(${value});'>Alle</button>`;
            }

            tableRow.appendChild(scoreRowData);
        }
        document.getElementById(`${renderName}-tbody`).appendChild(tableRow);
    });

}

function finishGame() {
    results.innerHTML = '';
    renderTable(getTeamScore(), 'teamScore');
    $('#teamSet').hide();
    message.innerHTML = `Ronde volbracht, hieronder de resultaten.`;
    $('#finished').show();
}

async function pwRestart() {

    const {
        value: pw
    } = await Swal.fire({
        title: 'Geef wachtwoord',
        input: 'password',
        inputPlaceholder: 'Geef wachtwoord',
        inputAttributes: {
            maxlength: 10,
            autocapitalize: 'off',
            autocorrect: 'off'
        },
        showCancelButton: true
    });

    if (pw == 'j') {
        restart();
    }
}

function restart() {
    localStorage.clear();
    J.set('reStart', 'yes');
    location.reload();
}

function getTeamScore() {
    var query = `SELECT s.hole,s.game,s.kleur,s.score, s.score - h.par as verschil,s.team as team FROM scores as s left join holes as h on h.hole=s.hole group by s.id having s.game =  ${J.get('game')} `; //  and team = ${J.get('team')}
    var verschil = 0;
    var obj = executeQuery(query);
    J.log(query);
    J.log(obj);
    obj.forEach(function(result) {
        verschil += result.verschil;
        //J.log(verschil);
    });
    if (verschil > 0) {
        verschil = '+' + verschil;
    }
    J.set('saldo', verschil);
    $('#verschil').html("<h3>TotaalScore naar PAR </hr>" + verschil);
    return executeQuery(query);
}

// function getTeamScoreNew() {
//     //var query = `SELECT s.hole,s.game,s.kleur,s.score, s.score - h.par as verschil,s.team as team FROM scores as s left join holes as h on h.hole=s.hole group by s.id having s.game =  ${J.get('game')} and team = ${J.get('team')}`;
//     //return executeQuery(query);
//     klassement(J.get('game'));
// }