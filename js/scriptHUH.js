const colors = ['red', 'blue', 'yellow', 'white'];
const amountOfScoreButtons = ['1', '2', '3', '4', '5', '6', '7', '8'];
const par = [0, 4, 4, 5, 3, 5, 4, 3, 3, 4, 3, 4, 3, 5, 4, 4, 4, 4, 4];
const wedstrijd = 2;
var styleId = '';

$(document).ready(function() {
    J.log(window.location.href);
    if (J.get('team')) {
        $(".splash").hide();
    } else {
        $(".splash").show();
        $(".li-1").hide().slideDown(500);
        $(".li-2").hide().slideDown(800);
        $(".li-3").hide().slideDown(1100);
        $(".splash").delay(2500).fadeOut();
    }
    var nu = Date.now();
    if (!J.get(`cookie`) || J.get('cookie') < nu) {
        localStorage.clear();
        restart();
        J.set('cookie', Date.now() + (6 * 60 * 60 * 1000)); //5*60*60*1000
        J.log('cookie gezet, geldt voor 6 uren');
    }

    generatePage();
   // klassement('2019');

/*
(function test(){
    console.time();
    for (i=0 ; i<100 ; i++){
        showNoTeamSet();
    }

    console.timeEnd();

 })();
  */


});




function restructure() {
    //return;
    $(document).imagesLoaded().done(function() {
        //alert("loaded");
        $('#teams').masonry({
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
                type: 'info',
                showConformButton: false,
                timer: 1550
            });
            J.set('startHole', 1);
            J.set('stopHole', parseFloat(18));
            renderHole(1);
        } else {
            Swal.fire({
                title: "Veel plezier, StartHole 10!",
                type: 'info',
                showConfirmButton: false,
                timer: 1550
            });
            J.set('startHole', 10);
            J.set('stopHole', parseFloat(9));
            renderHole(10);
        }
    });
}

function prepareScore() {
    executeQuery(`TRUNCATE TABLE scores`);
    var wel = executeQuery(`select teamId from game where game = "2"`);
    J.log(wel);
    //var wel = Object.keys(wel);
    wel.forEach(function(result){
        J.log(result.teamId);
        executeQuery("INSERT INTO scores(`id`, `team`, `hole`, `kleur`, `score`, `datum`, `game`, `startHole`) VALUES (null," + result.teamId + ",0,0,0,0," + result.teamId + ",1)");
    });
}

var J = {
    get: function(cookie) {
        return localStorage.getItem(cookie);
    },
    set: function(cookie, value) {
        localStorage.setItem(cookie, value);
    },
    log: function(val) {
        console.log(val);
    }
}

function showRules() {
    var rules = `<h1>Regelement</h1>
  <ul><li>Speel met een team van 4 personen.</li>
  <li>Van elke speler dient 4x de afslag worden gebruikt.</li>
  <li>Kies voor elke hole de kleur Tee waarmee je het best denkt te scoren, wit, geel, blauw of rood. </li><li>Elke kleur dient minstens 4 keer te worden gebruikt. </li>  <li>Sla alle 4 vanaf af en kies de beste ligging.</li><li>Sla alle 4 vanaf die plaats.</li><li>Ook op de green krijgt iedereen de gelegenheid uit te holen.</li><li>De laatste holed uit.</li> <li>Noteer de TeeKleur, wiens afslag, en de score in de app en sla op.</li><li>Succes!</li> </ul>`;
    $('#results').html(rules);
    focus();
}

function showNews() {
    var news = '<h1>Nieuws</h1>';
    var newsObj = executeQuery(`select * from news order by id desc`);
    newsObj.forEach(function(content) {
        news += `<h4>${content.Titel}</h4>${content.Bericht}<hr>`;
    })
    $('#results').html(news);
    focus();
}

function focus() {
    $([document.documentElement, document.body]).animate({
        scrollTop: $(`.focus`).offset().top
    }, 2000);
}


function getTeamMembers(team) {
  if (localStorage.getItem('team')) {
    return (executeQuery(`select name from teamleden where teamId= ${localStorage.getItem('team')}`));
  }
}

