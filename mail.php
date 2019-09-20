<?php
function getUserIpAddr() {
	if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
		//ip from share internet
		$ip = $_SERVER['HTTP_CLIENT_IP'];
	} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
		//ip pass from proxy
		$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
	} else {
		$ip = $_SERVER['REMOTE_ADDR'];
	}
	return $ip;
}

$agent = $_SERVER['HTTP_USER_AGENT'];
$ip = 'User Real IP - ' . getUserIpAddr();
$txt = $_POST['txt'];
$result = mail('jeroenverhoeve@gmail.com', 'App gebruikt', 'De app werd gebruikt ' . $ip . ' 
' . $agent . '\n'   . $txt);
if (!$result) {
	echo "Error";
} else {
	echo "Success";

}

?>