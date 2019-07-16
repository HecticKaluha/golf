const colors = ['red', 'blue', 'yellow', 'white'];
const amountOfScoreButtons = ['1', '2', '3', '4', '5', '6', '7', '8'];
const par = [0,4,4,5,3,5,4,3,3,4,3,4,3,5,4,4,4,4,4];
const wedstrijd = 2;
const dagGame = 1;
var styleId = '';

let masonries = [];
let masonriesElements = [];


var holes = 18;
var min = 0;

$(document).ready(function () {

    if(localStorage.getItem('team')){
        $(".splash").hide();
    } else {
        $(".splash").show();
        $(".splash").delay( 1000 ).fadeOut("slow");

    }

    var nu =  Date.now();
    if(localStorage.getItem('cookie') < nu){
        localStorage.clear();
        restart();
        //getNextTeamGame();
        localStorage.setItem('cookie',Date.now()+(6*60*60*1000));//5*60*60*1000
        console.log('cookie gezet, geldt voor 6 uren');
    }
    generatePage();
    localStorage.setItem('targetDiv','bottom');
    
    //prepareScore();


});









function prepareScore (){
    for (i=1 ; i< 20 ; i++){
        log(executeQuery ("INSERT INTO scores(`id`, `team`, `hole`, `kleur`, `score`, `datum`, `game`) VALUES (null," + i + ",0,0,0,0,2)"));
    }
}

function log(val){
    console.log(val);
}


$('#dropdown').change(function(input){
    log(input);
    // $('#textBoxContainer').empty();
    // var number = $(this).find('option:selected').attr('data-number');
    // for (var i = 0; i < number; i++){
    //       $('#textBoxContainer').append('<input type="text"/>');
    // }
});


function showRules(){
    var rules = `<h1>Regelement</h1>
    <ul><li>Speel met een team van 4 personen.</li>
    <li>Van elke speler dient 4x de afslag worden gebruikt.</li>
    <li>Kies voor elke hole de kleur Tee waarmee je het best denkt te scoren, wit, geel, blauw of rood. </li><li>Elke kleur dient minstens 4 keer te worden gebruikt. </li>  <li>Sla alle 4 vanaf af en kies de beste ligging.</li><li>Sla alle 4 vanaf die plaats.</li><li>Ook op de green krijgt iedereen de gelegenheid uit te holen.</li><li>De laatste holed uit.</li> <li>Noteer de TeeKleur, wiens afslag, en de score in de app en sla op.</li><li>Succes!</li> </ul>`;
    $('#results').html(rules);
    focus();

}

function showNews(){
        var news = '<h1>Nieuws</h1>';
    $('#results').html(news);
    focus();
}



function focus(){
    
    //var targetDiv = localStorage.getItem('targetDiv');
    var targetDiv = "bottom";
    $([document.documentElement, document.body]).animate({
        scrollTop: $(`.${localStorage.getItem('targetDiv')}`).offset().top
    }, 2000);
  
    // targetDiv = localStorage.getItem('targetDiv');
    //  if (targetDiv === "bottom"){
    //      targetDiv = "top";
    //  } else {
    //      targetDiv = "bottom";
    //  }
    //  localStorage.setItem('targetDiv', targetDiv);

}



function getTeamMembers(){
    if(localStorage.getItem('team')){

        return (executeQuery(`select name from teamleden where teamId= ${localStorage.getItem('team')}`));
    }
}


function resetTeamMembers(){
    getTeamMembers().forEach(function(member){

        localStorage.removeItem(member['name']);
    });
}


function setMemberCount(memberObj,del){
    if(localStorage.getItem('team')){
        JSON.parse(memberObj).forEach(function(member){
            if(!localStorage.getItem(member['name'])){
                localStorage.setItem(member['name'],0);
            }
        });
    }
}


function updateMemberCount (member){
    var aantal = localStorage.getItem(member);
    aantal++;
    localStorage.setItem(member,aantal);

    if(!localStorage.getItem('memberTee')){
        var arr = [];
        localStorage.setItem('memberTee',JSON.stringify(arr));
    }

    var memberTee = JSON.parse(localStorage.getItem('memberTee'));
    memberTee.push(member);
    localStorage.setItem('memberTee',JSON.stringify(memberTee));
}