function setMemberCount(memberObj) {
    JSON.parse(memberObj).forEach(function(member) {
      if (!J.get(member['name'])) {
        J.set(member['name'], 0);
      }
    });
}


function updateMemberCount(member) {
    var aantal = J.get(member);
    aantal++;
    J.set(member, aantal);

    // if (!J.get('memberTee')) {
    //     var arr = [];
    //     J.set('memberTee', JSON.stringify(arr));
    // }
    // var memberTee = JSON.parse(J.get('memberTee'));
    // memberTee.push(member);
    // J.set('memberTee', JSON.stringify(memberTee));
}

function klassement(jaar) {
    $('.splash').show();
    var datumKeuze = '';
    var scoreTabel = '';
    J.set('jaar', jaar);
    J.log(jaar);
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
            // code block
    }
    console.time();
    var trArray = [];
    var team, teamNaam, totaal, score, totaal, bgColor, member, scoreBorder, parKleur, teamRow, objHole;
    executeQuery(`select distinct s.game, s.datum from ${scoreTabel} as s group by s.game ${datumKeuze}`)
    .forEach(function(gameResult) {
        J.log(gameResult);
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
        for (H = 1; H < 19; H++) {
            member = '';
            scoreBorder = '';
            //J.log(objHole[H] );
            if (objHole[H] && objHole[H].hole == H) {
                bgColor = objHole[H].kleur;
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
            teamRow += `<td  width=4% class="cel" bgcolor= ${bgColor}><div ${scoreBorder}> ${score}
             <br><div class="memberName m-0">${member}</div></div></td>`;
        } // van 1 tot 18
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
  <table class="table table-border table-hover table-sm table-responsive-md text-center thead-dark">
    <tr><td>Pos.</td>`; //class='klassement'
    for (h = 1; h < 19; h++) {
        table += `<td>H` + h + `<br>${par[h]}</td>`
    }
    table += `<td>2B</td><td>#</td></tr>`;
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
        tableRow = row[1];
        tableRow = tableRow.replace("<tr>", "<tr><td>" + pos + posT + "</td>");
        table += tableRow;
    });
    table += "</table>";
    $("#results").html(table);
    focus();
    $('.splash').hide();
    setTimeout(function() {
        klassement(J.get('jaar'));
    }, 60000);
}

function setColorCount() {
    var colorCount = {
        max: 5,
        maxCount: 0,
        red: 0,
        yellow: 0,
        blue: 0,
        white: 0
    }
    J.set('colorCount', JSON.stringify(colorCount));
}

function checkMax(color) {
    var colorCount = JSON.parse(J.get('colorCount'));
    if (colorCount[color] < colorCount['max']) {
        colorCount[color]++;
        if (colorCount[color] == colorCount['max']) {
            colorCount['maxCount']++;
            if (colorCount['maxCount'] == 2) {
                colorCount['max'] = 4;
            }
        }
        J.set('colorCount', JSON.stringify(colorCount));
        return true;
    } else {
        return false;
        //mischien zelfs knop weghalen
    }
    setTimeout(function() {
        window.location = window.location.href;
        J.log('reload');
    }, 10000);
    klassement("2018");
}

function generatePage() {
    //teamSet zoekt automatisch in de DOM naar een element met id="teamSet"
    teamSet.style.display = noTeamSet.style.display = 'none';
    if (J.get('team')) {
        showTeamSet();
    } else {
        showNoTeamSet();
    }
    J.set('member', `-`);
    var hole = J.get('hole');
    showHole(hole);
}

function getNextTeamGame(team) {
     var teamGame = executeQuery(`SELECT max(game) as maxGame FROM scores `); //WHERE team = ` + team
     var nextTeamGame = parseFloat(teamGame[0]['maxGame']) + 1;
    // var nextTeamGame = '_' + Math.random().toString(36).substr(2, 9);
    // J.log(nextTeamGame);
    J.set('game', nextTeamGame);
}

