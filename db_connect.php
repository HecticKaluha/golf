<?php

// Create connection
function dbConnect() {
	$servername = "localhost";
	$username = "jroea";
	$password = "hf4a9NZ2-";
	$dbname = "jroea_2";


	mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

	try {
		return @mysqli_connect($servername, $username, $password, $dbname);
	} catch (mysqli_sql_exception $e) {
		throw $e;
	}
}

function getAllScores() {
	$conn = null;

	try {
		$conn = dbConnect();
		if (!$conn->connect_error) {
			$stmt = $conn->prepare("SELECT * FROM scores WHERE team = '99'");
			//$stmt = $conn->prepare($vraag);

			//voor voorbeeld hoe je parameters moet binden zie https://www.w3schools.com/php/php_mysql_prepared_statements.asp
			//            $stmt->bind_param();

			//returned true wannneer query succesvol is uitgeverd
			//false wanneer fout gaat
			if ($stmt->execute()) {
				return json_encode([
					"success" => true,
					"message" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC),
				]);
			} else {
				return json_encode([
					"success" => false,
					"message" => "Query Error: Query kon niet succesvol uitgevoerd worden",
				]);
			}
		} else {
			return json_encode([
				"success" => false,
				"message" => "Connection Failed " . $conn->connect_error,
			]);
		}
	} catch (Exception $e) {
		return json_encode([
			"success" => false,
			"message" => "Error description: " . $e->getMessage(),
		]);
	}
}

function doQuery($query) {
	$conn = null;

	try {
		$conn = dbConnect();
		if (!$conn->connect_error) {
			$stmt = $conn->prepare($query);

			//voor voorbeeld hoe je parameters moet binden zie https://www.w3schools.com/php/php_mysql_prepared_statements.asp
			//            $stmt->bind_param();

			//returned true wannneer query succesvol is uitgeverd
			//false wanneer fout gaat
			if ($stmt->execute()) {
				return json_encode([
					"success" => true,
					"message" => $stmt->get_result()->fetch_all(MYSQLI_ASSOC),
				]);
			} else {
				return json_encode([
					"success" => false,
					"message" => "Query Error: Query kon niet succesvol uitgevoerd worden",
				]);
			}
		} else {
			return json_encode([
				"success" => false,
				"message" => "Connection Failed " . $conn->connect_error,
			]);
		}
	} catch (Exception $e) {
		return json_encode([
			"success" => false,
			"message" => "Error description: " . $e->getMessage(),
		]);
	}
}