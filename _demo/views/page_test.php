<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?=$title?></title>
    <script src="/js/jquery-3.4.0.min.js"></script>
    <!--Стили -->
    <link href="/css/style.css" rel="stylesheet">
    <!--Функции страницы-->
    <script src="/js/app.js"></script>
    
    <style>
		/*Пример комментария*/
		.menu {
			font-size: 18px;
		}
	</style>
</head>

<body>
	<div><a class="menu" href="/">МЕНЮ</a></div>
	<br />
	<br />
	<h2 class="title"><?=$test_name?></h2>
    <div style="text-align:center">
    	<img src="<?=$img_src?>" style="width:30%" />
    	<video src="/asset/sample.mp4" preload="auto" controls="controls" style="width:30%"></video>
   	</div>
</body>
</html>
<script>
/*Пример комментария*/
$(document).ready(function(e) {
	//Пример комментария
	console.log('document ready');
});
</script>