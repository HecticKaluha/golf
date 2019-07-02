const par = [0,4,4,5,3,5,4,3,3,4,3,4,3,5,4,4,4,4,4];






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

function klassement(game) {
    var klasse = {};
    var trArray = [];
    if (game == '2018'){
        var scoreTabel = 'scoresCup2018';

    } else {
        var scoreTabel = 'scores';  
    }

    var klasQuery = "select  s.team AS team, teams.team as teamnaam,";

    for (i = 1; i < 19; i++) {
        klasQuery += (` sum(case when s.hole = ${i} then s.score end) AS H${i}`);
        if (i < 18){
            klasQuery += ",";
        }
    }

    //klasQuery += " sum(`s`.`score`) AS `totaal` , (select sum(s.score)-70) as '#' from ( " + scoreTabel + " `s` left join teams on teams.id = s.team   "  +  gameJoin + "   left join `holes` `h` on(`h`.`hole` = `s`.`hole`))  group by `s`.`team` order by sum(`s`.`score`)";//where date_format(`s`.`datum`,'%Y-%m-%d') = curdate()  |||| , `s`.game`
    klasQuery += " ,s.game from " + scoreTabel + " `s` left join teams on teams.id = s.team  left join `holes` `h` on(`h`.`hole` = `s`.`hole`)  group by `s`.`team`, s.game ";//where date_format(`s`.`datum`,'%Y-%m-%d') = curdate()  |||| , `s`.game`

    //console.log(klasQuery);
    var dbResult = executeQuery(klasQuery);
    dbResult.forEach(function (teams) {
        var teamRow = "";
        var totaal = 0;
        var team = teams['team'];
        var teamNaam = teams['teamnaam'];
        var game = teams['game'];
        var kleurObj = executeQuery(`SELECT kleur FROM ${scoreTabel} WHERE team = ${team} and game = ${game} order by id`);

        teamRow += `<tr><td class=teamNaam>${teamNaam}</td>`;

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


            teamRow += `<td bgcolor= ${bgColor}> ${scoreBorder}`;


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

        teamRow += `<td>` + totaal + `</td><td bgcolor=${parKleur}>`  + (totaal-70) + `</td>`;

        teamRow += "</tr>";
        trArray.push([totaal, team, teamNaam, teamRow]);
         //        log(trArray);

    });

    renderKlassement(trArray);
};







function renderKlassement(trArray){
    trArray.sort(function(a,b){
        return a[0]-b[0];
    });
    console.log(trArray);

    var table = `<table class='klassement'><tr><td>Pos.</td><td>teamnaam</td>`;
    for (h = 1 ; h < 19 ; h++){
        table += `<td>H` + h + `<br>${par[h]}</td>`
    }
    table += `<td>Projected</td><td>#</td></tr>`;
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
    $("#klassement").html(table);
}











