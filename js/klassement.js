const par = [0,4,4,5,3,5,4,3,3,4,3,4,3,5,4,4,4,4,4];



$(document).ready(function () {
setTimeout(function(){
         window.location = window.location.href; 
         console.log('reload');
     }, 1000);

klassement("2018");
});



function klassement(game) {
  var klasse = {};
  var trArray = [];
  var datumKeuze = "";
  switch (game) {
    case `2018`:
      var scoreTabel = 'scoresCup2018'
      break;
    case `2019`:
      var scoreTabel = 'scores';
      break;
    case `datum`:
      var scoreTabel = 'scores';
      var datumKeuze = `having ( date_format(s.datum,'%Y-%m-%d') between CURDATE() - INTERVAL 10 DAY AND curdate())`
      break;
    case `today`:
      var scoreTabel = 'scores';
      var datumKeuze = `having ( date_format(s.datum,'%Y-%m-%d') = CURDATE())`
      break;

    default:
      // code block
  }


  var klasQuery = `select s.datum, s.team AS team, teams.team as teamnaam,`;
  for (i = 0; i < 19; i++) {
    klasQuery += (` sum(case when s.hole = ${i} then s.score end) AS H${i}`);
    if (i < 18) {
      klasQuery += ",";
    }
  }

  klasQuery += " ,s.game, s.startHole from " + scoreTabel + " `s`  left join teams on teams.id = s.team  left join `holes` `h` on(`h`.`hole` = `s`.`hole`)  group by `s`.`team`, s.game " + datumKeuze;
  //  having ( date_format(s.datum,'%Y-%m-%d') between curdate() - 10 DAY AND curdate() )
  // date_format(s.datum,'%Y-%m-%d') = curdate() - INTERVAL 1 DAY |||| s.game > " + dagGame + "
  //log(klasQuery);
  var dbResult = executeQuery(klasQuery);
  dbResult.forEach(function(teams) {

    var teamRow = "";
    var totaal = 0;
    var team = teams['team'];
    var teamNaam = teams['teamnaam'];
    var game = teams['game'];
    var startHole = teams['startHole'];
    var kleurObj = executeQuery(`SELECT kleur FROM ${scoreTabel} WHERE team = ${team} and game = ${game} order by id`);

    teamRow += `<tr><td  colspan=22 class=text-left>${teamNaam}</td></tr><tr><td></td>`;

    //log(startHole);



    // hier moet starthole 10 iets anders gaan doen
    if (parseFloat(startHole) == 10) {
      log(`startHole=` + startHole);
      kleurObj = reOrder(kleurObj);

    }



    for (hole = 1; hole < 19; hole++) {
      var scoreBorder = ``;

      // heeft het team deze hole nog niet gespeeld dan wordt de score volgens par opgehaald
      // om een projected score te kunnen bepalen
      if (!teams['H' + hole]) {
        score = par[hole];
        totaal += parseFloat(score);
        var bgColor = 'grey';

      } else {
        score = teams['H' + hole];
        totaal += parseFloat(score);
        styleId = `<div class=\"circle\">`;

        if (!kleurObj[hole - 1]) {
          bgColor = 'grey';
        } else {
          var bgColor = kleurObj[hole - 1]['kleur'];
        }
      }

      if (score < par[hole]) {
        scoreBorder += `<div class=\"birdie\">`;
      }
      if (score > par[hole]) {
        scoreBorder += `<div  class=\"bogey\">`;
      }


      teamRow += `<td  width=4%  bgcolor= ${bgColor}> ${scoreBorder}`;


      teamRow += score;
      if (styleId != ``) {
        teamRow += `</div>`;
      }
      teamRow += "</td>";
    }

    var parKleur = 'marineblue';
    if ((totaal - 70) < 0) {
      var parKleur = 'red';
    } else if ((totaal - 70) == 0) {
      var parKleur = 'silver';
    }

    teamRow += `<td>` + totaal + `</td><td bgcolor=${parKleur}>` + (totaal - 70) + `</td></tr>`;
    trArray.push([totaal, team, teamNaam, teamRow]);
  });

  renderKlassement(trArray);
};



function reOrder(kleurObj) {
  var reOrdered = [];
  for (i = 9; i < 18; i++) {
    reOrdered.push(kleurObj[i]);
  }
  for (i = 0; i < 9; i++) {
    reOrdered.push(kleurObj[i]);
  }

  return (reOrdered);
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
  var prevTotal = "";
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
    tableRow = row[3];
    tableRow = tableRow.replace("<tr>", "<tr><td>" + pos + posT + "</td>");
    table += tableRow;

  });

  table += "</table>";
  $("#results").html(table);
  focus();
}

