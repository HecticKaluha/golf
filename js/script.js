const colors = ['red', 'blue', 'yellow', 'white'];
const amountOfScoreButtons = ['1', '2', '3', '4', '5', '6', '7', '8'];
const par = [0,4,4,5,3,5,4,3,3,4,3,4,3,5,4,4,4,4,4];


let masonries = [];
let masonriesElements = [];

var holes = 18;
var min = 0;

$(document).ready(function () {

    if(!getCookie('sessie')){
       // restart();
   } else {
    setCookie('sessie', 'uren', 6);
}

generatePage();
getGameFromURL();

});


function klassement(game) {
    var klasse = {};
    if (game == '2018'){
        var scoreTabel = 'scoresCup2018';
        var gameJoin = '';

    } else {
        var scoreTabel = 'scores';  
        var gameJoin = ` left join game on (s.game = game.game)`;  
        gameJoin = '';    
    }
    //var x = 0;
    kleur();
    var klasQuery = "select s.team AS team, teams.team as teamnaam,";

    for (i = 1; i < 19; i++) {
        klasQuery += (` sum(case when s.hole = ${i} then s.score end) AS H${i}`);
        if (i < 18){
            klasQuery += ",";
        }
    }

    //klasQuery += " sum(`s`.`score`) AS `totaal` , (select sum(s.score)-70) as '#' from ( " + scoreTabel + " `s` left join teams on teams.id = s.team   "  +  gameJoin + "   left join `holes` `h` on(`h`.`hole` = `s`.`hole`))  group by `s`.`team` order by sum(`s`.`score`)";//where date_format(`s`.`datum`,'%Y-%m-%d') = curdate()  |||| , `s`.game`
    klasQuery += " from " + scoreTabel + " `s` left join teams on teams.id = s.team   "  +  gameJoin + "   left join `holes` `h` on(`h`.`hole` = `s`.`hole`)  group by `s`.`team` ";//where date_format(`s`.`datum`,'%Y-%m-%d') = curdate()  |||| , `s`.game`

    console.log(klasQuery);
    var dbResult = executeQuery(klasQuery);
    //renderTable(dbResult,"klasse");

    var teamScore = dbResult;
    var table = "<table class='klassement'>";
    table += `<tr>
    <td>Pos.</td>
    <td>teamnaam</td>`;
    for (h = 1 ; h < 19 ; h++){
        table += `<td>H` + h + `<br>${par[h]}</td>`
    }
    

    table += `<td>Projected</td>
    <td>#</td>
    </tr>`;
    var pos = 0;

    teamScore.forEach(function (teams) {
        var teamRow = "";
        var tr = {};


        var totaal = 0;
        pos++;
        var team = teams['team'];
        var teamNaam = teams['teamnaam'];

        var kleurObj = JSON.parse(localStorage.getItem(team));
 
        teamRow += `<tr><td>${pos}</td><td>${teamNaam}</td>`;

        for (hole = 1; hole < 19; hole++) {
             var styleId = `<div id="circle">`;


            if (!teams['H' + hole]){
                score = par[hole];
                totaal += parseFloat(score);
                var bgColor = 'grey';

            } else {
                score = teams['H' + hole];
                totaal += parseFloat(score);
                styleId = `<div id="circle">`

                if (!kleurObj[hole - 1]){
                    bgColor = 'grey';
                } else {
                    var bgColor = kleurObj[hole - 1]['kleur'];
                }
            }

            //console.log(kleurObj[x][hole]['kleur']);
            teamRow += `<td width=50px bgcolor= ${bgColor}> ${styleId}`;
            if (styleId = `<div id="circle>"`){
                teamRow += `</div>`;
            }
            if (score < par[hole]){
                teamRow += '*';
            }
            teamRow += score;
            teamRow += "</td>";



        }

        var parKleur = 'yellow';
        if ((totaal-70) < 0 ){
            var parKleur =  'red';
        } else if ((totaal-70) == 0 ){
            var parKleur =  'silver';
        }

        teamRow += `<td>` + totaal + `</td><td bgcolor=${parKleur}>`  + (totaal-70) + `</td>`;

        teamRow += "</tr>";
        table += teamRow;



        tr[team] = {
            team:       team,
            teamNaam:   teamNaam,
            totaal:     totaal,
            teamRow:    teamRow  
        }

        console.log(tr);
        localStorage.setItem('tr',JSON.stringify(tr));


    });
    table += "</table>";
    // console.log(table);
    $("#klassement").html(table);
}














