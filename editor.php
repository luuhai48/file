<?php 
if (isset($_POST['content'])){
	function editfile($filename,$text){
		$file = fopen($filename,'w');
		echo fwrite($file,$text);
		fclose($file);
		header("Location: editor.php");
	}
		$text = $_POST['content'];
		$filename = $_POST['filename'];
		$filename2 = $_POST['filename2'];
		if ($filename != $filename2){
			if(file_exists($filename)) {
				die('File Already Exists');
			}else {
				editfile($filename2,$text);
				rename($filename2, $filename);
			}
		}else {
			editfile($filename,$text);
		}
		
	}
if (isset($_POST['content2'])){
	function newfile($filename,$text){
		$file = fopen($filename,'w+');
		echo fwrite($file,$text);
		fclose($file);
		header("Location: editor.php");
	}
		$text = $_POST['content2'];
		$filename = $_POST['filename'];
		$file = $_POST['filedir'] . '/' . $filename;
		if(file_exists($file)) {
			die('File Already Exists');
		}else newfile($file,$text);
	}
if (isset($_POST['newfolder'])){
	function newfolder($folderdir,$dir){
		mkdir($folderdir);
		header("Location: editor.php?dir=" . $dir);
	}
	$directory = $_POST['dir'];
	$foldername = $_POST['newfolder'];
	if ($directory == null)
			$folderdir = $foldername;
		else $folderdir = $directory .'/'. $foldername;
	if (!file_exists($folderdir)){
		newfolder($folderdir,$directory);
	}
}
if (isset($_GET['del']))
	if(!file_exists($_GET['del'])) {
		  die("File not found");
	}else {
		unlink($_GET['del']);
		header("Location: editor.php");
	}
if (isset($_GET['newfile'])): ?>
<!DOCTYPE html>
<html>
<head>
	<title>Create New File</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
	<style type="text/css">
		html,body{
			padding: 0 6%;
		}
		.content {margin-top:20px;}
		textarea {
		  resize: none;
		}
	</style>
</head>
<body>
<div class="content">
	<form action="editor.php" method="POST">
	<input type="hidden" name="filedir" value="<?php echo $_GET['newfile'] ?>"/>
	<input type="text" name="filename" placeholder="File Name:"/><br>
	<textarea id="content2" name="content2" rows="28" cols="150" placeholder="Enter The Code Here"></textarea><br>
	<input type="submit" value="Submit" class="btn btn-success" style="width:100px"/>
	<a class="btn btn-danger" href="/editor.php">Cancel</a>
	</form>
</div>
</body>
</html>
<?php endif; ?>
<?php	
if (isset($_GET['newfile'])==false):
	$layout = isset($_GET['edit']) ? 'submit' : 'view';
	if ($layout === 'submit') :
?>
<!DOCTYPE html>
<html>
<head>
	<title>Edit: <?php echo $_GET['edit']; ?></title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
	<style type="text/css">
		html,body{
			padding: 0 6%;
		}
		.content {margin-top:20px;}
		textarea {
		  resize: none;
		}
	</style>
</head>
<body>
<div class="content">
	<form action="editor.php" method="POST">
	<input type="text" name="filename" value="<?php echo $_GET['edit']; ?>"/><a href="/editor.php?del=<?php echo $_GET['edit']; ?>" class="btn btn-link" style="color:red" onclick="return confirm('Are you sure?');">Delete</a><br>
	<input type="hidden" name="filename2" value="<?php echo $_GET['edit'] ?>"/>
	<textarea id="content" name="content" rows="28" cols="150" placeholder="Enter The Code Here"><?php
		$file = file_get_contents($_GET['edit']);
		echo htmlentities($file);
	?></textarea><br>
	<input type="submit" value="Submit" class="btn btn-success" style="width:100px"/>
	<a class="btn btn-danger" href="/editor.php">Cancel</a>
	</form>
</div>
</body>
</html>
	<?php endif; ?>
<?php if ($layout === 'view') : 
	$dir = '';
 if (isset($_GET['dir'])){
 		$dir = getcwd() . '/' . $_GET['dir'];
 		$dir2 = $_GET['dir'];
	}else {$dir = getcwd() . '/'; $dir2 = '';}
	$items = array();
	$folders = array();
	foreach (scandir($dir) as $item){
		$item_dir = '';
		if ($dir2 == '') $item_dir = $item;
		else $item_dir = $dir2 . '/' . $item;
		if (is_dir($item_dir))
			array_push($folders,$item);
		else array_push($items, $item);
	}
 $folders = array_diff($folders, array('.','..'));
 $files = array_diff($items,array('editor.php'));
?>
<!DOCTYPE html>
<html>
<head>
	<title>OnHost File Editor</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
	<style type="text/css">
		html,body{
			padding: 0 15%;
		}
		.content {margin-top:50px; text-align: center}
	</style>
</head>
<body>
<div class="content">
	<form action="editor.php" method="GET">
	<label>Select Folder: </label>
	<div class="folderlist">
		<ul style="list-style-type: none">
		<?php foreach ($folders as $fd): ?>
			<li><a href="editor.php?dir=<?php
				if ($dir2 == '')
					echo $fd;
				else echo $dir2. '/' . $fd; ?>" style="margin-left: -40px"><?php echo $fd; ?></a></li>
		<?php endforeach; ?>
		</ul>
	</div>
	<hr>
	<label>Select File To Edit: </label>
	<select name="edit">
	<?php foreach ($files as $fl): ?>
		<option value="<?php 
		if ($dir2 == '')
			echo $fl;
		else
			echo $dir2.'/'.$fl; ?>"><?php echo $fl; ?></option>
	<?php endforeach; ?>
	</select>
	<input class="btn btn-danger" type="submit" value="Edit" />
	</form>
	<hr>
	<label>Create New File: </label>
	<form method="GET">
	<input type="hidden" name="newfile" value="<?php echo $dir2; ?>" />
	<input class="btn btn-primary" type="submit" value="New File"/>
	</form>
	<hr>
	<label>Create New Folder: </label>
	<form method="POST">
	<input type="text" name="newfolder" style="width:150px;padding:3px"/>
	<input type="hidden" name="dir" value="<?php echo $dir2; ?>" />
	<input class="btn btn-info" type="submit" value="New Folder"/>
	</form>
</div>
</body>
</html>
	<?php endif; ?>
<?php endif; ?>
