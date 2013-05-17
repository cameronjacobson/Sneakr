<?php

session_start();
session_regenerate_id(true);

$_SESSION['loggedin'] = true;
echo get_encrypted_session();

function get_encrypted_session(){
	$data = array(
		'pubexponent'=>$_POST['pubexponent'],
		'modulus'=>$_POST['modulus'],
		'keylen'=>$_POST['keylen'],
		'sessionid' => session_id(),
		'sessionname'=>session_name()
	);

	$ch = curl_init();

	curl_setopt_array($ch, array(
		CURLOPT_URL => 'http://localhost:9700/?'.http_build_query($data),
		CURLOPT_RETURNTRANSFER => true,
	));

	return curl_exec($ch);
}