function klassementGoed(game) {
    if (game == '2018'){
        var scoreTabel = 'scoresCup2018';
        var gameJoin = '';

    } else {
        var scoreTabel = 'scores';  
        var gameJoin = ` left join game on (s.game = game.game)`;  
        gameJoin = '';    
    }
    //var x = 0;
    kleur();
    var klasQuery = "select s.team AS team, teams.team as teamnaam,";
    for (i = 1; i < 19; i++) {
        klasQuery += (` sum(case when s.hole = ${i} then s.score end) AS H${i},`);
    }
    //klasQuery += " sum(`s`.`score`) AS `totaal` , (select sum(s.score)-70) as '#' from ( " + scoreTabel + " `s` left join teams on teams.id = s.team     left join `game`  on game.game=s.game      left join `holes` `h` on(`h`.`hole` = `s`.`hole`))  group by `s`.`team`       order by sum(`s`.`score`)";//where date_format(`s`.`datum`,'%Y-%m-%d') = curdate() ||||||     having(`s`.`team` IN (select `id` FROM `game` WHERE `game` = "+game+")) 
    
    klasQuery += " sum(`s`.`score`) AS `totaal` , (select sum(s.score)-70) as '#' from ( " + scoreTabel + " `s` left join teams on teams.id = s.team   "  +  gameJoin + "   left join `holes` `h` on(`h`.`hole` = `s`.`hole`))  group by `s`.`team` order by sum(`s`.`score`)";//where date_format(`s`.`datum`,'%Y-%m-%d') = curdate()  |||| , `s`.game`

    console.log(klasQuery);
    var dbResult = executeQuery(klasQuery);
    //renderTable(dbResult,"klasse");

    var teamScore = dbResult;
    var table = "<table class='klassement'>";
    table += `<tr>
    <td>Pos.</td>
    <td>teamnaam</td>
    <td></td>
    <td>H1</td>
    <td>H2</td>
    <td>H3</td>
    <td>H4</td>
    <td>H5</td>
    <td>H6</td>
    <td>H7</td>
    <td>H8</td>
    <td>H9</td>
    <td>H10</td>
    <td>H11</td>
    <td>H12</td>
    <td>H13</td>
    <td>H14</td>
    <td>H15</td>
    <td>H16</td>
    <td>H17</td>
    <td>H18</td>
    <td>TOTAAL</td>
    <td>#</td>
    <td>objTotaal</td>
    </tr>`;
    var pos = 0;

    teamScore.forEach(function (teams) {
        var tr = {};

        var totaal = 0;
        pos++;
        var team = teams['team'];
        var teamNaam = teams['teamnaam'];
        //var totaal = ;
        var kleurObj = JSON.parse(localStorage.getItem(team));
        var parKleur = 'yellow';
        if (teams['#'] < 0 ){
            var parKleur =  'red';
        } else if (teams['#'] == 0 ){
            var parKleur =  'silver';
        } 

        table += `<tr><td>${pos}</td><td>${teamNaam}<td>`;
        //x++;

        for (hole = 1; hole < 19; hole++) {
            console.log();
            if (!teams['H' + hole]){
                score = par[hole];
                totaal += parseFloat(score);
                var bgColor = 'grey';
            } else {
                score = teams['H' + hole];
                totaal += parseFloat(score);

                if (!kleurObj[hole - 1]){
                    bgColor = 'grey';
                } else {
                    var bgColor = kleurObj[hole - 1]['kleur'];
                }
            }

            //console.log(kleurObj[x][hole]['kleur']);
            table += `<td width=50px bgcolor= ${bgColor}>`;

            table += score;
            table += "</td>";


        }
        table += `<td>` + teams['totaal']+ `</td><td bgcolor=${parKleur}>` + teams['#'] + `</td><td>` + totaal + `</td>`;

        table += "</tr>";
    });
    table += "</table>";
    // console.log(table);
    $("#klassement").html(table);
}