function deleteEmptyGame(team){
   executeQuery( `delete from scores where team = ${team} and datum = "0000-00-00 00:00:00"`);
}


function getNextTeamGame_nietgoed(team) {
    //var teamGame = executeQuery(`SELECT max(game) as maxGame FROM scores `); //WHERE team = ` + team
    var teamGame = executeQuery(`SELECT max(game) as maxGame, COUNT(id) as countHoles FROM scores where team = ${team} and scores.game IN (select max(game) from scores where team = ${team})`);
    J.log(teamGame);
    if (parseFloat(teamGame[0].countHoles) === 1){
        var nextTeamGame = parseFloat(teamGame[0]['maxGame']);
    } else {
        var nextTeamGame = parseFloat(teamGame[0]['maxGame']) + 1;
    }
    J.set('game', nextTeamGame);
}



function showNoTeamSet() {
    $('.navbar').show();
    noTeamSet.style.display = 'block';
    var result = executeQuery(`select * from teams t where t.id IN (select teamId from game where game.game = ${wedstrijd}) limit 2`);

    //generate buttons voor elk bestaand team in database
    teams.innerHTML = '';
    result.forEach(function(team) {

        var div = document.createElement('div');
        div.className = `col-6 col-md-4 col-sm-4 col-lg-3 p-1 grid-item`;
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
            J.log(team.id);


        button.onclick = function() {
            J.log(team);
            J.set('team', team.id);
            
            J.set('team-' + team.id, JSON.stringify(executeQuery(`select name from teamleden where teamId = ${team.id}`))); 
            
            J.log(executeQuery(`select name from teamleden where teamId = ${team.id}`));
            
            // var teamObj = {};
            // result.forEach(function(result){
            //     teamObj[result.name] = 0;
            // });
            // J.set(teamObj);
            // J.log(team);


        
            showTeamSet();
        }
        div.appendChild(button);
        teams.appendChild(div);
    });
    restructure();
}



function showTeamSet() {
    if (!J.get('startHole')) {
        chooseStartHole();
    }
    if(!J.get('game')){
        getNextTeamGame();
    }
    //getTeamMembers(J.get('team'));
    $('.navbar').hide();
    setMemberCount(J.get(`team-${J.get('team')}`));

    noTeamSet.style.display = 'none';
    teamSet.style.display = 'block';
    playing.style.display = 'block';
    teeButtons.innerHTML = '';
    colors.forEach(function(color) {
        var div = document.createElement('div');
        div.className = 'p-1 col-6 col-sm-3';
        var button = document.createElement('BUTTON');
        button.className = 'btn-large col-12 border text-secondary big-text p-1 rounded';
        //var colorTimes = J.get('colorCount')[color];
        var colorCount = JSON.parse(J.get('colorCount'));
        button.innerHTML = `${colorCount[color]} x`;
        button.style.backgroundColor = color;
        button.onclick = function() {
            setTee(color);
            var colorCount = JSON.parse(J.get('colorCount'));
            if (colorCount[J.get('tee')] == 5) {
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
        div.className = 'p-1 m-0 col-3 col-sm-4 col-lg-3 grid-item';
        var button = document.createElement('BUTTON');
        button.className = 'btn-large btn-light col-12 border p-3 p-sm-4 p-lg-5 bigger-text rounded';
        button.innerHTML = score;
        button.onclick = function() {
            setScore(score);
        };
        div.appendChild(button);
        scoreButtons.appendChild(div);
    });
    nameButtons.innerHTML = '';
    JSON.parse(J.get('team-' + J.get('team'))).forEach(function(names) {
        var div = document.createElement('div');
        div.className = 'p-1 m-0 col-3 col-sm-4 col-lg-3 grid-item';
        var button = document.createElement('BUTTON');
        button.className = 'btn-large btn-dark col-12 border p-2 p-sm-4 p-lg-5 bigger-text rounded';
        button.innerHTML = names['name'] + ` ` + J.get(names.name) + 'x';
        button.onclick = function() {
            if (J.get(names['name']) == 5) {
                Swal.fire({
                    title: 'Helaas!',
                    text: "Deze speler heeft geen afslagen meer, kies een ander",
                    type: 'warning',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Ik snap het...'
                })
            } else {
                J.set('member', names['name']);
                colorCheck.innerText = J.get('member');
            }
        };
        div.appendChild(button);
        nameButtons.appendChild(div);
    });

    checkContainer.style.backgroundImage = "linear-gradient(#A0CABB,#A0CABB)";
}

function setTee(color) {
    J.set('tee', color);
    checkContainer.style.backgroundImage = "linear-gradient(#A0CABB," + color + ")";
}

function setScore(score) {
    J.set('score', score);
    scoreCheck.innerText = score;
}

function saveHole() {
    if (J.get('tee') && J.get('score') && J.get('member') !== `-`) {
        if (checkMax(J.get('tee'))) {
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
                        Swal.fire({
                            title: 'Opgeslagen!',
                            type: 'success',
                            showConfirmButton: false,
                            timer: 1500,
                        });
                        updateMemberCount(J.get('member'));
                        J.set('member', `-`);
                        if(!J.get('holePlayed')){
                            deleteEmptyGame(J.get('team'));
                        }
                        J.set('holePlayed', 'yes');
                        renderTable(getTeamScore(), 'results');
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
        } else {
            Swal.fire({
                title: 'Helaas!',
                text: "Je hebt het maximale aantal afslagen voor deze tee bereikt, kies een andere tee",
                type: 'warning',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Ik snap het...'
            })
        }
    } else {
        Swal.fire({
            title: 'OOPS',
            text: "Teekleur, Afslag en Score ingevuld??",
            type: 'warning',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ik begrijp het, sorry...'
        })
    }
}

function nextHole() {
    var hole = parseFloat(J.get('hole'));
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
    J.log(stopHole);
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
    if (saldo == 0 || saldo == null){
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
            if (key === 'id' || key === 'game' || key === 'team') continue;
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
            tableRow.appendChild(scoreRowData);
        }
        document.getElementById(`${renderName}-tbody`).appendChild(tableRow);
    });
}