function klassement(game) {
    var klasse = {};
    var trArray = [];
    var datumKeuze = "";
    switch(game) {
  case `2018`:
        var scoreTabel = 'scoresCup2018'
    break;
  case `2019`:
        var scoreTabel = 'scores';  
    break;
  case `datum`:
        var scoreTabel = 'scores';  
        var datumKeuze =`having ( date_format(s.datum,'%Y-%m-%d') between CURDATE() - INTERVAL 10 DAY AND curdate())`
    break;
  case `today`:
        var scoreTabel = 'scores';  
        var datumKeuze =`having ( date_format(s.datum,'%Y-%m-%d') = CURDATE())`
    break;

  default:
    // code block
}


    var klasQuery = `select s.datum, s.team AS team, teams.team as teamnaam,`;
    for (i = 1; i < 19; i++) {
        klasQuery += (` sum(case when s.hole = ${i} then s.score end) AS H${i}`);
        if (i < 18){
            klasQuery += ",";
        }
    }

    klasQuery += " ,s.game from " + scoreTabel + " `s`  left join teams on teams.id = s.team  left join `holes` `h` on(`h`.`hole` = `s`.`hole`)  group by `s`.`team`, s.game "+datumKeuze;
//  having ( date_format(s.datum,'%Y-%m-%d') between curdate() - 10 DAY AND curdate() )
    // date_format(s.datum,'%Y-%m-%d') = curdate() - INTERVAL 1 DAY |||| s.game > " + dagGame + "
log(klasQuery);
    var dbResult = executeQuery(klasQuery);
    dbResult.forEach(function (teams) {

        var teamRow = "";
        var totaal = 0;
        var team = teams['team'];
        var teamNaam = teams['teamnaam'];
        var game = teams['game'];
        var kleurObj = executeQuery(`SELECT kleur FROM ${scoreTabel} WHERE team = ${team} and game = ${game} order by id`);

        teamRow += `<tr><td  colspan=22 class=text-left>${teamNaam}</td></tr><tr><td></td>`;

        for (hole = 1; hole < 19; hole++) {
            var scoreBorder = ``;


            if (!teams['H' + hole]){
                score = par[hole];
                totaal += parseFloat(score);
                var bgColor = 'grey';

            } else {
                score = teams['H' + hole];
                totaal += parseFloat(score);
                styleId = `<div class=\"circle\">`

                if (!kleurObj[hole - 1]){
                    bgColor = 'grey';
                } else {
                    var bgColor = kleurObj[hole - 1]['kleur'];
                }
            }

            if (score < par[hole]){
                scoreBorder += `<div class=\"birdie\">`;
            }
            if (score > par[hole]){
                scoreBorder += `<div  class=\"bogey\">`;
            }


            teamRow += `<td  width=4%  bgcolor= ${bgColor}> ${scoreBorder}`;


            teamRow += score;
            if (styleId != ``){
                teamRow += `</div>`;
            }        
            teamRow += "</td>";
        }

        var parKleur = 'marineblue';
        if ((totaal-70) < 0 ){
            var parKleur =  'red';
        } else if ((totaal-70) == 0 ){
            var parKleur =  'silver';
        }

        teamRow += `<td>` + totaal + `</td><td bgcolor=${parKleur}>`  + (totaal-70) + `</td></tr>`;
        trArray.push([totaal, team, teamNaam, teamRow]);
    });

    renderKlassement(trArray);
};




function renderKlassement(trArray){
    trArray.sort(function(a,b){
        return a[0]-b[0];
    });



    var table = `<h1>klassement</h1>
    <table class="table table-border table-hover table-sm table-responsive-md text-center thead-dark">
    <tr><td>Pos.</td>`;//class='klassement'
    for (h = 1 ; h < 19 ; h++){
        table += `<td>H` + h + `<br>${par[h]}</td>`
    }
    table += `<td>2B</td><td>#</td></tr>`;
    var pos = 0;
    var prevTotal = "";
    var posT

    trArray.forEach(function(row){
        var posT = '';
        //pos++;
        if(row[0] != prevTotal){
            pos++;
            prevTotal = row[0];
        } else {
         posT = "*";

     }
     tableRow = row[3];
     tableRow = tableRow.replace("<tr>","<tr><td>"+pos+posT+"</td>") ;
     table+= tableRow;

 });

    table += "</table>";
    $("#results").html(table);
    focus();
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
    //console.log('kleur');
    //console.log(colorCount[color]);
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
    //initializeGrids();

    // if (getTeamFromURL()) {
    //     getTeamMembers(localStorage.getItem('team'));
    //     setMemberCount(localStorage.getItem('team'));
    //     showTeamSet();
    // } else {
    //     showNoTeamSet();
    // }

    if(localStorage.getItem('team'))
    {
        showTeamSet();
    } else {
        showNoTeamSet();
    }
    localStorage.setItem('member',`-`);
    var hole = localStorage.getItem('hole');
    showHole(hole);
}


function getNextTeamGame(team){
    var teamGame = executeQuery(`SELECT max(game) as maxGame FROM scores `); //WHERE team = ` + team
    //console.log(teamGame[0]['maxGame']);
    var nextTeamGame = parseFloat(teamGame[0]['maxGame'])+1;
    localStorage.setItem('game', nextTeamGame);
    //console.log(nextTeamGame);

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
        $('.navbar').show();
    noTeamSet.style.display = 'block';

    var result = executeQuery(`select * from teams where teams.id IN (select teamId from game where game.game = ${wedstrijd}) `);
    result.forEach(function (team){
       //log(team['id']);

       localStorage.setItem('team-'+team['id'], JSON.stringify(executeQuery(`select name from teamleden where teamId = ${team['id']}`)));

   });
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
        button.className = 'btn-large btn-light col-12 border p-2 bigger-text rounded text-wrap text-break';

        button.innerHTML = team.team + '<br>[';
        JSON.parse(localStorage.getItem('team-'+team.id)).forEach(function(names){
            button.innerHTML += names['name'] + '-';
        });
        button.innerHTML += ']';

        button.onclick = function () {
            localStorage.setItem('team', team.id);
            showTeamSet();
            //restructure();
        };

        div.appendChild(button);
        teams.appendChild(div);
    });
   // restructure();
}