function setColorCount(){
  //if(localStorage.getItem('colorCount')){
    var colorCount = {
        max:        5,
        maxCount:   0,
        red:        0,
        yellow:     0,
        blue :      0,
        white:      0
    }            

    localStorage.setItem('colorCount', JSON.stringify(colorCount));
    //}
}

function checkMax(color) {
    var colorCount = JSON.parse(localStorage.getItem('colorCount'));
    console.log('kleur');
    console.log(colorCount[color]);
    //color moet hier eigenlijk verwijzen naar de var met die naam
    if (colorCount[color] < colorCount['max']) {
        colorCount[color]++;
        if (colorCount[color] == colorCount['max']) {
            colorCount['maxCount']++;
            if (colorCount['maxCount'] == 2) {
                colorCount['max'] = 4;
            }
        }

        localStorage.setItem('colorCount', JSON.stringify(colorCount));        
        
        return true;
    } else {

        return false;
        //mischien zelfs knop weghalen
    }
}





function generatePage() {
    //teamSet zoekt automatisch in de DOM naar een element met id="teamSet"
    teamSet.style.display = noTeamSet.style.display = 'none';

    //init alle masonries tegelijkertijd
    initializeGrids();

    if (getTeamFromURL()) {
        showTeamSet();
    } else {
        showNoTeamSet();
    }
    

    var hole = localStorage.getItem('hole');
    showHole(hole);

    restructure();
}

function getGameFromURL(){
    var url = new URL(window.location.href);
    //vraag url parameter team op
    var game = url.searchParams.get("game");
    //team in url gevonden

    if (game) {
        //console.log(game);
        //console.log(localStorage.getItem('game'));
        if (game !== localStorage.getItem('game') || !localStorage.getItem('game')) {

            localStorage.setItem('game', game);
            //setColorCount();
        }
        return true;
    }
    //team niet gevonden in url
    else {
        //check if exists in localstorage
        if (localStorage.setItem('game', 9999)) {
            return true;
        }
        //check in url
        else {
            return false;
        }
    }

}


function getNextTeamGame(team){
    var teamGame = executeQuery(`SELECT max(game) as maxGame FROM scores WHERE team = ` + team);
    console.log(teamGame[0]['maxGame']);
    var nextTeamGame = parseFloat(teamGame[0]['maxGame'])+1;
    localStorage.setItem('teamGame', nextTeamGame);
    console.log(nextTeamGame);

}



function getTeamFromURL() {
    //bouw url
    var url = new URL(window.location.href);
    //vraag url parameter team op
    var team = url.searchParams.get("team");
    //team in url gevonden

    if (team) {
        if (team !== localStorage.getItem('team')) {
            localStorage.setItem('hole', 1);
            setColorCount();

        }
        localStorage.setItem('team', team);
        getNextTeamGame(team);
        return true;
    }
    //team niet gevonden in url
    else {
        //check if exists in localstorage
        if (localStorage.getItem('team')) {
            return true;
        }
        //check in url
        else {
            return false;
        }
    }
}

