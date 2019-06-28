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






function klassement(jaar) {
    if (jaar == 2018){
        scoreTabel = 'scoresCup2018';
    } else {
        scoreTabel = 'scores';        
    }
    //var x = 0;
    kleur();
    var klasQuery = "select s.team AS team, teams.team as teamnaam,";
    for (i = 1; i < 19; i++) {
        klasQuery += (` sum(case when s.hole = ${i} then s.score end) AS H${i},`);
    }
    klasQuery += " sum(`s`.`score`) AS `totaal` , (select sum(s.score)-70) as '#' from ( " + scoreTabel + " `s` left join teams on teams.id = s.team left join `holes` `h` on(`h`.`hole` = `s`.`hole`))  group by `s`.`team` order by sum(`s`.`score`)";//where date_format(`s`.`datum`,'%Y-%m-%d') = curdate()

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
    </tr>`;
     var pos = 0;

    teamScore.forEach(function (teams) {
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

            //console.log(kleurObj[x][hole]['kleur']);
            table += "<td width=50px bgcolor= " + kleurObj[hole - 1]['kleur'] + ">";
            table += teams['H' + hole];
            table += "</td>";

        }
        table += `<td>` + teams['totaal']+ `</td><td bgcolor=${parKleur}>` + teams['#'] + `</td>`;

        table += "</tr>";
    });
    table += "</table>";
    // console.log(table);
    $("#klassement").html(table);
}




function kleur() {

    var query = "select  `s`.`team` AS `team`, sum(`s`.`score`) AS `totaal` from (`scores` `s` left join `holes` `h` on(`h`.`hole` = `s`.`hole`))  group by `s`.`team` order by sum(`s`.`score`)";// where date_format(`s`.`datum`,'%Y-%m-%d') = curdate()
    var dbResult = executeQuery(query);

    dbResult.forEach(function (teamId) {
        var kleurResult = executeQuery("select kleur from scores where team = " + teamId['team']); //+ " and DATE_FORMAT(datum, '%Y-%m-%d') = CURDATE() OR datum = DATE_ADD(CURDATE(), INTERVAL -1 DAY)"

        localStorage.setItem(teamId['team'], JSON.stringify(kleurResult));

    });
};

