const colors = ['red', 'blue', 'yellow', 'white'];
const amountOfScoreButtons = ['1', '2', '3', '4', '5', '6', '7', '8'];

var masonries = [];
var masonriesElements = [];

$(document).ready(function () {
    // if (!parseFloat(localStorage.getItem('hole')) || parseFloat(localStorage.getItem('hole')) > 18) {
    //     localStorage.setItem('hole', 1);
    // }

    setCookie('sessie', 'een uur', 1);

    generatePage();
});

function generatePage() {
    //teamSet zoekt automatisch in de DOM naar een element met id="teamSet"
    teamSet.style.display = noTeamSet.style.display = 'none';

    var hole = localStorage.getItem('hole');
    showHole(hole);

    //init alle grids tegelijkertijd
    initializeGrids();

    if (getTeamFromURL()) {
        showTeamSet();
    } else {
        showNoTeamSet();
    }
    restructure();
}

function getTeamFromURL() {
    //check if exists in localstorage
    if (localStorage.getItem('team')) {
        return true;
    }
    //check in url
    else {
        //bouw url
        var url = new URL(window.location.href);
        //vraag url parameter team op
        var team = url.searchParams.get("team");
        //team in url gevonden
        if (team) {
            localStorage.setItem('team', team);
            return true;
        }
        //team niet gevonden in url
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
    noTeamSet.remove();

    teamSet.style.display = 'block';

    colors.forEach(function (color) {
        var div = document.createElement('div');
        div.className = 'p-1 col-6 col-sm-3 grid-item';

        var button = document.createElement('BUTTON');
        button.className = 'btn-large col-12 border text-secondary p-3 p-sm-4 p-lg-5 bigger-text rounded';
        button.innerHTML = color;
        button.style.backgroundColor = color;

        button.onclick = function () {
            setTee(color);
        };

        div.appendChild(button);
        teeButtons.appendChild(div);
    });

    amountOfScoreButtons.forEach(function (score) {
        var div = document.createElement('div');
        div.className = 'p-1 col-4 col-sm-4 col-lg-3 grid-item';

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
    colorCheck.innerText = color;
}

function setScore(score) {
    localStorage.setItem('score', score);
    scoreCheck.innerText = score;
}

function saveHole() {
    if (localStorage.getItem('tee') !== 'geen' && localStorage.getItem('score') > 0) {
        $.ajax({
            url: "db_write.php?method=saveScore",
            data: {
                team: localStorage.getItem('team'),
                hole: localStorage.getItem('hole'),
                tee: localStorage.getItem('tee'),
                score: localStorage.getItem('score')
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
            title: 'Onvolledige data',
            text: "Zorg ervoor dat je een tee en een score hebt ingevuld voor deze hole",
            type: 'warning',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ik begrijp het, sorry...'
        })
    }
}

function showHole(hole) {
    //if not set set to 0
    if(!hole){
        hole = 1;
    }
    if (hole > 18) {
        finishGame();
    } else {
        renderHole(hole);
    }
}

function nextHole(){
    var hole = parseFloat(localStorage.getItem('hole'));
    hole++;
    localStorage.setItem('hole', hole);
    showHole(hole);
}

function renderHole(hole) {
    localStorage.setItem('score', 0);
    localStorage.setItem('tee', 'geen');
    localStorage.setItem('hole', hole);

    colorCheck.style.color = "black";
    colorCheck.innerText = "-";

    scoreCheck.innerText = "-";

    //holecheck zoekt automatisch in de DOM naar een element met id="holeCheck"
    //zie voor extra uitleg https://www.tjvantoll.com/2012/07/19/dom-element-references-as-global-variables/
    holeNumber.innerText = holeCheck.innerText = hole;

    checkContainer.style.backgroundColor = '#f8f9fa';
}

//omdat je nu een string gebruikt om je query op te bouwen hoef je kolomnamen niet tussen quotes te zetten (zie hieronder)
//door gebruik te maken van apostrophes (geen quotes ' of dubbele quotes " ) kun je direct javascript variables gebruiken
//als je ze zet tussen ${variable} (zie queries hieronder met localstorage)
//zie https://developer.mozilla.org/nl/docs/Web/JavaScript/Reference/Template_literals voor verdere uitleg
var iets = `select SUM(score) as TOTAAL FROM scores WHERE team = ${localStorage.getItem('team')}`;
var iets = `SELECT team,scores.hole,score,kleur FROM scores LEFT join holes ON holes.hole = scores.hole`;

function getAllScores() {
    var query = `select team, hole,kleur, score from scores`;
    //Roep de generieke generate functie aan en geef daar de result van de query mee
    return executeQuery(query);
}

function getAllScoresOrdered() {
    var query = `select * from scores order by score desc`;
    //Roep de generieke generate functie aan en geef daar de result van de query mee
    return executeQuery(query);
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

function renderTable(jsonResult) {
    queryResult.innerHTML =
        `<table class="table table-bordered table-striped">
                                <thead>
                                    <tr role="row" id="thead">
                                    
                                    </tr>
                                </thead>
                                <tbody id="tbody">
                                
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
                thead.appendChild(theader);
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
        tbody.appendChild(tableRow);
    });
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

function testQuery() {
    //vul hier je query in, wanneer je op de knop klikt zal het resultaat zichtbaar worden op het scherm
    var query = `Select team, kleur from scores where kleur = 'blue'`;
    var dbResult = executeQuery(query);
    //deze regel mag weg zodra de testquery knop uit de app gehaald wordt.
    message.style.display = `none`;
    renderTable(dbResult);
}

function finishGame() {
    renderTable(getAllScores());
    playing.style.display = 'none';
    message.style.display = `block`;
    message.innerHTML = `Het spel is afgelopen, hieronder staan de resultaten.`;
}