function showNoTeamSet() {
    noTeamSet.style.display = 'block';

    var result = executeQuery(`select * from teams`);
    //bepaal size van knop gebaseerd op totaal aantal teams
    var size = 12 / result.length;
    if (size < 6 || size === Infinity) {
        size = 6
    }

    //generate buttons voor elk bestaand team in database
    teams.innerHTML = '';
    result.forEach(function (team) {
        var div = document.createElement('div');
        //rond size af naar bove en gebruik size om een class te geven die de groote bepaald
        div.className = `col-${Math.ceil(size)} p-1 col-sm-4 grid-item`;
        var button = document.createElement('BUTTON');
        button.className = 'btn-large btn-light col-12 border p-3 bigger-text rounded text-wrap text-break';
        button.innerHTML = team.team;

        button.onclick = function () {
            localStorage.setItem('team', team.id);
            showTeamSet();
            restructure();
        };

        div.appendChild(button);
        teams.appendChild(div);
    });
}

function showTeamSet() {
    noTeamSet.style.display = 'none';
    teamSet.style.display = 'block';
    playing.style.display = 'block';

    teeButtons.innerHTML = '';

    colors.forEach(function (color) {
        var div = document.createElement('div');
        div.className = 'p-1 col-6 col-sm-3 grid-item';

        var button = document.createElement('BUTTON');
        button.className = 'btn-large col-12 border text-secondary p-2 p-sm-4 p-lg-5 big-text rounded';

        //var colorTimes = localStorage.getItem('colorCount')[color];
        var colorCount = JSON.parse(localStorage.getItem('colorCount'));

        button.innerHTML = `${colorCount[color]} x`;
        button.style.backgroundColor = color;

        button.onclick = function () {
            setTee(color);
        };

        div.appendChild(button);
        teeButtons.appendChild(div);
    });

    


    scoreButtons.innerHTML = '';
    amountOfScoreButtons.forEach(function (score) {
        var div = document.createElement('div');

        div.className = 'p-1 m-0 col-3 col-sm-4 col-lg-3 grid-item';

        var button = document.createElement('BUTTON');
        button.className = 'btn-large btn-light col-12 border p-3 p-sm-4 p-lg-5 bigger-text rounded';
        button.innerHTML = score;

        button.onclick = function () {
            setScore(score);
        };

        div.appendChild(button);
        scoreButtons.appendChild(div);
    });

    checkContainer.style.backgroundColor = '#f8f9fa';
}

function setTee(color) {

    localStorage.setItem('tee', color);
    checkContainer.style.backgroundColor = color;
        //colorCheck.innerText = color;
    }


    function setScore(score) {
        localStorage.setItem('score', score);
        scoreCheck.innerText = score;
    }

    function saveHole() {
        if (localStorage.getItem('tee') && localStorage.getItem('score')) {
            if (checkMax(localStorage.getItem('tee'))) {
                $.ajax({
                    url: "db_write.php?method=saveScore",
                    data: {
                        team: localStorage.getItem('team'),
                        hole: localStorage.getItem('hole'),
                        tee: localStorage.getItem('tee'),
                        score: localStorage.getItem('score'),
                        game: localStorage.getItem('game')
                    },
                    type: "post",
                    success: function (res) {
                        var response = JSON.parse(res);

                        if (response.success) {
                        //je response message is beschikbaar vie response.message
                        Swal.fire({
                            title: 'Opgeslagen!',
                            type: 'success',
                            showConfirmButton: false,
                            timer: 1500,
                        });
                        nextHole();
                        renderTable(getTeamScore(), 'teamScore');
                    } else {
                        //show error
                        Swal.fire({
                            type: 'error',
                            title: 'Oops...',
                            text: response.message,
                        });
                    }
                },
                fail: function () {
                    console.log('dat is niet gelukt!')
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
                text: "TeeKleur en score ingevuld??",
                type: 'warning',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Ik begrijp het, sorry...'
            })
        }
    }

    function nextHole() {
        var hole = parseFloat(localStorage.getItem('hole'));
        hole++;
        localStorage.setItem('hole', hole);
        showHole(hole);
        showTeamSet();
    }

    function showHole(hole) {
    //if not set set to 0
    if (!hole) {
        hole = 1;
    }
    if (hole > holes) {
        finishGame();
    } else {
        renderHole(hole);
    }
}

function renderHole(hole) {
    localStorage.removeItem('score');
    localStorage.removeItem('tee');
    localStorage.setItem('hole', hole);

    colorCheck.style.color = "black";
    colorCheck.innerText = "-";

    scoreCheck.innerText = "-";

    //holecheck zoekt automatisch in de DOM naar een element met id="holeCheck"
    //zie voor extra uitleg https://www.tjvantoll.com/2012/07/19/dom-element-references-as-global-variables/
    //holeNumber.innerText = hole;
    holeCheck.innerText = hole;

    checkContainer.style.backgroundColor = '#f8f9fa';
}


function executeQuery(query) {
    var result = [];
    $.ajax({
        url: "db_write.php?method=executeQuery",
        type: "post",
        async: false,
        data: {
            query: query,
        },
        success: function (res) {
            var response = JSON.parse(res);
            if (response.success) {
                //je response message (result van de query) is beschikbaar via response.message
                result = response.message;
                //console.log(result);

            } else {
                //show error
                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: response.message,
                });
            }
        },
        fail: function () {
            console.log('dat is niet gelukt!')
        }
    });
    return result;
}

