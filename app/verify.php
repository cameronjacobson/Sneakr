<?php

session_start();

echo 'SESSION ID: '.session_id();
echo '<br /><br />';

if(empty($_SESSION['loggedin'])){
	echo 'Not logged in';
}
else{
	echo 'successfully logged in';
}
