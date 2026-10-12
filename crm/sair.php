<?php
session_name("crmimob");
session_start();
$_SESSION = [];
session_destroy();
header("Location: index.php");
exit;