function setCookie(cname, cvalue, exhours) {
    var d = new Date();
    d.setTime(d.getTime() + (exhours * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
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

    divToRenderIn.innerHTML =
    `<table class="table table-bordered table-striped">
    <thead>
    <tr role="row" id="${renderName}-thead">

    </tr>
    </thead>
    <tbody id="${renderName}-tbody">

    <tbody/>
    </table>`;

    //loop over alle rows
    jsonResult.forEach(function (row, index) {
        var tableRow = document.createElement('tr');
        tableRow.className = 'text-wrap';

        //loop over alle columns van de row
        for (let [key, value] of Object.entries(row)) {
            if (key === 'id') continue;
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
    renderTable(getAllScores(), 'finalResults');
    playing.style.display = 'none';

    message.style.display = `block`;
    replay.style.display = `block`;
    var replayButton = document.createElement('button');
    replayButton.className = 'btn btn-success border btn-block text-light p-2 p-sm-3 bigger-text';
    replayButton.onclick = function () {
        restart();
    };
    replayButton.innerText = 'Start nieuwe ronde';
    replay.appendChild(replayButton);
    message.innerHTML = `Ronde volbracht, hieronder de resultaten.`;
    finished.style.display = `block`;
    setColorCount();
}

function restart() {
    localStorage.removeItem('team');
    localStorage.removeItem('score');
    localStorage.removeItem('tee');
    localStorage.removeItem('hole');
    localStorage.removeItem('game');

    finished.style.display = 'none';

    results.innerHTML = '';
    replay.innerHTML = '';
    setColorCount();
    generatePage();
}

function initializeGrids() {
    masonries = document.getElementsByClassName('grid');
    Array.from(masonries).forEach(function (grid, index) {
        masonriesElements[index] = new Masonry(grid, {
            itemSelector: '.grid-item',
        });
    });
}

function restructure() {
    masonriesElements.forEach(function (masonry) {
        masonry.reloadItems();
        masonry.layout();
    });
}

//omdat je nu een string gebruikt om je query op te bouwen hoef je kolomnamen niet tussen quotes te zetten (zie hieronder)
//door gebruik te maken van apostrophes (geen quotes ' of dubbele quotes " ) kun je direct javascript variables gebruiken
//als je ze zet tussen ${variable} (zie queries hieronder met localstorage)
//zie https://developer.mozilla.org/nl/docs/Web/JavaScript/Reference/Template_literals voor verdere uitleg
var iets = `select SUM(score) as TOTAAL FROM scores WHERE team = ${localStorage.getItem('team')}`;
var q2 = `SELECT team,scores.hole,score,kleur FROM scores LEFT join holes ON holes.hole = scores.hole`;
var q3 = `SELECT sum(score) as totaal FROM scores where team = ${localStorage.getItem('team')}`; // rondetotaal
var q4 = 'select distinct team from scores';
var q5 = "select team, sum(score) as totaal from scores where DATE_FORMAT(datum, '%Y-%m-%d') = CURDATE() group by team order by totaal asc";
var q7 = "SELECT *  FROM klassement where game =1 ";
var q6 = "SELECT *  FROM overall as o right join game g on g.teamId = o.team right join teams t on t.id = g.teamId where t.id in (select teamId from game) order by totaal";

function testQuery() {
    //vul hier je query in, wanneer je op de knop klikt zal het resultaat zichtbaar worden op het scherm
    //  var query = `SELECT s.hole,s.kleur,s.score,sum(s.score-h.par) as verschil,s.team as team FROM scores as s left join holes as h on h.hole=s.hole group by s.id having team = ${localStorage.getItem('team')}`;
    var query = "SELECT s.hole,s.kleur,s.score,sum(s.score-h.par) as verschil,s.team as team, s.datum FROM scores as s left join holes as h on h.hole=s.hole group by s.id having team = " + localStorage.getItem('team') + " ";//and DATE_FORMAT(s.datum, '%Y-%m-%d') = CURDATE()

    var dbResult = executeQuery(query);
    //deze regels mogen weg zodra de testquery knop uit de app gehaald wordt.
    message.style.display = `none`;
    replay.style.display = `none`;

    renderTable(dbResult, 'query1');
}

function testQuery2(q) {
    //vul hier je query in, wanneer je op de knop klikt zal het resultaat zichtbaar worden op het scherm
    //  var query = `SELECT s.hole,s.kleur,s.score,sum(s.score-h.par) as verschil,s.team as team FROM scores as s left join holes as h on h.hole=s.hole group by s.id having team = ${localStorage.getItem('team')}`;
    var query = q;

    var dbResult = executeQuery(query);
    //deze regels mogen weg zodra de testquery knop uit de app gehaald wordt.
    message.style.display = `none`;
    replay.style.display = `none`;

    renderTable(dbResult, 'query1');
}




function kleur() {

    var query = "select  `s`.`team` AS `team`, sum(`s`.`score`) AS `totaal` from (`scores` `s` left join `holes` `h` on(`h`.`hole` = `s`.`hole`))  group by `s`.`team` order by sum(`s`.`score`)";// where date_format(`s`.`datum`,'%Y-%m-%d') = curdate()
    var dbResult = executeQuery(query);

    dbResult.forEach(function (teamId) {
        var kleurResult = executeQuery("select kleur from scores where team = " + teamId['team']); //+ " and DATE_FORMAT(datum, '%Y-%m-%d') = CURDATE() OR datum = DATE_ADD(CURDATE(), INTERVAL -1 DAY)"

        localStorage.setItem(teamId['team'], JSON.stringify(kleurResult));

    });
};


function getAllScores() {
    var query = `select team, hole,kleur, score from scores where team = ${localStorage.getItem('team')}`;

    //Roep de generieke generate functie aan en geef daar de result van de query mee
    return executeQuery(query);
}

function getTeamScore() {
    var query = `SELECT s.hole,s.kleur,s.score,sum(s.score-h.par) as verschil,s.team as team FROM scores as s left join holes as h on h.hole=s.hole group by s.id having team = ${localStorage.getItem('team')}`;
    //Roep de generieke generate functie aan en geef daar de result van de query mee
    return executeQuery(query);
}

function getAllScoresOrdered() {
    var query = `select * from scores order by score desc`;
    //Roep de generieke generate functie aan en geef daar de result van de query mee
    return executeQuery(query);
}

function getAllTeams() {
    var query = `select * from teams`;
    //Roep de generieke generate functie aan en geef daar de result van de query mee
    return executeQuery(query);
}

