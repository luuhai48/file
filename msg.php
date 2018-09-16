<?php 
session_start();
if(isset($_POST['submit']))
	if ($_POST['message'] != '' AND $_POST['message'] != null){
		$con = mysql_connect("sql306.unaux.com", "unaux_22448312") or $con = mysql_connect("sql306.unaux.com", "unaux_22448312", "Luuviet1234");
		if (!$con){
		  die('Could not connect: ' . mysql_error());}
		mysql_select_db("unaux_22448312_chat", $con);
		$message=$_POST['message'];
		$sender=$_POST['sender'];
		mysql_query("INSERT INTO message(message, sender)VALUES('$message', '$sender')");
	}else Header("Location: /msg");

function simple_regex($rule, $text){
    preg_match($rule, $text, $m);
    return empty($m[0]) ? "" : $m[0];
}

?>
<!DOCTYPE html>
<html class="no-js" lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="theme-color" content="#555555">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Simple Message</title>
<link rel="icon" href="data:;base64,iVBORw0KGgo=">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
<style type="text/css">
    body{font-family:Arial}.content{padding:0 20%}.nav-pills>li>a{padding:5px}.badge{background-color:red}.list-group-item{padding:7px}.form-control{margin-bottom:20px}@media only screen and (max-width:600px){.content{padding:0 2%}}@media only screen and (max-width:768px){.content{padding:0 2%}}@media screen and (max-width:992px){.content{padding:0 2%}}@media screen and (max-width:1200px){.content{padding:0 2%}}
</style>
</head>
<body>
<ul class="nav nav-pills" style="background-color: #424242">
    <li><a href="/" style="color:white"><b>Home</b></a></li>
    <li><a href="/read.php" style="color:white" title="Các truyện đã đọc">Đã đọc</a></li>
    <li class="active"><a href="/msg/" title="Msg" style="color:white">Msg</a></li>
</ul><br><br>
<form method="POST">
<div class="content">
<ul class="list-group">
<?php
$con = mysql_connect("sql306.unaux.com", "unaux_22448312") or $con = mysql_connect("sql306.unaux.com", "unaux_22448312", "Luuviet1234");
if (!$con){
  die('Could not connect: ' . mysql_error());}
mysql_select_db("unaux_22448312_chat", $con);
$result = mysql_query("SELECT * FROM message ORDER BY id DESC");
while($row = mysql_fetch_array($result)){
	$msg = preg_replace("/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/",'<a href="/r.php?url=' . simple_regex("/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/",$row['message']) . '" target="_blank">' . simple_regex("/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/",$row['message']) . '</a>', $row['message']);
	echo '<li class="list-group-item">' . $msg . '<a class="badge">' . $row['sender'].'</a></li>';
}
mysql_close($con);
?>
</ul>
<center>
<input name="sender" type="text" class="form-control" value="<?php echo $sender ?>" placeholder="Name"/>
<input name="message" type="text" class="form-control" placeholder="Message"/>
<input name="submit" type="submit" value="Send" class="btn btn-primary" />
</center><br><br><br>
</div>
</form>
</body>
</html>