function showTeamSet() {
    $('.navbar').hide();
    setMemberCount(localStorage.getItem(`team-${localStorage.getItem('team')}`));
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

         var colorCount =JSON.parse(localStorage.getItem('colorCount'));

         if(colorCount[localStorage.getItem('tee')] == 5){
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
    amountOfScoreButtons.forEach(function (score) {
        var div = document.createElement('div');

        div.className = 'p-1 m-0 col-3 col-sm-4 col-lg-3 grid-item';

        var button = document.createElement('BUTTON');
        button.className = 'btn-large btn-light col-12 border p-3 p-sm-4 p-lg-5 bigger-text rounded';
        button.innerHTML = score;
        button.onclick = function () {
          //  button.className += 'kader';
          setScore(score);
      };
      div.appendChild(button);
      scoreButtons.appendChild(div);
  });

    nameButtons.innerHTML = '';
    JSON.parse(localStorage.getItem('team-'+localStorage.getItem('team'))).forEach(function (names) {
        var div = document.createElement('div');

        div.className = 'p-1 m-0 col-3 col-sm-4 col-lg-3 grid-item';

        var button = document.createElement('BUTTON');
        button.className = 'btn-large btn-dark col-12 border p-2 p-sm-4 p-lg-5 bigger-text rounded';
        button.innerHTML = names['name'] + ` ` + localStorage.getItem(names.name) + 'x';

        button.onclick = function () {
            if(localStorage.getItem(names['name']) == 5){
                Swal.fire({
                    title: 'Helaas!',
                    text: "Deze speler heeft geen afslagen meer, kies een ander",
                    type: 'warning',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Ik snap het...'
                })
            } else {
                localStorage.setItem('member',names['name']);
                colorCheck.innerText = localStorage.getItem('member');
            }
        };
        div.appendChild(button);
        nameButtons.appendChild(div);
    });

    checkContainer.style.backgroundImage = "linear-gradient(#A0CABB,#A0CABB)";
    //restructure();
}


function setTee(color) {
    localStorage.setItem('tee', color);
    checkContainer.style.backgroundImage = "linear-gradient(#A0CABB,"+color+")";



}


function setScore(score) {
    localStorage.setItem('score', score);
    scoreCheck.innerText = score;
}



function saveHole() {
    if (localStorage.getItem('tee') && localStorage.getItem('score') && localStorage.getItem('member') !== `-`) {
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
                        updateMemberCount(localStorage.getItem('member'));
                        localStorage.setItem('member',`-`);
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
            text: "Teekleur, Afslag en Score ingevuld??",
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
    showTeamSet();
    showHole(hole);

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

    colorCheck.innerText = "XX";
    scoreCheck.innerText = "XX";
    holeCheck.innerText = hole;
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
    //log(result);
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
    replayButton.onclick = function () {
        restart();
    };
    replayButton.innerText = 'Start nieuwe ronde';
    replay.appendChild(replayButton);
    message.innerHTML = `Ronde volbracht, hieronder de resultaten.`;
    finished.style.display = `block`;
    setColorCount();
    setMemberCount(localStorage.getItem(`team-`+localStorage.getItem('team')));
}



function restart() {
    localStorage.clear();

    // localStorage.removeItem('team');
    // localStorage.removeItem('score');
    // localStorage.removeItem('tee');
    // localStorage.removeItem('hole');

    finished.style.display = 'none';

    results.innerHTML = '';
    replay.innerHTML = '';
    setColorCount();
    getNextTeamGame();
    generatePage();
}

// function initializeGrids() {
//     masonries = document.getElementsByClassName('gridddd');
//     Array.from(masonries).forEach(function (grid, index) {
//         masonriesElements[index] = new Masonry(grid, {
//             itemSelector: '.grid-item',
//         });
//     });
// }


// function restructure() {
//     //initializeGrids(); // added jv
//     masonriesElements.forEach(function (masonry) {
//         masonry.reloadItems();
//         masonry.layout();
//     });
// }


function getTeamScore() {
    var query = `SELECT s.hole,s.game,s.kleur,s.score,sum(s.score-h.par) as verschil,s.team as team FROM scores as s left join holes as h on h.hole=s.hole group by s.id having s.game =  ${localStorage.getItem('game')} and team = ${localStorage.getItem('team')}`;
    //Roep de generieke generate functie aan en geef daar de result van de query mee
    return executeQuery(query);
}
