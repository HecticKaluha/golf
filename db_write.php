<?php
//require in plaats van include. zo voorkom je dat bij elke ajax call opnieuw db_connect wordt ingeladen in het bestand
require "db_connect.php";

switch ($_GET['method']) {
case 'saveScore':saveScore();
	break;
case 'getScores':getScores();
	break;
case 'executeQuery':executeQuery();
	break;
}

function saveScore() {
	$tee = $_POST['tee'];
	$score = $_POST['score'];
	$hole = $_POST['hole'];
	$team = $_POST['team'];
	$game = $_POST['game'];
	$member = $_POST['member'];

	$startHole = $_POST['startHole'];

	$sql = "INSERT INTO scores (id, team, hole, kleur, score,game,startHole,member)
            VALUES (NULL, '$team', '$hole', '$tee', '$score','$game','$startHole','$member')";

	$conn = null;

	try {
		$conn = dbConnect();

		if ($conn && !$conn->connect_error) {
			if (mysqli_query($conn, $sql)) {
				echo json_encode([
					"success" => true,
					"message" => "$team <br> $hole, $tee, $score<br> Verzonden!",
				]);
			} else {
				echo json_encode([
					"success" => false,
					"message" => "Query Error: " . mysqli_error($conn),
				]);
			}
		} else {
			echo json_encode([
				"success" => false,
				"message" => "Connection Failed " . $conn->connect_error,
			]);
		}
	} catch (Exception $e) {
		echo json_encode([
			"success" => false,
			"message" => "Error description: " . $e->getMessage(),
		]);
	}
}

function getScores() {
	echo getAllScores();
}

function executeQuery() {
	echo doQuery($_POST['query']);
}