function finishGame() {
    results.innerHTML = '';
    replay.innerHTML = '';
    renderTable(getTeamScore(), 'teamScore');
    playing.style.display = 'none';
    message.style.display = `block`;
    replay.style.display = `block`;
    var replayButton = document.createElement('button');
    replayButton.className = 'btn btn-success border btn-block text-light p-2 p-sm-3 bigger-text';
    replayButton.onclick = function() {
        restart();
    };
    replayButton.innerText = 'Start nieuwe ronde';
    replay.appendChild(replayButton);
    message.innerHTML = `Ronde volbracht, hieronder de resultaten.`;
    finished.style.display = `block`;
    setColorCount();
    setMemberCount(J.get(`team-` + J.get('team')));
}

function restart() {
    $(".container").hide();
    localStorage.clear();
    // finished.style.display = 'none';
    // results.innerHTML = '';
    // replay.innerHTML = '';
     setColorCount();
    // getNextTeamGame();
     //generatePage();
    // //restructure();
    location.reload();
}

function getTeamScore() {
    var query = `SELECT s.hole,s.game,s.kleur,s.score, s.score - h.par as verschil,s.team as team FROM scores as s left join holes as h on h.hole=s.hole group by s.id having s.game =  ${J.get('game')} and team = ${J.get('team')}`;
    var verschil = 0;
    var obj = executeQuery(query);
    J.log(obj);
     obj.forEach(function(result){
        verschil += result.verschil;
        //J.log(verschil);
    });
     if (verschil > 0){
        verschil = '+' + verschil;
     }
     J.set('saldo',verschil);
     $('#verschil').html(verschil);
    return executeQuery(query);
}



function getTeamScore_() {
    var query = `SELECT s.hole,s.game,s.kleur,s.score, s.score - h.par as verschil,s.team as team FROM scores as s left join holes as h on h.hole=s.hole group by s.id having s.game =  ${J.get('game')} and team = ${J.get('team')}`;
    return executeQuery(query);


}



